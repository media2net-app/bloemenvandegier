'use client'

import { useEffect, useState } from 'react'
import { Printer, RefreshCw } from 'lucide-react'
import type { WcOrder } from '@/lib/woocommerce/orders'
import {
  formatAddress,
  formatMoney,
  getDeliveryInfo,
  getKaartjeTexts,
} from '@/lib/woocommerce/order-display'
import { getCachedOrderById, rememberOrders } from '@/lib/woocommerce/order-list-cache'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function usePrintOrder(id: string) {
  const [order, setOrder] = useState<WcOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const numericId = Number(id)
    const cached = Number.isFinite(numericId) ? getCachedOrderById(numericId) : null
    if (cached) {
      setOrder(cached)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/order-dashboard/orders/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Laden mislukt')
        if (data.order) rememberOrders([data.order])
        if (!cancelled) setOrder(data.order)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Laden mislukt')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  return { order, loading, error }
}

export function PrintToolbar({ title }: { title: string }) {
  return (
    <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
      >
        <Printer className="h-4 w-4" />
        Printen
      </button>
    </div>
  )
}

export function PrintLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-2 text-gray-500">
      <RefreshCw className="h-4 w-4 animate-spin" />
      Laden…
    </div>
  )
}

export function PrintError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-8 text-red-700">{message}</div>
  )
}

export const printHelpers = { formatDate, formatAddress, formatMoney, getDeliveryInfo, getKaartjeTexts }
