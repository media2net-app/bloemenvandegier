'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Printer,
  FileText,
  Receipt,
  MessageSquare,
  RefreshCw,
  Tag,
  ExternalLink,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import type { WcOrder } from '@/lib/woocommerce/orders'
import {
  formatAddress,
  formatMoney,
  formatMetaDisplayValue,
  getDeliveryInfo,
  getKaartjeTexts,
  getLineItemExtras,
} from '@/lib/woocommerce/order-display'
import { cn } from '@/lib/utils/cn'

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

export default function OrderDetailPage() {
  const params = useParams()
  const id = String(params?.id || '')
  const [order, setOrder] = useState<WcOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/order-dashboard/orders/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Laden mislukt')
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <RefreshCw className="h-4 w-4 animate-spin" />
        Order laden…
      </div>
    )
  }

  if (error || !order) {
    return (
      <Card className="border-red-200 bg-red-50 p-4 text-red-800">
        {error || 'Order niet gevonden'}
        <div className="mt-3">
          <Link href="/order-dashboard" className="text-sm font-medium underline">
            Terug naar overzicht
          </Link>
        </div>
      </Card>
    )
  }

  const delivery = getDeliveryInfo(order)
  const cards = getKaartjeTexts(order)
  const shipName = [order.shipping?.first_name, order.shipping?.last_name].filter(Boolean).join(' ')
  const billName = [order.billing?.first_name, order.billing?.last_name].filter(Boolean).join(' ')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/order-dashboard"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar overzicht
        </Link>
        <div className="flex flex-wrap gap-2">
          <a href={`/order-dashboard/${order.id}/print/pakbon`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Pakbon A4
            </Button>
          </a>
          <a href={`/order-dashboard/${order.id}/print/factuur`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <Receipt className="mr-2 h-4 w-4" />
              Factuur
            </Button>
          </a>
          <a href={`/order-dashboard/${order.id}/print/kaartje`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Kaartje A6
            </Button>
          </a>
          <a href={`/order-dashboard/${order.id}/print/label`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <Tag className="mr-2 h-4 w-4" />
              Label 62×100
            </Button>
          </a>
          <a
            href={`https://www.bloemenvandegier.nl/wp-admin/post.php?post=${order.id}&action=edit`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Wijzig in WooCommerce
            </Button>
          </a>
        </div>
      </div>

      <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold">Adres, kaartjetekst of bezorgdatum wijzigen?</p>
        <p className="mt-1">
          Doe dat in WooCommerce (knop hierboven). Pas shipping-adres, orderregel-meta
          (kaartje/toevoegingen) of Iconic bezorgdatum aan, daarna hier vernieuwen/printen.
        </p>
      </Card>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order #{order.number}</h2>
          <p className="text-sm text-gray-500">{formatDate(order.date_created)}</p>
        </div>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-sm font-medium',
            order.status === 'processing'
              ? 'bg-blue-50 text-blue-800'
              : order.status === 'completed'
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-gray-100 text-gray-700'
          )}
        >
          {order.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Orderregels
          </h3>
          <div className="divide-y divide-gray-100">
            {order.line_items.map((item) => (
              <div key={item.id} className="py-3">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.quantity}× {item.name}
                    </p>
                    {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                    {(() => {
                      const extras = getLineItemExtras(item)
                      if (!extras.length) return null
                      return (
                      <ul className="mt-1 space-y-0.5 text-xs text-gray-600">
                        {extras.map((extra) => (
                          <li key={`${item.id}-${extra.label}`}>
                            <strong>{extra.label}:</strong> {extra.value}
                          </li>
                        ))}
                      </ul>
                      )
                    })()}
                  </div>
                  <p className="shrink-0 font-medium">
                    {formatMoney(item.total, order.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {(order.fee_lines?.length > 0 || order.shipping_lines?.length > 0) && (
            <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
              {order.shipping_lines?.map((s) => (
                <div key={s.id} className="flex justify-between text-gray-600">
                  <span>{s.method_title || 'Verzending'}</span>
                  <span>{formatMoney(s.total, order.currency)}</span>
                </div>
              ))}
              {order.fee_lines?.map((f) => (
                <div key={f.id} className="flex justify-between text-gray-600">
                  <span>{f.name}</span>
                  <span>{formatMoney(f.total, order.currency)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold">
            <span>Totaal</span>
            <span>{formatMoney(order.total, order.currency)}</span>
          </div>
          {parseFloat(order.total_tax || '0') > 0 && (
            <p className="text-xs text-gray-500">
              waarvan BTW {formatMoney(order.total_tax, order.currency)}
            </p>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-5 space-y-2">
            <h3 className="font-semibold text-gray-900">Bezorging</h3>
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
              {formatAddress(order.shipping) || shipName || '—'}
            </pre>
            {order.shipping?.phone && (
              <p className="text-sm text-gray-600">Tel: {order.shipping.phone}</p>
            )}
            {(delivery.date || delivery.time) && (
              <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                {delivery.date && <p>Bezorgdatum: {delivery.date}</p>}
                {delivery.time && <p>Bezorgtijd: {delivery.time}</p>}
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-2">
            <h3 className="font-semibold text-gray-900">Factuur / klant</h3>
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
              {formatAddress(order.billing) || billName || '—'}
            </pre>
            {order.billing?.email && (
              <p className="text-sm text-gray-600">{order.billing.email}</p>
            )}
            {order.billing?.phone && (
              <p className="text-sm text-gray-600">Tel: {order.billing.phone}</p>
            )}
            <p className="text-sm text-gray-600">
              Betaling: {order.payment_method_title || order.payment_method || '—'}
            </p>
            {order.date_paid && (
              <p className="text-xs text-gray-500">Betaald: {formatDate(order.date_paid)}</p>
            )}
          </Card>

          {order.customer_note && (
            <Card className="border-amber-200 bg-amber-50 p-5">
              <h3 className="font-semibold text-amber-900">Klantnotitie</h3>
              <p className="mt-1 text-sm text-amber-900">{order.customer_note}</p>
            </Card>
          )}

          {cards.length > 0 && (
            <Card className="p-5 space-y-2">
              <h3 className="font-semibold text-gray-900">Kaartje(s)</h3>
              {cards.map((c, i) => (
                <div key={i} className="rounded-lg bg-gray-50 p-3 text-sm">
                  <p className="text-xs text-gray-500">{c.product}</p>
                  <p className="mt-1 whitespace-pre-wrap text-gray-800">{c.text}</p>
                </div>
              ))}
            </Card>
          )}

          {order.meta_data?.filter((m) => m.key && !String(m.key).startsWith('_') && m.value)
            .length > 0 && (
            <Card className="p-5 space-y-2">
              <h3 className="font-semibold text-gray-900">Order meta</h3>
              <ul className="space-y-1 text-xs text-gray-600">
                {order.meta_data
                  .filter((m) => m.key && !String(m.key).startsWith('_') && m.value)
                  .map((m) => (
                    <li key={m.id || m.key}>
                      <strong>{m.key}:</strong>{' '}
                      {typeof m.value === 'object'
                        ? formatMetaDisplayValue(m.value)
                        : String(m.value)}
                    </li>
                  ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
