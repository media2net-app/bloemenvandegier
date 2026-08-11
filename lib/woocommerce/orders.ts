export type WcMeta = {
  id?: number
  key: string
  value: unknown
  display_key?: string
  display_value?: string
}

export type WcAddress = {
  first_name: string
  last_name: string
  company: string
  address_1: string
  address_2: string
  city: string
  state: string
  postcode: string
  country: string
  email?: string
  phone?: string
}

export type WcLineItem = {
  id: number
  name: string
  product_id: number
  variation_id: number
  quantity: number
  tax_class: string
  subtotal: string
  subtotal_tax: string
  total: string
  total_tax: string
  sku: string
  price: number
  meta_data: WcMeta[]
}

export type WcOrder = {
  id: number
  parent_id: number
  number: string
  order_key: string
  created_via: string
  version: string
  status: string
  currency: string
  date_created: string
  date_modified: string
  discount_total: string
  discount_tax: string
  shipping_total: string
  shipping_tax: string
  cart_tax: string
  total: string
  total_tax: string
  prices_include_tax: boolean
  customer_id: number
  customer_ip_address: string
  customer_note: string
  billing: WcAddress
  shipping: WcAddress
  payment_method: string
  payment_method_title: string
  transaction_id: string
  date_paid: string | null
  date_completed: string | null
  cart_hash: string
  line_items: WcLineItem[]
  tax_lines: Array<{
    id: number
    rate_code: string
    rate_id: number
    label: string
    compound: boolean
    tax_total: string
    shipping_tax_total: string
  }>
  shipping_lines: Array<{
    id: number
    method_title: string
    method_id: string
    total: string
    total_tax: string
    meta_data: WcMeta[]
  }>
  fee_lines: Array<{
    id: number
    name: string
    total: string
    total_tax: string
    meta_data: WcMeta[]
  }>
  coupon_lines: Array<{
    id: number
    code: string
    discount: string
    discount_tax: string
  }>
  meta_data: WcMeta[]
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

async function wcFetch<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {}
): Promise<{ data: T; total: number; totalPages: number }> {
  const url = buildUrl(endpoint, params)
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`WooCommerce API ${response.status}: ${text.slice(0, 300)}`)
  }

  const data = (await response.json()) as T
  return {
    data,
    total: parseInt(response.headers.get('x-wp-total') || '0', 10),
    totalPages: parseInt(response.headers.get('x-wp-totalpages') || '1', 10),
  }
}

import {
  getDeliveryDateYmd,
  getShippingSlot,
  parseDeliveryDateToYmd,
  type ShippingSlot,
} from '@/lib/woocommerce/order-display'

export type ListWcOrdersOptions = {
  page?: number
  perPage?: number
  status?: string
  search?: string
  /** YYYY-MM-DD bezorgdatum (Iconic jckwds), niet besteldatum */
  deliveryDate?: string
  /** overdag | avond | any */
  shippingSlot?: string
  /** pakketpartner = ordernr ASC; newest = besteldatum DESC */
  sort?: 'pakketpartner' | 'newest'
}

const META_FILTER_FETCH_CAP = 500
/** WooCommerce REST max per_page */
const WC_PAGE_SIZE = 100

function needsMetaFilter(options: ListWcOrdersOptions) {
  const slot = options.shippingSlot
  const hasSlot = Boolean(slot && slot !== 'any')
  const hasDelivery = Boolean(options.deliveryDate && parseDeliveryDateToYmd(options.deliveryDate))
  return hasSlot || hasDelivery
}

function matchesMetaFilters(order: WcOrder, options: ListWcOrdersOptions): boolean {
  const wantedYmd = options.deliveryDate ? parseDeliveryDateToYmd(options.deliveryDate) : ''
  if (wantedYmd) {
    if (getDeliveryDateYmd(order) !== wantedYmd) return false
  }

  const slot = options.shippingSlot
  if (slot && slot !== 'any') {
    const orderSlot = getShippingSlot(order)
    if (slot === 'overdag' || slot === 'avond') {
      if (orderSlot !== (slot as ShippingSlot)) return false
    }
  }

  return true
}

function sortOrders(orders: WcOrder[], sort: 'pakketpartner' | 'newest') {
  if (sort === 'newest') {
    return [...orders].sort(
      (a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    )
  }
  // Pakketpartner: oplopend ordernummer
  return [...orders].sort((a, b) => Number(a.number) - Number(b.number) || a.id - b.id)
}

async function fetchAllOrdersForMetaFilter(options: ListWcOrdersOptions): Promise<WcOrder[]> {
  const status = options.status && options.status !== 'any' ? options.status : undefined
  const search = options.search || undefined
  // Beperk tot recente orders: anders komen oude "processing"-orders mee en wordt de response te zwaar.
  const after = options.deliveryDate
    ? (() => {
        const ymd = parseDeliveryDateToYmd(options.deliveryDate)
        if (!/^\d{8}$/.test(ymd)) return daysAgoIso(60)
        const iso = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}T00:00:00`
        const d = new Date(iso)
        d.setDate(d.getDate() - 90)
        return d.toISOString()
      })()
    : daysAgoIso(60)

  const collected: WcOrder[] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages && collected.length < META_FILTER_FETCH_CAP) {
    const batchSize = Math.min(WC_PAGE_SIZE, META_FILTER_FETCH_CAP - collected.length)
    const result = await wcFetch<WcOrder[]>('orders', {
      page,
      per_page: batchSize,
      status,
      search,
      after,
      orderby: 'id',
      order: 'desc',
    })
    collected.push(...result.data)
    totalPages = result.totalPages || 1
    if (!result.data.length) break
    page += 1
  }

  return collected
}

/** Strip zware meta voor list-API (voorkomt MB-responses / HTML error pages). */
export function slimOrderForList(order: WcOrder): WcOrder {
  const keepMeta = (meta: WcOrder['meta_data'] = []) =>
    meta.filter((m) => {
      const key = String(m.key || '').toLowerCase()
      return (
        key.includes('jckwds') ||
        key.includes('bezorg') ||
        key.includes('delivery') ||
        key.includes('kaartje') ||
        key.includes('iconic') ||
        key === 'product_extras' ||
        key === '_product_extras' ||
        // PEWC zichtbare velden beginnen vaak met _ + Label
        (/^_[a-zà-ÿ]/i.test(String(m.key || '')) &&
          !key.startsWith('_pewc_') &&
          !key.startsWith('_wcpdf') &&
          !key.startsWith('_reduced'))
      )
    })

  return {
    ...order,
    meta_data: keepMeta(order.meta_data),
    line_items: (order.line_items || []).map((item) => ({
      ...item,
      meta_data: keepMeta(item.meta_data),
    })),
    // fee/coupon/tax niet nodig in overzicht
    tax_lines: [],
    fee_lines: (order.fee_lines || []).map((f) => ({ ...f, meta_data: [] })),
    coupon_lines: order.coupon_lines || [],
    shipping_lines: (order.shipping_lines || []).map((s) => ({
      ...s,
      meta_data: [],
    })),
  }
}

function daysAgoIso(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

/**
 * Haal tot `limit` orders op via WC (max 100 per call).
 * Pagina-index is 1-based t.o.v. chunks van `limit`.
 */
async function fetchOrdersChunk(options: {
  page: number
  limit: number
  status?: string
  search?: string
  after?: string
  orderby: string
  order: string
}): Promise<{ data: WcOrder[]; total: number; totalPages: number }> {
  const limit = Math.min(Math.max(options.limit, 1), META_FILTER_FETCH_CAP)
  const startOffset = (options.page - 1) * limit
  const endOffset = startOffset + limit

  // WC pages zijn 100 groot; bepaal welke WC-pages we nodig hebben
  const firstWcPage = Math.floor(startOffset / WC_PAGE_SIZE) + 1
  const lastWcPage = Math.floor((endOffset - 1) / WC_PAGE_SIZE) + 1

  const collected: WcOrder[] = []
  let total = 0
  let totalWcPages = 1

  for (let wcPage = firstWcPage; wcPage <= lastWcPage; wcPage++) {
    const result = await wcFetch<WcOrder[]>('orders', {
      page: wcPage,
      per_page: WC_PAGE_SIZE,
      status: options.status,
      search: options.search,
      after: options.after,
      orderby: options.orderby,
      order: options.order,
    })
    total = result.total
    totalWcPages = result.totalPages || 1
    collected.push(...result.data)
    if (!result.data.length || wcPage >= totalWcPages) break
  }

  const sliceStart = startOffset - (firstWcPage - 1) * WC_PAGE_SIZE
  const data = collected.slice(sliceStart, sliceStart + limit)
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return { data, total, totalPages }
}

export async function listWcOrders(options: ListWcOrdersOptions = {}) {
  const {
    page = 1,
    perPage = 500,
    status,
    search,
    deliveryDate,
    shippingSlot,
    sort = needsMetaFilter(options) ? 'pakketpartner' : 'newest',
  } = options

  const safePerPage = Math.min(Math.max(perPage, 1), META_FILTER_FETCH_CAP)
  const statusParam = status && status !== 'any' ? status : undefined
  const searchParam = search || undefined

  if (needsMetaFilter({ deliveryDate, shippingSlot })) {
    const all = await fetchAllOrdersForMetaFilter({ status, search, deliveryDate, shippingSlot })
    const filtered = sortOrders(
      all.filter((order) => matchesMetaFilters(order, { deliveryDate, shippingSlot })),
      sort
    )
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / safePerPage))
    const start = (page - 1) * safePerPage
    return {
      data: filtered.slice(start, start + safePerPage),
      total,
      totalPages,
    }
  }

  // Zonder meta-filters: Pakketpartner-volgorde alleen over recente orders
  if (sort === 'pakketpartner') {
    const result = await fetchOrdersChunk({
      page,
      limit: safePerPage,
      status: statusParam,
      search: searchParam,
      after: daysAgoIso(45),
      orderby: 'id',
      order: 'asc',
    })
    return {
      data: sortOrders(result.data, 'pakketpartner'),
      total: result.total,
      totalPages: result.totalPages,
    }
  }

  return fetchOrdersChunk({
    page,
    limit: safePerPage,
    status: statusParam,
    search: searchParam,
    orderby: 'date',
    order: 'desc',
  })
}

export async function getWcOrder(id: string | number) {
  const result = await wcFetch<WcOrder>(`orders/${id}`)
  return result.data
}

export {
  formatAddress,
  formatMoney,
  getKaartjeTexts,
  getDeliveryInfo,
  getDeliveryDateYmd,
  formatDeliveryDateDisplay,
  getShippingSlot,
  getShippingSlotLabel,
  getShippingMethodTitle,
} from '@/lib/woocommerce/order-display'
