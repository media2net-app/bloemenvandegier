import type { WcOrder } from '@/lib/woocommerce/orders'
import { parseDeliveryDateToYmd } from '@/lib/woocommerce/order-display'

/** Zelfde opties als live order-formulier op bloemenvandegier.nl */
export const ORDER_FORM_SHIPPING_OPTIONS = [
  { value: 'Avondlevering (17:00 - 22:00)', price: 5.96 },
  { value: 'Levering overdag', price: 5.96 },
  { value: 'Brievenbus verzending overdag', price: 3.62385 },
  { value: 'Gegarandeerde levering overdag', price: 12.39 },
  { value: 'Tussen 08:00-10:30 overdag', price: 22.94 },
  { value: 'Tussen 08:00-12:00 overdag', price: 18.31 },
  { value: 'Tussen 13:00-17:00 overdag', price: 18.31 },
] as const

export type OrderFormShippingValue = (typeof ORDER_FORM_SHIPPING_OPTIONS)[number]['value']

export type OrderFormLineInput = {
  productId?: number
  title?: string
  quantity: number
  /** Regeltotaal (zoals price[] op live formulier: qty × stukprijs). */
  lineTotal: number
}

export type CreateOrderFormInput = {
  firstName: string
  lastName: string
  address1: string
  postcode: string
  city: string
  email?: string
  phone?: string
  deliveryDate: string
  shippingMethod: OrderFormShippingValue
  kaartje?: string
  note?: string
  lines: OrderFormLineInput[]
  status?: 'processing' | 'pending' | 'on-hold'
}

export type WcProductHit = {
  id: number
  name: string
  price: string
  sku: string
}

export type WcCustomerHit = {
  id: number
  email: string
  first_name: string
  last_name: string
  billing: {
    address_1?: string
    postcode?: string
    city?: string
    phone?: string
  }
}

function getWcCredentials() {
  const storeUrl = process.env.WC_STORE_URL || process.env.OLD_SHOP_API_URL || 'https://www.bloemenvandegier.nl'
  const consumerKey = process.env.WC_CONSUMER_KEY || process.env.OLD_SHOP_CONSUMER_KEY
  const consumerSecret = process.env.WC_CONSUMER_SECRET || process.env.OLD_SHOP_CONSUMER_SECRET

  if (!consumerKey || !consumerSecret) {
    throw new Error(
      'WooCommerce credentials ontbreken. Zet WC_CONSUMER_KEY + WC_CONSUMER_SECRET in .env'
    )
  }

  return {
    baseUrl: storeUrl.replace(/\/$/, ''),
    consumerKey,
    consumerSecret,
  }
}

function buildUrl(endpoint: string, params: Record<string, string | number | undefined> = {}) {
  const { baseUrl, consumerKey, consumerSecret } = getWcCredentials()
  const url = new URL(`${baseUrl}/wp-json/wc/v3/${endpoint.replace(/^\//, '')}`)
  url.searchParams.set('consumer_key', consumerKey)
  url.searchParams.set('consumer_secret', consumerSecret)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })
  return url.toString()
}

async function wcGet<T>(endpoint: string, params: Record<string, string | number | undefined> = {}) {
  const url = buildUrl(endpoint, params)
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`WooCommerce API ${response.status}: ${text.slice(0, 300)}`)
  }
  return (await response.json()) as T
}

function isQmFatalResponse(status: number, text: string) {
  return status >= 500 && /qm_fatal|email_cuztomizer|method_exists/i.test(text)
}

async function wcRequest<T>(
  method: 'POST' | 'PUT',
  endpoint: string,
  body: unknown,
  options: { allowQmFatal?: boolean } = {}
): Promise<{ data: T | null; status: number; raw: string }> {
  const url = buildUrl(endpoint)
  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  const raw = await response.text()
  if (!response.ok) {
    if (options.allowQmFatal && isQmFatalResponse(response.status, raw)) {
      return { data: null, status: response.status, raw }
    }
    throw new Error(`WooCommerce API ${response.status}: ${raw.slice(0, 300)}`)
  }
  return { data: JSON.parse(raw) as T, status: response.status, raw }
}

async function wcPost<T>(endpoint: string, body: unknown) {
  const result = await wcRequest<T>('POST', endpoint, body)
  return result.data as T
}

async function wcPut<T>(endpoint: string, body: unknown, options: { allowQmFatal?: boolean } = {}) {
  return wcRequest<T>('PUT', endpoint, body, options)
}

function moneyAmount(n: number) {
  return (Math.round(n * 100) / 100).toFixed(2)
}

function formatJckwdsDisplay(ymd: string) {
  if (!/^\d{8}$/.test(ymd)) return ''
  return `${ymd.slice(6, 8)}/${ymd.slice(4, 6)}/${ymd.slice(0, 4)}`
}

function shippingOption(method: OrderFormShippingValue) {
  return ORDER_FORM_SHIPPING_OPTIONS.find((o) => o.value === method)
}

export async function searchOrderFormProducts(query: string): Promise<WcProductHit[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const products = await wcGet<
    Array<{
      id: number
      name: string
      sku: string
      price: string
      regular_price: string
    }>
  >('products', {
    search: q,
    per_page: 25,
    status: 'publish',
    orderby: 'popularity',
    order: 'desc',
  })

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku || '',
    price: p.price || p.regular_price || '0',
  }))
}

export async function searchOrderFormCustomers(query: string): Promise<WcCustomerHit[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const customers = await wcGet<
    Array<{
      id: number
      email: string
      first_name: string
      last_name: string
      billing: WcCustomerHit['billing']
    }>
  >('customers', {
    search: q,
    per_page: 10,
  })

  return customers
}

/** WC REST verplicht product_id/SKU; vrije regels gebruiken dit verborgen product + naam-override. */
const HANDMATIG_PRODUCT_SKU = 'handmatig-orderformulier'

let cachedHandmatigProductId: number | null = null

async function ensureHandmatigProductId(): Promise<number> {
  if (cachedHandmatigProductId) return cachedHandmatigProductId

  const bySku = await wcGet<Array<{ id: number }>>('products', {
    sku: HANDMATIG_PRODUCT_SKU,
    per_page: 1,
  })
  if (bySku[0]?.id) {
    cachedHandmatigProductId = bySku[0].id
    return bySku[0].id
  }

  try {
    const created = await wcPost<{ id: number }>('products', {
      name: 'Handmatig product',
      type: 'simple',
      regular_price: '0',
      sku: HANDMATIG_PRODUCT_SKU,
      status: 'publish',
      catalog_visibility: 'hidden',
      manage_stock: false,
      description: 'Placeholder voor vrije orderregels via order dashboard.',
    })
    cachedHandmatigProductId = created.id
    return created.id
  } catch {
    // Geen product-write rechten: val terug op bestaand "Credit"-product (id uit live form).
    const credit = await wcGet<Array<{ id: number; name: string }>>('products', {
      search: 'Credit',
      per_page: 5,
      status: 'publish',
    })
    const match = credit.find((p) => /^credit$/i.test(p.name.trim())) || credit[0]
    if (match?.id) {
      cachedHandmatigProductId = match.id
      return match.id
    }
    throw new Error(
      'Kon geen placeholder-product vinden voor vrije regels. Maak in WooCommerce een product met SKU "handmatig-orderformulier" aan.'
    )
  }
}

export async function buildOrderFormPayload(input: CreateOrderFormInput) {
  if (!input.lines.length) {
    throw new Error('Voeg minstens één orderregel toe.')
  }

  const ymd = parseDeliveryDateToYmd(input.deliveryDate)
  if (!ymd) {
    throw new Error('Ongeldige bezorgdatum.')
  }

  const shipping = shippingOption(input.shippingMethod)
  if (!shipping) {
    throw new Error('Ongeldige leveringsmethode.')
  }

  const needsPlaceholder = input.lines.some((line) => !line.productId || line.productId <= 0)
  const handmatigId = needsPlaceholder ? await ensureHandmatigProductId() : 0

  const lineItems = input.lines.map((line, idx) => {
    const qty = Math.max(1, Math.floor(Number(line.quantity) || 1))
    const total = Number(line.lineTotal)
    if (Number.isNaN(total) || total < 0) {
      throw new Error(`Ongeldige prijs op regel ${idx + 1}.`)
    }
    const totalStr = moneyAmount(total)

    if (line.productId && line.productId > 0) {
      return {
        product_id: line.productId,
        quantity: qty,
        subtotal: totalStr,
        total: totalStr,
      }
    }

    const title = (line.title || '').trim()
    if (!title) {
      throw new Error(`Regel ${idx + 1} heeft geen productnaam.`)
    }

    return {
      product_id: handmatigId,
      name: title,
      quantity: qty,
      subtotal: totalStr,
      total: totalStr,
    }
  })

  const address = {
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    address_1: input.address1.trim(),
    postcode: input.postcode.trim(),
    city: input.city.trim(),
    country: 'NL',
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
  }

  const kaartje = (input.kaartje || '').trim()
  const jckDisplay = formatJckwdsDisplay(ymd)

  const meta_data: Array<{ key: string; value: string }> = [
    { key: 'jckwds_date_ymd', value: ymd },
    { key: '_jckwds_date_ymd', value: ymd },
    { key: 'jckwds_date', value: jckDisplay },
    { key: '_jckwds_date', value: jckDisplay },
    { key: '_created_via_order_dashboard', value: '1' },
  ]

  if (kaartje) {
    meta_data.push(
      { key: 'persoonlijk kaartje toevoegen', value: kaartje },
      { key: 'persoonlijk_kaartje', value: kaartje }
    )
  }

  return {
    // Direct `processing`/`set_paid` triggert een fatal in
    // woocommerce_email_cuztomizer… — eerst pending, daarna updaten.
    status: 'pending',
    currency: 'EUR',
    payment_method: 'cod',
    payment_method_title: 'Handmatig (order dashboard)',
    set_paid: false,
    customer_note: (input.note || '').trim(),
    billing: address,
    shipping: {
      first_name: address.first_name,
      last_name: address.last_name,
      address_1: address.address_1,
      postcode: address.postcode,
      city: address.city,
      country: 'NL',
      phone: address.phone,
    },
    line_items: lineItems,
    shipping_lines: [
      {
        method_id: 'flat_rate',
        method_title: shipping.value,
        total: moneyAmount(shipping.price),
      },
    ],
    meta_data,
  }
}

/**
 * Maakt een WC-order aan.
 * Workaround: e-mailcustomizer-plugin crasht bij status≠pending; we maken eerst
 * pending en zetten daarna op processing. De PUT kan HTTP 500 (qm_fatal) geven
 * terwijl de status-update wél is doorgevoerd — daarom verifiëren we met GET.
 */
export async function createOrderFromForm(input: CreateOrderFormInput): Promise<WcOrder> {
  const { assertOrderDashboardWritesAllowed } = await import('@/lib/order-dashboard/test-mode')
  assertOrderDashboardWritesAllowed()

  const payload = await buildOrderFormPayload(input)
  const created = await wcPost<WcOrder>('orders', payload)
  const targetStatus = input.status || 'processing'

  if (created.status === targetStatus) {
    return created
  }

  await wcPut(
    `orders/${created.id}`,
    { status: targetStatus, set_paid: true },
    { allowQmFatal: true }
  )

  const verified = await wcGet<WcOrder>(`orders/${created.id}`)
  if (verified.status !== targetStatus) {
    throw new Error(
      `Order #${created.number} aangemaakt, maar status is "${verified.status}" i.p.v. "${targetStatus}". ` +
        'Controleer de e-mailcustomizer-plugin in WooCommerce.'
    )
  }
  return verified
}

export function getWcAdminOrderUrl(orderId: number | string, baseUrl?: string) {
  const store = (baseUrl || process.env.WC_STORE_URL || 'https://www.bloemenvandegier.nl').replace(
    /\/$/,
    ''
  )
  return `${store}/wp-admin/post.php?post=${orderId}&action=edit`
}
