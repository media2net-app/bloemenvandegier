'use client'

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Search,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Printer,
  Receipt,
  Tag,
  Package,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import type { WcOrder } from '@/lib/woocommerce/orders'
import {
  formatDeliveryDateDisplay,
  formatMoney,
  getShippingMethodTitle,
  getShippingSlot,
  getShippingSlotLabel,
  orderHasKaartje,
} from '@/lib/woocommerce/order-display'
import {
  getCachedList,
  getCachedOrderById,
  getCachedOrderByNumber,
  invalidateOrderListCache,
  isLikelyOrderNumber,
  listCacheKey,
  rememberOrders,
  searchCachedOrders,
  setCachedList,
  stashPrintJob,
  type OrderListResult,
} from '@/lib/woocommerce/order-list-cache'
import {
  filtersToSearchParams,
  persistFiltersToSession,
  resolveInitialFilters,
  type OrderDashboardFilters,
} from '@/lib/order-dashboard/filters'
import { cn } from '@/lib/utils/cn'

const PER_PAGE = 500

/** Open een tab meteen (binnen user-gesture); later navigatie naar PDF. */
function openLoadingPrintTab(message: string): Window | null {
  const win = window.open('about:blank', '_blank')
  if (win) showPrintTabMessage(win, message)
  return win
}

function showPrintTabMessage(win: Window, message: string) {
  if (win.closed) return
  try {
    win.document.open()
    win.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>Print</title></head>` +
        `<body style="font-family:system-ui,sans-serif;padding:2rem;color:#111">` +
        `<p>${escapeHtml(message)}</p></body></html>`
    )
    win.document.close()
  } catch {
    // negeren als document niet meer schrijfbaar is
  }
}

async function navigateWindowToPdf(win: Window, blob: Blob) {
  const url = URL.createObjectURL(blob)
  if (!win.closed) {
    win.location.href = url
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
const SEARCH_DEBOUNCE_MS = 350

const STATUS_OPTIONS = [
  { value: 'any', label: 'Alle statussen' },
  { value: 'processing', label: 'In behandeling' },
  { value: 'pending', label: 'In afwachting' },
  { value: 'on-hold', label: 'On hold' },
  { value: 'completed', label: 'Afgerond' },
  { value: 'cancelled', label: 'Geannuleerd' },
  { value: 'refunded', label: 'Terugbetaald' },
  { value: 'failed', label: 'Mislukt' },
]

const SHIPPING_OPTIONS = [
  { value: 'any', label: 'Alle verzending' },
  { value: 'overdag', label: 'Overdag' },
  { value: 'avond', label: 'Avond' },
]

const SORT_OPTIONS = [
  { value: 'pakketpartner', label: 'Ordernr ↑ (Pakketpartner)' },
  { value: 'newest', label: 'Nieuwste eerst' },
]

function todayIsoDate() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function tomorrowIsoDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    processing: 'bg-blue-50 text-blue-800',
    pending: 'bg-amber-50 text-amber-800',
    'on-hold': 'bg-orange-50 text-orange-800',
    completed: 'bg-emerald-50 text-emerald-800',
    cancelled: 'bg-gray-100 text-gray-600',
    refunded: 'bg-purple-50 text-purple-800',
    failed: 'bg-red-50 text-red-800',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

function DocIcon({
  href,
  label,
  disabled,
  children,
}: {
  href?: string
  label: string
  disabled?: boolean
  children: React.ReactNode
}) {
  const className = cn(
    'group relative inline-flex h-8 w-8 items-center justify-center rounded-lg',
    disabled
      ? 'cursor-default bg-gray-50 text-gray-300'
      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
  )

  const tip = (
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
    >
      {label}
      <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
    </span>
  )

  if (disabled || !href) {
    return (
      <span className={className} aria-label={label}>
        {children}
        {tip}
      </span>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={className}
    >
      {children}
      {tip}
    </a>
  )
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function OrderDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-2 py-24 text-gray-500">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Laden…
        </div>
      }
    >
      <OrderDashboardPageContent />
    </Suspense>
  )
}

function OrderDashboardPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initial = useMemo(
    () => resolveInitialFilters(new URLSearchParams(searchParams.toString())),
    // Alleen bij eerste mount — daarna houden we state zelf bij
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const [orders, setOrders] = useState<WcOrder[]>([])
  const [page, setPage] = useState(initial.page)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState(initial.status)
  const [shippingSlot, setShippingSlot] = useState(initial.shippingSlot)
  const [deliveryDate, setDeliveryDate] = useState(initial.deliveryDate)
  const [sort, setSort] = useState<'pakketpartner' | 'newest'>(initial.sort)
  const [search, setSearch] = useState(initial.search)
  const [searchInput, setSearchInput] = useState(initial.search)
  const [loading, setLoading] = useState(true)
  const [fromCache, setFromCache] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [printKaartje, setPrintKaartje] = useState(true)
  const [printPakbon, setPrintPakbon] = useState(true)
  const [printFactuur, setPrintFactuur] = useState(false)
  const [printLabels, setPrintLabels] = useState(true)
  const [labelsBusy, setLabelsBusy] = useState(false)
  const [carrierService, setCarrierService] = useState('')
  const [carrierOptions, setCarrierOptions] = useState<Array<{ id: string; label: string }>>([])
  const skipNextUrlWrite = useRef(true)
  const fetchGen = useRef(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/order-dashboard/carrier-services')
        const data = await res.json()
        if (cancelled) return
        const options = Array.isArray(data.options) ? data.options : []
        setCarrierOptions(options)
        if (!carrierService && options[0]?.id) {
          // default: Packs P2 standaard of eerste optie
          const packs =
            options.find((o: { id: string; label: string }) =>
              /packs.*standaard|packs.*p2(?!.*tijd|08|13)/i.test(o.label)
            ) ||
            options.find((o: { id: string; label: string }) => /packs.*p2/i.test(o.label))
          setCarrierService(packs?.id || options[0].id)
        }
      } catch {
        // defaults in API
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentFilters: OrderDashboardFilters = useMemo(
    () => ({ page, status, shippingSlot, deliveryDate, sort, search }),
    [page, status, shippingSlot, deliveryDate, sort, search]
  )

  // Bewaar filters in URL + sessionStorage (overleeft print-tabs / terug / remount)
  useEffect(() => {
    persistFiltersToSession(currentFilters)
    if (skipNextUrlWrite.current) {
      skipNextUrlWrite.current = false
      const desired = filtersToSearchParams(currentFilters).toString()
      const current = searchParams.toString()
      if (desired && desired !== current) {
        router.replace(`${pathname}?${desired}`, { scroll: false })
      }
      return
    }
    const qs = filtersToSearchParams(currentFilters).toString()
    const next = qs ? `${pathname}?${qs}` : pathname
    const current = searchParams.toString()
    if (qs !== current) {
      router.replace(next, { scroll: false })
    }
  }, [currentFilters, pathname, router, searchParams])

  // Selectie wissen alleen bij filter/zoek/pagina-wissel — niet bij elke herlaad
  useEffect(() => {
    setSelected(new Set())
  }, [page, status, search, shippingSlot, deliveryDate, sort])

  const applyResult = useCallback((result: OrderListResult, cached: boolean) => {
    setOrders(result.orders)
    setTotal(result.total)
    setTotalPages(result.totalPages)
    setFromCache(cached)
  }, [])

  const fetchList = useCallback(
    async (
      opts: {
        page: number
        status: string
        search: string
        shippingSlot: string
        deliveryDate: string
        sort: 'pakketpartner' | 'newest'
        force?: boolean
      },
      signal?: AbortSignal
    ) => {
      const key = listCacheKey({
        page: opts.page,
        perPage: PER_PAGE,
        status: opts.status,
        search: opts.search,
        deliveryDate: opts.deliveryDate,
        shippingSlot: opts.shippingSlot,
        sort: opts.sort,
      })

      if (!opts.force) {
        const cached = getCachedList(key)
        if (cached) {
          applyResult(cached, true)
          setLoading(false)
          setError(null)
          return
        }
      }

      setLoading(true)
      setError(null)
      setFromCache(false)

      try {
        const q = opts.search.trim()
        const hasMetaFilters =
          Boolean(opts.deliveryDate) || (opts.shippingSlot && opts.shippingSlot !== 'any')

        // Exact ordernummer: 1 call op /orders/{id} i.p.v. list-search
        if (isLikelyOrderNumber(q) && opts.page === 1 && !hasMetaFilters) {
          const local = getCachedOrderByNumber(q)
          if (local && !opts.force) {
            const result: OrderListResult = {
              orders: [local],
              total: 1,
              totalPages: 1,
              page: 1,
              perPage: PER_PAGE,
            }
            setCachedList(key, result)
            applyResult(result, true)
            setLoading(false)
            return
          }

          const byIdRes = await fetch(`/api/order-dashboard/orders/${q}`, { signal })
          if (byIdRes.ok) {
            const data = await byIdRes.json()
            if (data.order) {
              rememberOrders([data.order])
              const result: OrderListResult = {
                orders: [data.order],
                total: 1,
                totalPages: 1,
                page: 1,
                perPage: PER_PAGE,
              }
              setCachedList(key, result)
              applyResult(result, false)
              setLoading(false)
              return
            }
          }
          // 404 → val terug op list search
        }

        const params = new URLSearchParams({
          page: String(opts.page),
          per_page: String(PER_PAGE),
          status: opts.status,
          sort: opts.sort,
        })
        if (q) params.set('search', q)
        if (opts.deliveryDate) params.set('delivery_date', opts.deliveryDate)
        if (opts.shippingSlot && opts.shippingSlot !== 'any') {
          params.set('shipping_slot', opts.shippingSlot)
        }

        const res = await fetch(`/api/order-dashboard/orders?${params}`, { signal })
        const contentType = res.headers.get('content-type') || ''
        const raw = await res.text()
        let data: {
          orders?: WcOrder[]
          total?: number
          totalPages?: number
          error?: string
        } = {}
        if (contentType.includes('application/json')) {
          try {
            data = JSON.parse(raw)
          } catch {
            throw new Error('Ongeldige JSON van orders-API')
          }
        } else {
          throw new Error(
            res.ok
              ? 'Orders-API gaf geen JSON terug'
              : `Orders laden mislukt (HTTP ${res.status})`
          )
        }
        if (!res.ok) throw new Error(data.error || 'Laden mislukt')

        const result: OrderListResult = {
          orders: data.orders || [],
          total: data.total || 0,
          totalPages: data.totalPages || 1,
          page: opts.page,
          perPage: PER_PAGE,
        }
        setCachedList(key, result)
        applyResult(result, false)
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return
        const msg = e instanceof Error ? e.message : 'Laden mislukt'
        // Safari/WebKit: "Load failed" bij kapotte .next / HTML 500-responses
        setError(
          /load failed|failed to fetch|networkerror/i.test(msg)
            ? 'Orders laden mislukt. Vernieuw de pagina of klik Vernieuwen.'
            : msg
        )
        setOrders([])
      } finally {
        if (!signal?.aborted) setLoading(false)
      }
    },
    [applyResult]
  )

  // Live search debounce → search state
  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = searchInput.trim()
      setSearch((prev) => {
        if (prev === next) return prev
        setPage(1)
        return next
      })
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(t)
  }, [searchInput])

  // Instant preview uit cache terwijl je typt (geen API)
  useEffect(() => {
    const q = searchInput.trim()
    if (q.length < 2) return
    if (search === q) return // officiële fetch neemt over
    const local = searchCachedOrders(q, status, { deliveryDate, shippingSlot })
    if (local.length) {
      setOrders(local.slice(0, PER_PAGE))
      setTotal(local.length)
      setTotalPages(1)
      setFromCache(true)
      setLoading(false)
    }
  }, [searchInput, search, status, deliveryDate, shippingSlot])

  // Officiële load bij page/filters/search — geen auto-refresh op de achtergrond
  useEffect(() => {
    const controller = new AbortController()
    const gen = ++fetchGen.current
    ;(async () => {
      await fetchList(
        { page, status, search, shippingSlot, deliveryDate, sort },
        controller.signal
      )
      // Negeer verouderde responses als er al een nieuwere fetch loopt
      if (gen !== fetchGen.current) return
    })()
    return () => controller.abort()
  }, [page, status, search, shippingSlot, deliveryDate, sort, fetchList])

  function refresh() {
    invalidateOrderListCache()
    fetchList({ page, status, search, shippingSlot, deliveryDate, sort, force: true })
  }

  function resetFiltersToTodayEvening() {
    setPage(1)
    setStatus('any')
    setShippingSlot('avond')
    setDeliveryDate(todayIsoDate())
    setSort('pakketpartner')
  }

  function resetFiltersToTomorrowDay() {
    setPage(1)
    setStatus('any')
    setShippingSlot('overdag')
    setDeliveryDate(tomorrowIsoDate())
    setSort('pakketpartner')
  }

  const pageIds = useMemo(() => orders.map((o) => o.id), [orders])
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))
  const somePageSelected = pageIds.some((id) => selected.has(id))

  function toggleAllPage() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id))
      } else {
        pageIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openBulkPrint() {
    if (!selected.size) return
    if (!printKaartje && !printPakbon && !printFactuur && !printLabels) {
      alert('Kies minstens één document: kaartje, pakbon, labels of factuur.')
      return
    }

    const idList = Array.from(selected)
    const known = idList
      .map((id) => getCachedOrderById(id) || orders.find((o) => o.id === id))
      .filter(Boolean) as WcOrder[]
    const jobId = stashPrintJob(idList, known)

    // Alle tabs synchroon openen (binnen de klik), anders blokkeert de browser
    // popups na async PDF-fetches en blijft alleen het kaartje over.
    const blocked: string[] = []

    const kaartjeWin = printKaartje ? openLoadingPrintTab('Kaartjes-PDF wordt geladen…') : null
    if (printKaartje && !kaartjeWin) blocked.push('kaartje')

    if (printPakbon) {
      const win = window.open(
        `/order-dashboard/print/bulk?ids=${encodeURIComponent(idList.join(','))}&docs=pakbon&job=${encodeURIComponent(jobId)}`,
        '_blank'
      )
      if (!win) blocked.push('pakbon')
    }

    if (printFactuur) {
      const win = window.open(
        `/order-dashboard/print/bulk?ids=${encodeURIComponent(idList.join(','))}&docs=factuur&job=${encodeURIComponent(jobId)}`,
        '_blank'
      )
      if (!win) blocked.push('factuur')
    }

    const labelsWin = printLabels ? openLoadingPrintTab('Verzendlabels worden geladen…') : null
    if (printLabels && !labelsWin) blocked.push('labels')

    if (blocked.length) {
      alert(
        `Browser blokkeerde tab(s): ${blocked.join(', ')}. Sta pop-ups toe voor deze site en probeer opnieuw.`
      )
    }

    if (printKaartje && kaartjeWin) {
      void fillKaartjesPdf(idList, kaartjeWin)
    }
    if (printLabels && labelsWin) {
      void fillBulkLabels(idList, labelsWin, true)
    }
  }

  async function fillKaartjesPdf(idList: number[], win: Window) {
    try {
      const res = await fetch('/api/order-dashboard/kaartjes-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: idList }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 500 && /geen kaartje/i.test(String(data.error || ''))) {
          showPrintTabMessage(win, 'Geen kaartjetekst bij deze selectie.')
          return
        }
        showPrintTabMessage(win, data.error || 'Kaartjes-PDF mislukt')
        return
      }
      await navigateWindowToPdf(win, await res.blob())
    } catch (e) {
      showPrintTabMessage(win, e instanceof Error ? e.message : 'Kaartjes-PDF mislukt')
    }
  }

  async function fillBulkLabels(idList: number[], win: Window, createMissing: boolean) {
    setLabelsBusy(true)
    try {
      const res = await fetch('/api/order-dashboard/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: idList,
          createMissing,
          carrierService: carrierService || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (!createMissing) {
          await fillBulkLabels(idList, win, true)
          return
        }
        showPrintTabMessage(win, data.error || 'Labels laden mislukt')
        return
      }
      await navigateWindowToPdf(win, await res.blob())
      invalidateOrderListCache()
      void fetchList({
        page,
        status,
        search,
        shippingSlot,
        deliveryDate,
        sort,
        force: true,
      })
    } catch (e) {
      showPrintTabMessage(win, e instanceof Error ? e.message : 'Labels laden mislukt')
    } finally {
      setLabelsBusy(false)
    }
  }

  async function openOrderLabel(order: WcOrder) {
    // Tab meteen openen (user-gesture), daarna PDF erin laden
    const win = openLoadingPrintTab('Label wordt geladen…')
    if (!win) {
      alert('Browser blokkeerde de tab. Sta pop-ups toe voor deze site.')
      return
    }
    setLabelsBusy(true)
    try {
      const res = await fetch('/api/order-dashboard/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: [order.id],
          createMissing: true,
          carrierService: carrierService || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        showPrintTabMessage(win, data.error || 'Label laden mislukt')
        return
      }
      await navigateWindowToPdf(win, await res.blob())
      // Status is server-side op completed gezet — lijst verversen
      invalidateOrderListCache()
      void fetchList({
        page,
        status,
        search,
        shippingSlot,
        deliveryDate,
        sort,
        force: true,
      })
    } catch (e) {
      showPrintTabMessage(win, e instanceof Error ? e.message : 'Label laden mislukt')
    } finally {
      setLabelsBusy(false)
    }
  }

  return (
    <div className={cn('space-y-6', selected.size > 0 && 'pb-28')}>
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-24 text-sm"
                placeholder="Live zoeken: ordernummer, e-mail of naam…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 text-xs text-gray-400">
                {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                {fromCache && !loading && <span className="text-emerald-600">cache</span>}
              </div>
            </div>
            <Button variant="outline" onClick={refresh} disabled={loading}>
              <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
              Vernieuwen
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Orderstatus
              <select
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal text-gray-900"
                value={status}
                onChange={(e) => {
                  setPage(1)
                  setStatus(e.target.value)
                }}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Verzending
              <select
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal text-gray-900"
                value={shippingSlot}
                onChange={(e) => {
                  setPage(1)
                  setShippingSlot(e.target.value)
                  if (e.target.value !== 'any') setSort('pakketpartner')
                }}
              >
                {SHIPPING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Bezorgdatum
              <input
                type="date"
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal text-gray-900"
                value={deliveryDate}
                onChange={(e) => {
                  setPage(1)
                  setDeliveryDate(e.target.value)
                  if (e.target.value) setSort('pakketpartner')
                }}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Volgorde
              <select
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal text-gray-900"
                value={sort}
                onChange={(e) => {
                  setPage(1)
                  setSort(e.target.value as 'pakketpartner' | 'newest')
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col justify-end gap-2 sm:flex-row sm:items-end">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={resetFiltersToTodayEvening}
              >
                Vandaag avond
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={resetFiltersToTomorrowDay}
              >
                Morgen overdag
              </Button>
              {(deliveryDate || shippingSlot !== 'any') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setPage(1)
                    setDeliveryDate('')
                    setShippingSlot('any')
                  }}
                >
                  Wis filters
                </Button>
              )}
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Bezorgdatum = Iconic leverdatum (niet besteldatum). Filters blijven bewaard als je
          pakbonnen/kaartjes opent of even wegklikt. Alleen handmatig Vernieuwen haalt nieuwe data.
        </p>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={allPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = somePageSelected && !allPageSelected
                    }}
                    onChange={toggleAllPage}
                    aria-label="Selecteer alle orders op deze pagina"
                  />
                </th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Bezorgdatum</th>
                <th className="px-4 py-3">Verzending</th>
                <th className="px-4 py-3">Besteld</th>
                <th className="px-4 py-3">Klant</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Totaal</th>
                <th className="px-4 py-3">Documenten</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && !orders.length ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    Orders laden…
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    Geen orders gevonden.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const name = [order.billing?.first_name, order.billing?.last_name]
                    .filter(Boolean)
                    .join(' ')
                  const hasKaartje = orderHasKaartje(order)
                  const isSelected = selected.has(order.id)
                  const slot = getShippingSlot(order)
                  const shipTitle = getShippingMethodTitle(order)
                  return (
                    <tr
                      key={order.id}
                      className={cn('hover:bg-gray-50', isSelected && 'bg-primary-50/40')}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={isSelected}
                          onChange={() => toggleOne(order.id)}
                          aria-label={`Selecteer order #${order.number}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">#{order.number}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatDeliveryDateDisplay(order)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                            slot === 'avond' && 'bg-indigo-50 text-indigo-800',
                            slot === 'overdag' && 'bg-amber-50 text-amber-800',
                            slot === 'other' && 'bg-gray-100 text-gray-600'
                          )}
                          title={shipTitle || undefined}
                        >
                          {getShippingSlotLabel(slot)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(order.date_created)}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{name || '—'}</div>
                        <div className="text-xs text-gray-500">{order.billing?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                            statusBadge(order.status)
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatMoney(order.total, order.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <DocIcon
                            href={hasKaartje ? `/order-dashboard/${order.id}/print/kaartje` : undefined}
                            label={hasKaartje ? 'Kaartje printen' : 'Geen kaartje'}
                            disabled={!hasKaartje}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </DocIcon>
                          <DocIcon
                            href={`/order-dashboard/${order.id}/print/pakbon`}
                            label="Pakbon printen"
                          >
                            <Printer className="h-4 w-4" />
                          </DocIcon>
                          <DocIcon
                            href={`/order-dashboard/${order.id}/print/factuur`}
                            label="Factuur printen"
                          >
                            <Receipt className="h-4 w-4" />
                          </DocIcon>
                          <DocIcon
                            href={`/order-dashboard/${order.id}/print/label`}
                            label="Label 62×100 mm"
                          >
                            <Tag className="h-4 w-4" />
                          </DocIcon>
                          <button
                            type="button"
                            onClick={() => openOrderLabel(order)}
                            aria-label="Pakketpartner verzendlabel"
                            className="group relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100"
                          >
                            <Package className="h-4 w-4" />
                            <span
                              role="tooltip"
                              className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 transition group-hover:opacity-100"
                            >
                              Pakketpartner PDF
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/order-dashboard/${order.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          <Eye className="h-4 w-4" />
                          Bekijken
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-sm text-gray-600">
            {total.toLocaleString('nl-NL')} orders · pagina {page} / {totalPages}
            {selected.size > 0 && (
              <span className="ml-2 font-medium text-primary-700">
                · {selected.size} geselecteerd
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {selected.size > 0 && (
        <div className="fixed bottom-0 left-64 right-0 z-40 border-t border-primary-200 bg-white shadow-lg">
          <div className="flex flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {selected.size} order{selected.size === 1 ? '' : 's'} geselecteerd
              </p>
              <p className="text-xs text-gray-500">
                Standaard: kaartje + pakbon + labels. Elke soort opent in een aparte tab.
                Labels = Pakketpartner (ontbrekende worden aangemaakt; orderstatus → afgerond in
                WooCommerce).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600"
                  checked={printKaartje}
                  onChange={(e) => setPrintKaartje(e.target.checked)}
                />
                <MessageSquare className="h-4 w-4 text-primary-600" />
                Kaartje
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600"
                  checked={printPakbon}
                  onChange={(e) => setPrintPakbon(e.target.checked)}
                />
                <Printer className="h-4 w-4 text-primary-600" />
                Pakbon
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600"
                  checked={printLabels}
                  onChange={(e) => setPrintLabels(e.target.checked)}
                />
                <Tag className="h-4 w-4 text-primary-600" />
                Labels
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600"
                  checked={printFactuur}
                  onChange={(e) => setPrintFactuur(e.target.checked)}
                />
                <Receipt className="h-4 w-4 text-primary-600" />
                Factuur
              </label>
              {printLabels && (
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <span className="whitespace-nowrap text-xs text-gray-500">Vervoerder</span>
                  <select
                    className="max-w-[240px] rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                    value={carrierService}
                    onChange={(e) => setCarrierService(e.target.value)}
                  >
                    {(carrierOptions.length
                      ? carrierOptions
                      : [{ id: '', label: 'Laden…' }]
                    ).map((o) => (
                      <option key={o.id || 'x'} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPrintKaartje(true)
                  setPrintPakbon(true)
                  setPrintLabels(true)
                  setPrintFactuur(false)
                }}
              >
                Alles (kaartje+pakbon+labels)
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>
                Deselecteren
              </Button>
              <Button size="sm" onClick={openBulkPrint} disabled={labelsBusy}>
                <Printer className="mr-2 h-4 w-4" />
                {labelsBusy ? 'Labels laden…' : 'Print selectie'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
