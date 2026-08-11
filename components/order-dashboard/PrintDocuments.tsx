'use client'

import type { WcOrder } from '@/lib/woocommerce/orders'
import {
  cleanKaartjeText,
  formatAddress,
  formatMoney,
  getDeliveryInfo,
  getKaartjeTexts,
  getLineItemExtras,
} from '@/lib/woocommerce/order-display'

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

export function PakbonDocument({ order }: { order: WcOrder }) {
  const delivery = getDeliveryInfo(order)
  return (
    <article className="print-sheet mx-auto max-w-3xl px-6 py-8">
      <header className="mb-8 border-b border-gray-300 pb-4">
        <h1 className="text-2xl font-bold">Bloemen van De Gier</h1>
        <p className="text-sm text-gray-600">Pakbon — bestelling #{order.number}</p>
        <p className="text-sm text-gray-600">Datum: {formatDate(order.date_created)}</p>
      </header>

      <div className="mb-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
            Bezorgadres
          </h2>
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {formatAddress(order.shipping) || '—'}
          </pre>
          {order.shipping?.phone && (
            <p className="mt-1 text-sm">Tel: {order.shipping.phone}</p>
          )}
        </div>
        <div>
          <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
            Bezorginfo
          </h2>
          <p className="text-sm">Datum: {delivery.date || '—'}</p>
          <p className="text-sm">Tijd: {delivery.time || '—'}</p>
          {order.shipping_lines?.[0] && (
            <p className="text-sm">Methode: {order.shipping_lines[0].method_title}</p>
          )}
        </div>
      </div>

      {order.customer_note && (
        <div className="mb-6 rounded border border-amber-300 bg-amber-50 p-3 text-sm">
          <strong>Notitie:</strong> {order.customer_note}
        </div>
      )}

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-gray-900 text-left">
            <th className="py-2 pr-2">Product</th>
            <th className="w-16 px-2 py-2">Aantal</th>
            <th className="w-28 py-2 pl-2">SKU</th>
          </tr>
        </thead>
        <tbody>
          {order.line_items.map((item) => {
            const extras = getLineItemExtras(item)
            return (
            <tr key={item.id} className="border-b border-gray-200 align-top">
              <td className="py-3 pr-2">
                <strong>{item.name}</strong>
                {extras.length > 0 && (
                  <ul className="mt-1 text-xs text-gray-600">
                    {extras.map((extra) => (
                      <li key={`${item.id}-${extra.label}`}>
                        <span className="font-medium">{extra.label}:</span> {extra.value}
                      </li>
                    ))}
                  </ul>
                )}
              </td>
              <td className="px-2 py-3">{item.quantity}</td>
              <td className="py-3 pl-2">{item.sku || '—'}</td>
            </tr>
            )
          })}
        </tbody>
      </table>
    </article>
  )
}

export function FactuurDocument({ order }: { order: WcOrder }) {
  return (
    <article className="print-sheet mx-auto max-w-3xl px-6 py-8">
      <header className="mb-8 flex items-start justify-between gap-4 border-b border-gray-300 pb-4">
        <div>
          <h1 className="text-2xl font-bold">Bloemen van De Gier</h1>
          <p className="text-sm text-gray-600">Industrieweg 8, 7921 JP Zuidwolde</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-lg font-bold">Factuur #{order.number}</p>
          <p>Datum: {formatDate(order.date_created)}</p>
          {order.date_paid && <p>Betaald: {formatDate(order.date_paid)}</p>}
          <p>Status: {order.status}</p>
        </div>
      </header>

      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
            Factuuradres
          </h2>
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {formatAddress(order.billing) || '—'}
          </pre>
          {order.billing?.email && <p className="mt-1 text-sm">{order.billing.email}</p>}
        </div>
        <div>
          <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
            Bezorgadres
          </h2>
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {formatAddress(order.shipping) || '—'}
          </pre>
        </div>
      </div>

      <table className="mb-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-gray-900 text-left">
            <th className="py-2">Omschrijving</th>
            <th className="w-16 py-2 text-right">Aantal</th>
            <th className="w-24 py-2 text-right">Prijs</th>
            <th className="w-28 py-2 text-right">Totaal</th>
          </tr>
        </thead>
        <tbody>
          {order.line_items.map((item) => {
            const extras = getLineItemExtras(item)
            return (
            <tr key={item.id} className="border-b border-gray-200 align-top">
              <td className="py-2 pr-2">
                <div>{item.name}</div>
                {extras.length > 0 && (
                  <ul className="mt-1 text-xs text-gray-600">
                    {extras.map((extra) => (
                      <li key={`${item.id}-${extra.label}`}>
                        <span className="font-medium">{extra.label}:</span> {extra.value}
                      </li>
                    ))}
                  </ul>
                )}
              </td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">{formatMoney(item.price, order.currency)}</td>
              <td className="py-2 text-right">{formatMoney(item.total, order.currency)}</td>
            </tr>
            )
          })}
          {order.fee_lines?.map((f) => (
            <tr key={f.id} className="border-b border-gray-200">
              <td className="py-2 pr-2">{f.name}</td>
              <td className="py-2 text-right">1</td>
              <td className="py-2 text-right">{formatMoney(f.total, order.currency)}</td>
              <td className="py-2 text-right">{formatMoney(f.total, order.currency)}</td>
            </tr>
          ))}
          {order.shipping_lines?.map((s) => (
            <tr key={s.id} className="border-b border-gray-200">
              <td className="py-2 pr-2">{s.method_title || 'Verzending'}</td>
              <td className="py-2 text-right">1</td>
              <td className="py-2 text-right">{formatMoney(s.total, order.currency)}</td>
              <td className="py-2 text-right">{formatMoney(s.total, order.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
        {parseFloat(order.discount_total || '0') > 0 && (
          <div className="flex justify-between">
            <span>Korting</span>
            <span>-{formatMoney(order.discount_total, order.currency)}</span>
          </div>
        )}
        {parseFloat(order.total_tax || '0') > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>BTW</span>
            <span>{formatMoney(order.total_tax, order.currency)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-gray-900 pt-2 text-base font-bold">
          <span>Totaal</span>
          <span>{formatMoney(order.total, order.currency)}</span>
        </div>
        <p className="pt-2 text-xs text-gray-500">
          Betaalmethode: {order.payment_method_title || order.payment_method || '—'}
        </p>
      </div>
    </article>
  )
}

/** A6 liggend (148 × 105 mm) — dubbelgevouwen kaartje, zelfde formaat als Order Printer. */
export function KaartjeDocuments({ order }: { order: WcOrder }) {
  const cards = getKaartjeTexts(order)
  if (!cards.length) return null
  return (
    <>
      {cards.map((card, index) => (
        <div
          key={`${order.id}-${index}`}
          className="print-sheet card-sheet mx-auto my-6 flex h-[105mm] w-[148mm] flex-col items-center justify-center border border-gray-200 p-8"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          <p className="whitespace-pre-wrap text-center text-lg leading-relaxed text-gray-800">
            {cleanKaartjeText(card.text)}
          </p>
        </div>
      ))}
    </>
  )
}

/** Verzendlabel 62 × 100 mm voor de labprinter. */
export function LabelDocument({ order }: { order: WcOrder }) {
  const delivery = getDeliveryInfo(order)
  const shipMethod = order.shipping_lines?.[0]?.method_title || ''
  return (
    <article
      className="print-sheet label-sheet mx-auto my-4 box-border flex h-[100mm] w-[62mm] flex-col justify-between overflow-hidden border border-gray-300 p-2"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      <div>
        <p className="text-[9px] font-bold uppercase tracking-wide text-gray-500">
          Bloemen van De Gier
        </p>
        <p className="mt-0.5 text-base font-bold leading-tight">#{order.number}</p>
        {delivery.date && (
          <p className="mt-1 text-[11px] font-semibold text-gray-800">
            Bezorg: {delivery.date}
            {delivery.time ? ` · ${delivery.time}` : ''}
          </p>
        )}
        {shipMethod && <p className="mt-0.5 text-[10px] text-gray-600">{shipMethod}</p>}
      </div>
      <pre className="whitespace-pre-wrap font-sans text-[11px] leading-snug text-gray-900">
        {formatAddress(order.shipping) || '—'}
      </pre>
      {order.shipping?.phone && (
        <p className="text-[10px] text-gray-700">Tel: {order.shipping.phone}</p>
      )}
      {order.customer_note && (
        <p className="line-clamp-3 text-[9px] text-amber-800">
          {order.customer_note}
        </p>
      )}
    </article>
  )
}
