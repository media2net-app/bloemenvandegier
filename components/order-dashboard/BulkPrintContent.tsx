'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import {
  PrintError,
  PrintToolbar,
} from '@/components/order-dashboard/print-helpers'
import {
  FactuurDocument,
  KaartjeDocuments,
  LabelDocument,
  PakbonDocument,
} from '@/components/order-dashboard/PrintDocuments'
import type { WcOrder } from '@/lib/woocommerce/orders'
import { orderHasKaartje } from '@/lib/woocommerce/order-display'
import {
  clearPrintJob,
  getCachedOrderById,
  readPrintJob,
  rememberOrders,
} from '@/lib/woocommerce/order-list-cache'

type DocType = 'kaartje' | 'pakbon' | 'factuur' | 'label'

type LogEntry = {
  id: number
  label: string
  status: 'cache' | 'laden' | 'ok' | 'fout'
  detail?: string
}

const CONCURRENCY = 4

async function fetchOrder(id: number, signal: AbortSignal): Promise<WcOrder> {
  const res = await fetch(`/api/order-dashboard/orders/${id}`, { signal })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Order ${id} laden mislukt`)
  return data.order as WcOrder
}

export default function BulkPrintContent() {
  const searchParams = useSearchParams()
  const idsParam = searchParams.get('ids') || ''
  const docsParam = searchParams.get('docs') || ''
  const jobId = searchParams.get('job') || ''

  const ids = useMemo(
    () =>
      idsParam
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n) && n > 0),
    [idsParam]
  )

  const docs = useMemo(() => {
    const set = new Set(
      docsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean) as DocType[]
    )
    return {
      kaartje: set.has('kaartje'),
      pakbon: set.has('pakbon'),
      factuur: set.has('factuur'),
      label: set.has('label'),
    }
  }, [docsParam])

  const [orders, setOrders] = useState<WcOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(0)
  const [log, setLog] = useState<LogEntry[]>([])
  const runIdRef = useRef(0)

  useEffect(() => {
    if (!ids.length) {
      setLoading(false)
      setError('Geen orders geselecteerd.')
      return
    }

    const controller = new AbortController()
    const runId = ++runIdRef.current
    const total = ids.length
    const byId = new Map<number, WcOrder>()
    const entries: LogEntry[] = ids.map((id) => ({
      id,
      label: `#${id}`,
      status: 'laden',
    }))

    setLoading(true)
    setError(null)
    setOrders([])
    setDone(0)
    setLog(entries)

    const updateEntry = (id: number, patch: Partial<LogEntry>) => {
      if (runId !== runIdRef.current) return
      setLog((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
    }

    const bumpDone = () => {
      if (runId !== runIdRef.current) return
      setDone((n) => n + 1)
    }

    ;(async () => {
      try {
        // Altijd verse volledige orders ophalen voor print (cache is gestript → mist PEWC/kaartje)
        const missing = [...ids]
        let cursor = 0

        // Toon cache alleen als snelle preview terwijl we laden
        for (const id of ids) {
          const hit = getCachedOrderById(id)
          if (hit) {
            byId.set(id, hit)
            updateEntry(id, {
              label: `#${hit.number || id}`,
              status: 'laden',
              detail: 'verversen…',
            })
          } else {
            updateEntry(id, { status: 'laden', detail: 'ophalen…' })
          }
        }

        async function worker() {
          while (cursor < missing.length) {
            if (controller.signal.aborted || runId !== runIdRef.current) return
            const index = cursor++
            const id = missing[index]
            updateEntry(id, { status: 'laden', detail: 'ophalen…' })
            try {
              const order = await fetchOrder(id, controller.signal)
              byId.set(id, order)
              rememberOrders([order])
              updateEntry(id, {
                label: `#${order.number || id}`,
                status: 'ok',
                detail: 'geladen',
              })
            } catch (e) {
              if ((e as Error)?.name === 'AbortError') return
              // Fallback: job/cache als API faalt
              const fallback =
                byId.get(id) ||
                getCachedOrderById(id) ||
                (jobId ? readPrintJob(jobId)?.orders?.find((o) => o.id === id) : undefined)
              if (fallback) {
                byId.set(id, fallback)
                updateEntry(id, {
                  label: `#${fallback.number || id}`,
                  status: 'cache',
                  detail: 'cache (API faalde)',
                })
              } else {
                updateEntry(id, {
                  status: 'fout',
                  detail: e instanceof Error ? e.message : 'mislukt',
                })
              }
            } finally {
              bumpDone()
            }
          }
        }

        await Promise.all(
          Array.from({ length: Math.min(CONCURRENCY, missing.length) }, () => worker())
        )

        if (controller.signal.aborted || runId !== runIdRef.current) return

        const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as WcOrder[]
        setOrders(ordered)

        if (!ordered.length) {
          setError('Geen orders kunnen laden.')
        }
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return
        if (runId === runIdRef.current) {
          setError(e instanceof Error ? e.message : 'Laden mislukt')
        }
      } finally {
        if (runId === runIdRef.current && !controller.signal.aborted) {
          setLoading(false)
          if (jobId) clearPrintJob(jobId)
        }
      }
    })()

    return () => {
      controller.abort()
    }
  }, [ids, jobId])

  const total = ids.length
  const pct = total ? Math.round((done / total) * 100) : 0
  const cacheCount = log.filter((e) => e.status === 'cache').length
  const errorCount = log.filter((e) => e.status === 'fout').length

  if (!loading && error && !orders.length) {
    return <PrintError message={error} />
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
        <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-gray-800">
            <RefreshCw className="h-5 w-5 animate-spin text-primary-600" />
            <h1 className="text-lg font-semibold">Orders laden voor print</h1>
          </div>

          <p className="mb-2 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {Math.min(done, total)} van {total}
            </span>{' '}
            orders klaar
            {cacheCount > 0 && (
              <span className="text-emerald-600"> · {cacheCount} uit cache</span>
            )}
            {errorCount > 0 && (
              <span className="text-red-600"> · {errorCount} mislukt</span>
            )}
          </p>

          <div className="mb-4 h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary-600 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-2 text-xs">
            {log.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-2 rounded px-2 py-1.5"
              >
                <span className="font-medium text-gray-800">{entry.label}</span>
                <span
                  className={
                    entry.status === 'cache'
                      ? 'text-emerald-600'
                      : entry.status === 'ok'
                        ? 'text-emerald-700'
                        : entry.status === 'fout'
                          ? 'text-red-600'
                          : 'text-amber-600'
                  }
                >
                  {entry.status === 'cache' && 'cache'}
                  {entry.status === 'ok' && 'ok'}
                  {entry.status === 'fout' && (entry.detail || 'fout')}
                  {entry.status === 'laden' && (entry.detail || 'laden…')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!orders.length) {
    return <PrintError message="Geen orders gevonden." />
  }

  const docLabels = [
    docs.kaartje ? 'kaartjes A6' : null,
    docs.pakbon ? 'pakbonnen A4' : null,
    docs.factuur ? 'facturen A4' : null,
    docs.label ? 'labels 62×100' : null,
  ].filter(Boolean)

  const onlyKaartje = docs.kaartje && !docs.pakbon && !docs.factuur && !docs.label
  const onlyLabel = docs.label && !docs.kaartje && !docs.pakbon && !docs.factuur
  const onlyA4 =
    (docs.pakbon || docs.factuur) && !docs.kaartje && !docs.label

  const pageCss = onlyKaartje
    ? `@page { size: 148mm 105mm; margin: 0; }`
    : onlyLabel
      ? `@page { size: 62mm 100mm; margin: 0; }`
      : onlyA4
        ? `@page { size: A4; margin: 12mm; }`
        : `@page { size: A4; margin: 12mm; }`

  return (
    <div className="min-h-screen bg-white text-black">
      <style>{`
        @media print {
          html, body {
            background: #fff !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          .print-sheet {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            color: #000 !important;
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
          }
          .print-sheet:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .print-sheet, .print-sheet * {
            color: #000 !important;
            visibility: visible !important;
          }
          .card-sheet {
            page-break-after: always;
            border: none !important;
            margin: 0 !important;
            width: 148mm !important;
            height: 105mm !important;
          }
          .label-sheet { page-break-after: always; border: none !important; margin: 0 !important; }
          ${pageCss}
        }
      `}</style>
      <PrintToolbar
        title={`Bulk print · ${orders.length} orders · ${docLabels.join(', ') || 'geen documenten'}${
          errorCount ? ` · ${errorCount} overgeslagen` : ''
        }`}
        hint={
          docs.pakbon || docs.factuur
            ? 'Tip (Safari/macOS): kies “Alle pagina’s”, niet “Selectie” — anders zie je lege pagina’s. 1 order = 1 pagina.'
            : undefined
        }
      />

      {!docs.kaartje && !docs.pakbon && !docs.factuur && !docs.label && (
        <div className="p-8 text-center text-red-700">
          Selecteer minstens één documenttype (kaartje, pakbon, factuur of label).
        </div>
      )}

      {orders.map((order, index) => (
        <div key={order.id}>
          {docs.kaartje && orderHasKaartje(order) && <KaartjeDocuments order={order} />}
          {docs.pakbon && (
            <PakbonDocument
              order={order}
              pageIndex={index + 1}
              pageTotal={orders.length}
            />
          )}
          {docs.factuur && <FactuurDocument order={order} />}
          {docs.label && <LabelDocument order={order} />}
        </div>
      ))}
    </div>
  )
}
