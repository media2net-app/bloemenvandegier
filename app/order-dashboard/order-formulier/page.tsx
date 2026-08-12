'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ClipboardList, Plus, Search, Trash2, ExternalLink } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  ORDER_FORM_SHIPPING_OPTIONS,
  type OrderFormShippingValue,
  type WcCustomerHit,
  type WcProductHit,
} from '@/lib/woocommerce/order-formulier'

type Line =
  | {
      key: string
      kind: 'product'
      productId: number
      title: string
      unitPrice: number
      quantity: number
      lineTotal: number
    }
  | {
      key: string
      kind: 'custom'
      title: string
      quantity: number
      lineTotal: number
    }

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function todayYmd() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parsePrice(value: string | number) {
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export default function OrderFormulierPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address1, setAddress1] = useState('')
  const [postcode, setPostcode] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [deliveryDate, setDeliveryDate] = useState(todayYmd())
  const [shippingMethod, setShippingMethod] = useState<OrderFormShippingValue>(
    ORDER_FORM_SHIPPING_OPTIONS[0].value
  )
  const [kaartje, setKaartje] = useState('')
  const [note, setNote] = useState('')

  const [lines, setLines] = useState<Line[]>([])
  const [productQuery, setProductQuery] = useState('')
  const [customerQuery, setCustomerQuery] = useState('')
  const [productHits, setProductHits] = useState<WcProductHit[]>([])
  const [customerHits, setCustomerHits] = useState<WcCustomerHit[]>([])

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null)
  const [adminUrl, setAdminUrl] = useState<string | null>(null)

  const shippingPrice =
    ORDER_FORM_SHIPPING_OPTIONS.find((o) => o.value === shippingMethod)?.price ?? 0

  const productsSubtotal = useMemo(
    () => lines.reduce((sum, line) => sum + (Number(line.lineTotal) || 0), 0),
    [lines]
  )

  const orderTotal = productsSubtotal + shippingPrice

  async function searchProducts() {
    if (productQuery.trim().length < 2) return
    const res = await fetch(
      `/api/order-dashboard/order-formulier?type=products&q=${encodeURIComponent(productQuery.trim())}`
    )
    const data = await res.json()
    if (data.error) {
      setError(data.error)
      return
    }
    setProductHits(data.results || [])
  }

  async function searchCustomers() {
    if (customerQuery.trim().length < 2) return
    const res = await fetch(
      `/api/order-dashboard/order-formulier?type=customers&q=${encodeURIComponent(customerQuery.trim())}`
    )
    const data = await res.json()
    if (data.error) {
      setError(data.error)
      return
    }
    setCustomerHits(data.results || [])
  }

  function addProduct(p: WcProductHit) {
    const unitPrice = parsePrice(p.price)
    setLines((prev) => [
      ...prev,
      {
        key: uid(),
        kind: 'product',
        productId: p.id,
        title: p.name,
        unitPrice,
        quantity: 1,
        lineTotal: unitPrice,
      },
    ])
    setProductHits([])
    setProductQuery('')
  }

  function selectCustomer(c: WcCustomerHit) {
    setFirstName(c.first_name || '')
    setLastName(c.last_name || '')
    setEmail(c.email || '')
    setPhone(c.billing?.phone || '')
    setAddress1(c.billing?.address_1 || '')
    setPostcode(c.billing?.postcode || '')
    setCity(c.billing?.city || '')
    setCustomerHits([])
    setCustomerQuery(`${c.first_name} ${c.last_name}`.trim())
  }

  function updateLineQty(key: string, quantity: number) {
    setLines((prev) =>
      prev.map((line) => {
        if (line.key !== key) return line
        const qty = Math.max(1, quantity)
        if (line.kind === 'product') {
          return { ...line, quantity: qty, lineTotal: line.unitPrice * qty }
        }
        return { ...line, quantity: qty }
      })
    )
  }

  function updateLineTotal(key: string, lineTotal: number) {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, lineTotal: lineTotal } : line))
    )
  }

  async function submit() {
    setBusy(true)
    setError(null)
    setMessage(null)
    setDashboardUrl(null)
    setAdminUrl(null)

    try {
      if (!lines.length) {
        throw new Error('Voeg minstens één productregel toe.')
      }

      const payload = {
        firstName,
        lastName,
        address1,
        postcode,
        city,
        email: email || undefined,
        phone: phone || undefined,
        deliveryDate,
        shippingMethod,
        kaartje: kaartje || undefined,
        note: note || undefined,
        lines: lines.map((line) =>
          line.kind === 'product'
            ? {
                productId: line.productId,
                quantity: line.quantity,
                lineTotal: line.lineTotal,
              }
            : {
                title: line.title,
                quantity: line.quantity,
                lineTotal: line.lineTotal,
              }
        ),
      }

      const res = await fetch('/api/order-dashboard/order-formulier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Mislukt')

      setMessage(`Order #${data.order.number} aangemaakt (status: ${data.order.status}).`)
      setDashboardUrl(data.dashboardUrl || null)
      setAdminUrl(data.adminUrl || null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mislukt')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-rose-600" />
          Order formulier
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Maak handmatig WooCommerce-orders aan — shopproducten of vrije regels met eigen prijs, zoals
          op het live orderformulier. Orders komen direct in WooCommerce (status: in behandeling).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Verzendgegevens</h2>

          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Zoek bestaande klant…"
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchCustomers())}
            />
            <Button type="button" variant="outline" size="sm" onClick={searchCustomers}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {customerHits.length > 0 && (
            <ul className="rounded-lg border border-gray-200 divide-y max-h-40 overflow-auto">
              {customerHits.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-rose-50"
                    onClick={() => selectCustomer(c)}
                  >
                    <span className="font-medium">{c.first_name} {c.last_name}</span>
                    <span className="text-gray-500"> — {c.email || 'geen e-mail'}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-2 gap-3">
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Voornaam"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Achternaam"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm col-span-2"
              placeholder="Adres + nr"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Plaats"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm col-span-2"
              placeholder="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm col-span-2"
              placeholder="Telefoon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Orderdetails</h2>

          <label className="block text-xs text-gray-500">
            Bezorgdatum
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </label>

          <label className="block text-xs text-gray-500">
            Levering
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={shippingMethod}
              onChange={(e) => setShippingMethod(e.target.value as OrderFormShippingValue)}
            >
              {ORDER_FORM_SHIPPING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value} — €{opt.price.toFixed(2)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs text-gray-500">
            Persoonlijk kaartje
            <textarea
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              rows={4}
              placeholder="Tekst voor op het kaartje…"
              value={kaartje}
              onChange={(e) => setKaartje(e.target.value)}
            />
          </label>

          <label className="block text-xs text-gray-500">
            Opmerkingen (klantnotitie)
            <textarea
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              rows={3}
              placeholder="Opmerkingen…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 space-y-1">
            <div>Producten: <strong>€{productsSubtotal.toFixed(2)}</strong></div>
            <div>Verzending: <strong>€{shippingPrice.toFixed(2)}</strong></div>
            <div>Totaal: <strong>€{orderTotal.toFixed(2)}</strong></div>
          </div>
        </Card>
      </div>

      <Card className="p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Orderregels</h2>

        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Zoek shopproduct…"
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchProducts())}
          />
          <Button type="button" variant="outline" size="sm" onClick={searchProducts}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {productHits.length > 0 && (
          <ul className="rounded-lg border border-gray-200 divide-y max-h-48 overflow-auto">
            {productHits.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-rose-50"
                  onClick={() => addProduct(p)}
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-gray-500">
                    {' '}
                    — €{parsePrice(p.price).toFixed(2)}
                    {p.sku ? ` · ${p.sku}` : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {lines.length === 0 && (
          <p className="text-sm text-gray-500">Nog geen regels. Zoek een product of voeg een vrije regel toe.</p>
        )}

        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div key={line.key} className="rounded-lg border border-gray-200 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {line.kind === 'product' ? 'Shopproduct' : 'Vrije regel'}
                </span>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-600"
                  onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                  aria-label="Verwijderen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {line.kind === 'custom' ? (
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Productnaam, bijv. Speciaalboeket"
                  value={line.title}
                  onChange={(e) =>
                    setLines((prev) =>
                      prev.map((l, i) =>
                        i === idx && l.kind === 'custom' ? { ...l, title: e.target.value } : l
                      )
                    )
                  }
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{line.title}</p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-gray-500">
                  Aantal
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={line.quantity}
                    onChange={(e) => updateLineQty(line.key, Number(e.target.value) || 1)}
                  />
                </label>
                <label className="text-xs text-gray-500">
                  Regeltotaal €
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={line.lineTotal}
                    onChange={(e) => updateLineTotal(line.key, Number(e.target.value) || 0)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-medium text-rose-700 hover:text-rose-800"
          onClick={() =>
            setLines((prev) => [
              ...prev,
              { key: uid(), kind: 'custom', title: '', quantity: 1, lineTotal: 0 },
            ])
          }
        >
          <Plus className="h-4 w-4" /> Vrije regel toevoegen
        </button>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 space-y-2">
          <p>{message}</p>
          <div className="flex flex-wrap gap-3">
            {dashboardUrl && (
              <Link href={dashboardUrl} className="inline-flex items-center gap-1 font-medium underline">
                Open in order dashboard
              </Link>
            )}
            {adminUrl && (
              <a
                href={adminUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open in WooCommerce
              </a>
            )}
          </div>
        </div>
      )}

      <Button type="button" disabled={busy} onClick={submit} className="bg-rose-600 hover:bg-rose-700">
        {busy ? 'Bezig…' : 'Order aanmaken'}
      </Button>
    </div>
  )
}
