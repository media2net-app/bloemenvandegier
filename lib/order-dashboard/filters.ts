export type OrderDashboardFilters = {
  page: number
  status: string
  shippingSlot: string
  deliveryDate: string
  sort: 'pakketpartner' | 'newest'
  search: string
}

export const ORDER_DASHBOARD_FILTERS_KEY = 'order-dashboard-filters-v1'

export const DEFAULT_ORDER_DASHBOARD_FILTERS: OrderDashboardFilters = {
  page: 1,
  status: 'processing',
  shippingSlot: 'any',
  deliveryDate: '',
  sort: 'newest',
  search: '',
}

function parseSort(value: string | null | undefined): 'pakketpartner' | 'newest' {
  return value === 'pakketpartner' ? 'pakketpartner' : 'newest'
}

export function readFiltersFromSearchParams(
  params: URLSearchParams
): Partial<OrderDashboardFilters> | null {
  const keys = ['status', 'shipping', 'delivery', 'sort', 'q', 'page']
  if (!keys.some((k) => params.has(k))) return null

  const page = Number(params.get('page') || '1')
  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    status: params.get('status') || DEFAULT_ORDER_DASHBOARD_FILTERS.status,
    shippingSlot: params.get('shipping') || DEFAULT_ORDER_DASHBOARD_FILTERS.shippingSlot,
    deliveryDate: params.get('delivery') || '',
    sort: parseSort(params.get('sort')),
    search: params.get('q') || '',
  }
}

export function readFiltersFromSession(): Partial<OrderDashboardFilters> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(ORDER_DASHBOARD_FILTERS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<OrderDashboardFilters>
    return {
      page: typeof parsed.page === 'number' && parsed.page > 0 ? parsed.page : 1,
      status: parsed.status || DEFAULT_ORDER_DASHBOARD_FILTERS.status,
      shippingSlot: parsed.shippingSlot || DEFAULT_ORDER_DASHBOARD_FILTERS.shippingSlot,
      deliveryDate: typeof parsed.deliveryDate === 'string' ? parsed.deliveryDate : '',
      sort: parseSort(parsed.sort),
      search: typeof parsed.search === 'string' ? parsed.search : '',
    }
  } catch {
    return null
  }
}

export function resolveInitialFilters(params: URLSearchParams): OrderDashboardFilters {
  const fromUrl = readFiltersFromSearchParams(params)
  if (fromUrl) return { ...DEFAULT_ORDER_DASHBOARD_FILTERS, ...fromUrl }
  const fromSession = readFiltersFromSession()
  if (fromSession) return { ...DEFAULT_ORDER_DASHBOARD_FILTERS, ...fromSession }
  return { ...DEFAULT_ORDER_DASHBOARD_FILTERS }
}

export function persistFiltersToSession(filters: OrderDashboardFilters) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(ORDER_DASHBOARD_FILTERS_KEY, JSON.stringify(filters))
  } catch {
    // ignore quota / private mode
  }
}

/** Schrijf alle actieve filters naar de URL zodat refresh/terugkeer ze behoudt. */
export function filtersToSearchParams(filters: OrderDashboardFilters): URLSearchParams {
  const params = new URLSearchParams()
  params.set('status', filters.status || DEFAULT_ORDER_DASHBOARD_FILTERS.status)
  if (filters.shippingSlot && filters.shippingSlot !== 'any') {
    params.set('shipping', filters.shippingSlot)
  }
  if (filters.deliveryDate) params.set('delivery', filters.deliveryDate)
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.search.trim()) params.set('q', filters.search.trim())
  if (filters.page > 1) params.set('page', String(filters.page))
  return params
}
