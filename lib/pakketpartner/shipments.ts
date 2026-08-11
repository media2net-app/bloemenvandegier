import type { WcOrder } from '@/lib/woocommerce/orders'
import { getDeliveryDateYmd, getShippingSlot, ymdToIsoDate } from '@/lib/woocommerce/order-display'
import {
  getCarrierServiceAvond,
  getCarrierServiceOverdag,
  getPakketpartnerSenderHash,
  ppFetchJson,
  ppFetchPdf,
  type PpShipment,
} from '@/lib/pakketpartner/client'

const INDEX_TTL_MS = 2 * 60 * 1000

/** In-memory cache van recente shipments (order_reference → shipment). */
let shipmentIndex: Map<string, PpShipment> | null = null
let shipmentIndexAt = 0

function normalizeRef(ref: string | number) {
  return String(ref).replace(/^#/, '').trim()
}

export function invalidatePakketpartnerShipmentIndex() {
  shipmentIndex = null
  shipmentIndexAt = 0
}

async function fetchShipmentPage(page: number): Promise<{ data: PpShipment[]; total: number }> {
  const res = await ppFetchJson<{ data: PpShipment[]; total?: number; count?: number }>(
    `shipments?page=${page}`
  )
  return {
    data: Array.isArray(res.data) ? res.data : [],
    total: res.total ?? res.count ?? 0,
  }
}

/**
 * Zoek shipments op ordernummer (order_reference).
 * Scant recente pages tot alles gevonden is of maxPages bereikt.
 */
export async function findShipmentsByOrderNumbers(
  orderNumbers: Array<string | number>,
  opts?: { maxPages?: number }
): Promise<{
  found: Array<{ orderNumber: string; shipment: PpShipment }>
  missing: string[]
}> {
  const wanted = [...new Set(orderNumbers.map(normalizeRef).filter(Boolean))]
  if (!wanted.length) return { found: [], missing: [] }

  const maxPages = opts?.maxPages ?? 30
  const index =
    shipmentIndex && Date.now() - shipmentIndexAt < INDEX_TTL_MS
      ? shipmentIndex
      : new Map<string, PpShipment>()

  const foundMap = new Map<string, PpShipment>()
  const stillMissing = new Set(wanted)

  for (const num of wanted) {
    const hit = index.get(num)
    if (hit) {
      foundMap.set(num, hit)
      stillMissing.delete(num)
    }
  }

  for (let page = 1; page <= maxPages && stillMissing.size > 0; page++) {
    const { data } = await fetchShipmentPage(page)
    for (const shipment of data) {
      const ref = normalizeRef(shipment.order_reference || '')
      if (!ref) continue
      if (!index.has(ref)) index.set(ref, shipment)
      if (stillMissing.has(ref)) {
        foundMap.set(ref, shipment)
        stillMissing.delete(ref)
      }
    }
    if (!data.length) break
  }

  shipmentIndex = index
  shipmentIndexAt = Date.now()

  return {
    found: wanted
      .filter((n) => foundMap.has(n))
      .map((orderNumber) => ({ orderNumber, shipment: foundMap.get(orderNumber)! })),
    missing: [...stillMissing],
  }
}

export function pickCarrierServiceForOrder(order: WcOrder): string {
  const slot = getShippingSlot(order)
  if (slot === 'overdag') return getCarrierServiceOverdag()
  return getCarrierServiceAvond()
}

function buildRecipientFromOrder(order: WcOrder) {
  const ship = order.shipping || order.billing
  const bill = order.billing
  const address1 = (ship?.address_1 || '').trim()
  const address2 = (ship?.address_2 || '').trim()

  // Checkout gebruikt address_2 vaak als huisnummer
  const looksLikeHouseNumber = /^\d+[a-zA-Z]?(?:[-\s]?\d*[a-zA-Z]?)?$/.test(address2)

  const recipient: Record<string, string | null> = {
    company_name: ship?.company || null,
    first_name: ship?.first_name || bill?.first_name || '',
    last_name: ship?.last_name || bill?.last_name || '',
    zipcode: ship?.postcode || '',
    city: ship?.city || '',
    country: (ship?.country || 'NL').toUpperCase(),
    email: bill?.email || ship?.email || null,
    phone: ship?.phone || bill?.phone || null,
  }

  if (looksLikeHouseNumber && address1) {
    recipient.street = address1
    recipient.house_number = address2
  } else {
    recipient.address_line_1 = [address1, address2].filter(Boolean).join(' ')
  }

  return recipient
}

export async function createShipmentForOrder(
  order: WcOrder,
  opts?: { print?: boolean; carrierService?: string }
): Promise<PpShipment> {
  const { assertOrderDashboardWritesAllowed } = await import(
    '@/lib/order-dashboard/test-mode'
  )
  assertOrderDashboardWritesAllowed()

  const deliveryYmd = getDeliveryDateYmd(order)
  const body: Record<string, unknown> = {
    order_reference: String(order.number),
    sender_hash: getPakketpartnerSenderHash(),
    carrier_service: opts?.carrierService || pickCarrierServiceForOrder(order),
    recipient: buildRecipientFromOrder(order),
    packages: [{ weight: 2000 }],
    print: opts?.print !== false,
    products: (order.line_items || []).slice(0, 20).map((item) => ({
      external_id: String(item.product_id || item.id),
      name: item.name,
      product_code: item.sku || String(item.product_id || ''),
      quantity: item.quantity,
      price_including_vat: Number.parseFloat(item.total) || undefined,
    })),
  }

  if (deliveryYmd) {
    body.delivery_date = ymdToIsoDate(deliveryYmd)
  }

  const res = await ppFetchJson<{ data: PpShipment }>('shipments', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  invalidatePakketpartnerShipmentIndex()
  return res.data
}

/** Combined A4 PDF for one or more shipment IDs. */
export async function fetchLabelsPdf(shipmentIds: string[]): Promise<Buffer> {
  const unique = [...new Set(shipmentIds.filter(Boolean))]
  if (!unique.length) {
    throw new Error('Geen shipment IDs voor labels')
  }
  const qs = unique.map((id) => `shipments[]=${encodeURIComponent(id)}`).join('&')
  return ppFetchPdf(`shipments/labels?${qs}`)
}

/**
 * Zoek bestaande labels; maak ontbrekende aan vanuit WC-orders.
 * Retourneert PDF buffer.
 */
export async function resolveLabelsPdf(options: {
  orders: WcOrder[]
  createMissing?: boolean
}): Promise<{
  pdf: Buffer
  shipmentIds: string[]
  created: string[]
  missing: string[]
}> {
  const refs = options.orders.map((o) => String(o.number))
  const { found, missing } = await findShipmentsByOrderNumbers(refs)

  const shipmentIds = found.map((f) => f.shipment.id)
  const created: string[] = []
  const stillMissing = [...missing]

  if (options.createMissing && stillMissing.length) {
    const { isOrderDashboardTestMode } = await import('@/lib/order-dashboard/test-mode')
    if (!isOrderDashboardTestMode()) {
      const byNumber = new Map(options.orders.map((o) => [String(o.number), o]))
      for (const num of [...stillMissing]) {
        const order = byNumber.get(num)
        if (!order) continue
        try {
          const shipment = await createShipmentForOrder(order, { print: true })
          shipmentIds.push(shipment.id)
          created.push(num)
          stillMissing.splice(stillMissing.indexOf(num), 1)
        } catch {
          // laat in missing staan
        }
      }
    }
  }

  if (!shipmentIds.length) {
    throw new Error(
      stillMissing.length
        ? `Geen Pakketpartner-labels gevonden voor: ${stillMissing.slice(0, 10).join(', ')}`
        : 'Geen labels om te printen'
    )
  }

  const pdf = await fetchLabelsPdf(shipmentIds)
  return { pdf, shipmentIds, created, missing: stillMissing }
}
