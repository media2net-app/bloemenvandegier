'use client'

import type { WcOrder } from '@/lib/woocommerce/orders'
import {
  getDeliveryDateYmd,
  getShippingSlot,
  parseDeliveryDateToYmd,
} from '@/lib/woocommerce/order-display'

export type OrderListResult = {
  orders: WcOrder[]
  total: number
  totalPages: number
  page: number
  perPage: number
}

type ListKey = string

const listCache = new Map<ListKey, { data: OrderListResult; at: number }>()
const orderById = new Map<number, WcOrder>()
const orderByNumber = new Map<string, WcOrder>()

/** List-cache TTL: 2 minuten (handmatig vernieuwen forceert opnieuw). */
const LIST_TTL_MS = 2 * 60 * 1000
const SESSION_ORDERS_KEY = 'od-wc-orders-v1'
const SESSION_LIST_KEY = 'od-wc-lists-v1'
let hydrated = false

function canUseSession() {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined'
}

function hydrateFromSession() {
  if (hydrated || !canUseSession()) return
  hydrated = true
  try {
    const rawOrders = sessionStorage.getItem(SESSION_ORDERS_KEY)
    if (rawOrders) {
      const orders = JSON.parse(rawOrders) as WcOrder[]
      for (const order of orders) {
        orderById.set(order.id, order)
        if (order.number) orderByNumber.set(String(order.number), order)
      }
    }
    const rawLists = sessionStorage.getItem(SESSION_LIST_KEY)
    if (rawLists) {
      const entries = JSON.parse(rawLists) as Array<{
        key: string
        data: OrderListResult
        at: number
      }>
      const now = Date.now()
      for (const entry of entries) {
        if (now - entry.at <= LIST_TTL_MS) {
          listCache.set(entry.key, { data: entry.data, at: entry.at })
        }
      }
    }
  } catch {
    // corrupt session → ignore
  }
}

function persistOrders() {
  if (!canUseSession()) return
  try {
    // Cap op ~200 recente orders om sessionStorage niet te laten groeien
    const orders = Array.from(orderById.values()).slice(-200)
    sessionStorage.setItem(SESSION_ORDERS_KEY, JSON.stringify(orders))
  } catch {
    // quota exceeded → ignore
  }
}

function persistLists() {
  if (!canUseSession()) return
  try {
    // Alleen compacte list-cache bewaren (grote meta-filters blazen sessionStorage op)
    const entries = Array.from(listCache.entries())
      .filter(([, value]) => (value.data.orders?.length || 0) <= 75)
      .map(([key, value]) => ({
        key,
        data: value.data,
        at: value.at,
      }))
    sessionStorage.setItem(SESSION_LIST_KEY, JSON.stringify(entries))
  } catch {
    // quota exceeded → ignore
  }
}

export function listCacheKey(opts: {
  page: number
  perPage: number
  status: string
  search: string
  deliveryDate?: string
  shippingSlot?: string
  sort?: string
}): ListKey {
  return [
    opts.status || 'any',
    opts.search.trim().toLowerCase(),
    opts.deliveryDate || '',
    opts.shippingSlot || 'any',
    opts.sort || 'newest',
    opts.page,
    opts.perPage,
  ].join('|')
}

export function rememberOrders(orders: WcOrder[]) {
  hydrateFromSession()
  for (const order of orders) {
    orderById.set(order.id, order)
    if (order.number) orderByNumber.set(String(order.number), order)
  }
  persistOrders()
}

export function getCachedOrderById(id: number) {
  hydrateFromSession()
  return orderById.get(id) || null
}

export function getCachedOrderByNumber(number: string) {
  hydrateFromSession()
  return orderByNumber.get(String(number)) || null
}

export function getCachedList(key: ListKey): OrderListResult | null {
  hydrateFromSession()
  const hit = listCache.get(key)
  if (!hit) return null
  if (Date.now() - hit.at > LIST_TTL_MS) {
    listCache.delete(key)
    persistLists()
    return null
  }
  return hit.data
}

export function setCachedList(key: ListKey, data: OrderListResult) {
  hydrateFromSession()
  listCache.set(key, { data, at: Date.now() })
  rememberOrders(data.orders)
  persistLists()
}

export function invalidateOrderListCache() {
  hydrateFromSession()
  listCache.clear()
  if (canUseSession()) {
    try {
      sessionStorage.removeItem(SESSION_LIST_KEY)
    } catch {
      // ignore
    }
  }
}

/** Zoek in reeds geladen orders (instant, geen API). */
export function searchCachedOrders(
  query: string,
  status: string,
  filters?: { deliveryDate?: string; shippingSlot?: string }
): WcOrder[] {
  hydrateFromSession()
  const q = query.trim().toLowerCase()
  if (!q) return []
  const wantedYmd = filters?.deliveryDate ? parseDeliveryDateToYmd(filters.deliveryDate) : ''
  const results: WcOrder[] = []
  for (const order of orderById.values()) {
    if (status && status !== 'any' && order.status !== status) continue
    if (wantedYmd && getDeliveryDateYmd(order) !== wantedYmd) continue
    if (filters?.shippingSlot && filters.shippingSlot !== 'any') {
      if (getShippingSlot(order) !== filters.shippingSlot) continue
    }
    const name = `${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`.toLowerCase()
    const email = (order.billing?.email || '').toLowerCase()
    const number = String(order.number || '')
    if (
      number.includes(q) ||
      number === q ||
      String(order.id) === q ||
      name.includes(q) ||
      email.includes(q)
    ) {
      results.push(order)
    }
  }
  return results.sort((a, b) => Number(a.number) - Number(b.number) || a.id - b.id)
}

export function isLikelyOrderNumber(query: string): boolean {
  return /^\d{4,}$/.test(query.trim())
}

const PRINT_JOB_PREFIX = 'od-print-job-'

/** Zet geselecteerde orders klaar voor een print-tab (zelfde origin / sessionStorage-clone). */
export function stashPrintJob(ids: number[], orders: WcOrder[]): string {
  hydrateFromSession()
  const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  if (canUseSession()) {
    try {
      sessionStorage.setItem(
        `${PRINT_JOB_PREFIX}${jobId}`,
        JSON.stringify({ ids, orders })
      )
    } catch {
      // quota → print-tab haalt zelf op
    }
  }
  return jobId
}

export function readPrintJob(jobId: string): { ids: number[]; orders: WcOrder[] } | null {
  if (!jobId || !canUseSession()) return null
  try {
    const raw = sessionStorage.getItem(`${PRINT_JOB_PREFIX}${jobId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { ids?: number[]; orders?: WcOrder[] }
    const orders = Array.isArray(parsed.orders) ? parsed.orders : []
    rememberOrders(orders)
    return {
      ids: Array.isArray(parsed.ids) ? parsed.ids : [],
      orders,
    }
  } catch {
    return null
  }
}

export function clearPrintJob(jobId: string) {
  if (!jobId || !canUseSession()) return
  try {
    sessionStorage.removeItem(`${PRINT_JOB_PREFIX}${jobId}`)
  } catch {
    // ignore
  }
}
