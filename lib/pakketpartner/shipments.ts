import type { WcOrder } from '@/lib/woocommerce/orders'
import { getDeliveryDateYmd, ymdToIsoDate } from '@/lib/woocommerce/order-display'
import { pickCarrierServiceForOrder } from '@/lib/pakketpartner/carriers'
import {
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

function cacheShipment(shipment: PpShipment) {
  const ref = normalizeRef(shipment.order_reference || '')
  if (!ref) return
  if (!shipmentIndex) shipmentIndex = new Map()
  shipmentIndex.set(ref, shipment)
  shipmentIndexAt = Date.now()
}

/** Probeer één shipment via cache of API-filter (sneller dan volledige scan). */
export async function findShipmentByOrderNumber(orderNumber: string): Promise<PpShipment | null> {
  const ref = normalizeRef(orderNumber)
  if (!ref) return null

  if (shipmentIndex && Date.now() - shipmentIndexAt < INDEX_TTL_MS) {
    const cached = shipmentIndex.get(ref)
    if (cached) return cached
  }

  const queries = [
    `shipments?order_reference=${encodeURIComponent(ref)}`,
    `shipments?filter[order_reference]=${encodeURIComponent(ref)}`,
    `shipments?search=${encodeURIComponent(ref)}`,
  ]

  for (const query of queries) {
    try {
      const res = await ppFetchJson<{ data: PpShipment[] }>(query)
      const match = (res.data || []).find(
        (s) => normalizeRef(s.order_reference || '') === ref
      )
      if (match) {
        cacheShipment(match)
        return match
      }
    } catch {
      // probeer volgende query-variant
    }
  }

  return null
}

/**
 * Zoek shipments op ordernummer (order_reference).
 * Eerst parallel per order; daarna alleen nog pagina's scannen voor restanten.
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

  const maxPages = opts?.maxPages ?? 15
  const foundMap = new Map<string, PpShipment>()
  const stillMissing = new Set(wanted)

  // Cache hits
  if (shipmentIndex && Date.now() - shipmentIndexAt < INDEX_TTL_MS) {
    for (const num of wanted) {
      const hit = shipmentIndex.get(num)
      if (hit) {
        foundMap.set(num, hit)
        stillMissing.delete(num)
      }
    }
  }

  // Parallel per-order lookup (meestal 1 API-call per order)
  const lookupTargets = [...stillMissing]
  if (lookupTargets.length) {
    const lookups = await Promise.all(
      lookupTargets.map(async (num) => {
        const shipment = await findShipmentByOrderNumber(num)
        return shipment ? { num, shipment } : null
      })
    )
    for (const hit of lookups) {
      if (!hit) continue
      foundMap.set(hit.num, hit.shipment)
      stillMissing.delete(hit.num)
    }
  }

  // Fallback: scan recente pagina's voor restanten
  if (stillMissing.size > 0) {
    const index = shipmentIndex ?? new Map<string, PpShipment>()
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
  }

  return {
    found: wanted
      .filter((n) => foundMap.has(n))
      .map((orderNumber) => ({ orderNumber, shipment: foundMap.get(orderNumber)! })),
    missing: [...stillMissing],
  }
}

export { pickCarrierServiceForOrder } from '@/lib/pakketpartner/carriers'

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
  carrierService?: string
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
      const createResults = await Promise.all(
        stillMissing.map(async (num) => {
          const order = byNumber.get(num)
          if (!order) return { num, shipment: null as PpShipment | null }
          try {
            const shipment = await createShipmentForOrder(order, {
              print: true,
              carrierService: options.carrierService,
            })
            return { num, shipment }
          } catch {
            return { num, shipment: null }
          }
        })
      )
      for (const { num, shipment } of createResults) {
        if (!shipment) continue
        shipmentIds.push(shipment.id)
        created.push(num)
        const idx = stillMissing.indexOf(num)
        if (idx >= 0) stillMissing.splice(idx, 1)
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
