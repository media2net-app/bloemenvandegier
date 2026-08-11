/**
 * Client-safe helpers for WooCommerce order display/print.
 */
import type { WcAddress, WcLineItem, WcMeta, WcOrder } from '@/lib/woocommerce/orders'

export function metaValue(meta: WcMeta[] | undefined, key: string): string {
  if (!meta?.length) return ''
  const found = meta.find((m) => m.key === key || m.key.toLowerCase() === key.toLowerCase())
  if (!found || found.value == null) return ''
  if (typeof found.value === 'string' || typeof found.value === 'number') return String(found.value)
  try {
    return JSON.stringify(found.value)
  } catch {
    return String(found.value)
  }
}

export function findMetaByKeys(meta: WcMeta[] | undefined, keys: string[]): string {
  if (!meta?.length) return ''
  for (const key of keys) {
    const val = metaValue(meta, key)
    if (val) return cleanKaartjeText(val)
  }
  const lowerKeys = keys.map((k) => k.toLowerCase())
  for (const m of meta) {
    const k = (m.key || '').toLowerCase()
    const kBare = k.replace(/^_/, '')
    if (
      lowerKeys.some(
        (lk) =>
          k === lk ||
          k === `_${lk}` ||
          kBare === lk ||
          k.includes(lk) ||
          kBare.includes(lk)
      )
    ) {
      const val = metaValue([m], m.key)
      if (val) return cleanKaartjeText(val)
    }
  }
  return ''
}

/** Schoon kaartjetekst: HTML eraf, prijs-addon (bijv. &euro; 0,50) weg. */
export function cleanKaartjeText(value: string): string {
  let text = value
    .replace(/<[^>]+>/g, ' ')
    // Eerst entities decoderen, anders blijft &amp;euro; staan
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x27;/gi, "'")

  // Prijs-addon van product extras (kaartje + €0,50)
  text = text
    .replace(/&euro;?\s*[\d]+(?:[.,][\d]+)?/gi, '')
    .replace(/&#8364;?\s*[\d]+(?:[.,][\d]+)?/gi, '')
    .replace(/€\s*[\d]+(?:[.,][\d]+)?/g, '')
    .replace(/\bEUR\s*[\d]+(?:[.,][\d]+)?/gi, '')
    // Trailing losse prijsresten
    .replace(/\s+[€]\s*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return text
}

export function formatAddress(addr?: WcAddress | null): string {
  if (!addr) return ''
  const name = [addr.first_name, addr.last_name].filter(Boolean).join(' ')
  return [
    name,
    addr.company,
    addr.address_1,
    addr.address_2,
    [addr.postcode, addr.city].filter(Boolean).join(' '),
    addr.country,
  ]
    .filter(Boolean)
    .join('\n')
}

export function formatMoney(amount: string | number, currency = 'EUR'): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (Number.isNaN(n)) return String(amount)
  return n.toLocaleString('nl-NL', { style: 'currency', currency })
}

export function getKaartjeTexts(order: WcOrder): Array<{ product: string; text: string }> {
  const cards: Array<{ product: string; text: string }> = []
  for (const item of order.line_items || []) {
    const text = findMetaByKeys(item.meta_data, [
      'persoonlijk kaartje toevoegen',
      'persoonlijk kaartje',
      'kaartje tekst',
      'kaartje',
      'card_message',
    ])
    if (text) cards.push({ product: item.name, text })
  }
  const orderCard = findMetaByKeys(order.meta_data, [
    'persoonlijk kaartje toevoegen',
    'persoonlijk kaartje',
    'kaartje tekst',
    'kaartje',
  ])
  if (orderCard && !cards.some((c) => c.text === orderCard)) {
    cards.push({ product: 'Bestelling', text: orderCard })
  }
  return cards
}

export function orderHasKaartje(order: WcOrder): boolean {
  return getKaartjeTexts(order).length > 0
}

/** YYYYMMDD → YYYY-MM-DD */
export function ymdToIsoDate(ymd: string): string {
  if (!/^\d{8}$/.test(ymd)) return ''
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`
}

/** Parse Iconic/jckwds of vrije datums naar YYYYMMDD. */
export function parseDeliveryDateToYmd(raw: string): string {
  const value = (raw || '').trim()
  if (!value) return ''
  if (/^\d{8}$/.test(value)) return value
  // YYYY-MM-DD
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}${iso[2]}${iso[3]}`
  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = value.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/)
  if (dmy) {
    return `${dmy[3]}${dmy[2].padStart(2, '0')}${dmy[1].padStart(2, '0')}`
  }
  const parsed = Date.parse(value)
  if (!Number.isNaN(parsed)) {
    const d = new Date(parsed)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}${m}${day}`
  }
  return ''
}

export function getDeliveryDateYmd(order: WcOrder): string {
  const fromYmd = findMetaByKeys(order.meta_data, ['jckwds_date_ymd', '_jckwds_date_ymd'])
  if (/^\d{8}$/.test(fromYmd)) return fromYmd

  const raw =
    findMetaByKeys(order.meta_data, [
      'jckwds_date',
      '_jckwds_date',
      'bezorgdatum',
      'delivery_date',
      '_delivery_date',
    ]) ||
    order.line_items
      ?.map((i) => findMetaByKeys(i.meta_data, ['bezorgdatum', 'delivery_date', 'jckwds_date']))
      .find(Boolean) ||
    ''

  return parseDeliveryDateToYmd(raw)
}

export function formatDeliveryDateDisplay(order: WcOrder): string {
  const ymd = getDeliveryDateYmd(order)
  if (!ymd) {
    const fallback = findMetaByKeys(order.meta_data, ['jckwds_date', 'bezorgdatum', 'delivery_date'])
    return fallback || '—'
  }
  const iso = ymdToIsoDate(ymd)
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso || '—'
  }
}

export type ShippingSlot = 'overdag' | 'avond' | 'other'

export function getShippingMethodTitle(order: WcOrder): string {
  return order.shipping_lines?.[0]?.method_title?.trim() || ''
}

/** Overdag / avond op basis van WooCommerce verzendtitel (Levering overdag / Avondlevering). */
export function getShippingSlot(order: WcOrder): ShippingSlot {
  const title = getShippingMethodTitle(order).toLowerCase()
  if (!title) return 'other'
  if (/avond/.test(title)) return 'avond'
  if (/overdag|daglevering|\bdag\b/.test(title)) return 'overdag'
  return 'other'
}

export function getShippingSlotLabel(slot: ShippingSlot): string {
  if (slot === 'avond') return 'Avond'
  if (slot === 'overdag') return 'Overdag'
  return 'Overig'
}

export function getDeliveryInfo(order: WcOrder): { date: string; time: string } {
  const ymd = getDeliveryDateYmd(order)
  const date =
    (ymd ? ymdToIsoDate(ymd) : '') ||
    findMetaByKeys(order.meta_data, [
      'jckwds_date',
      '_jckwds_date',
      'bezorgdatum',
      'delivery_date',
      '_delivery_date',
    ]) ||
    order.line_items
      ?.map((i) => findMetaByKeys(i.meta_data, ['bezorgdatum', 'delivery_date', 'jckwds_date']))
      .find(Boolean) ||
    ''

  const slot = getShippingSlot(order)
  const time =
    findMetaByKeys(order.meta_data, ['bezorgtijd', 'delivery_time', '_delivery_time']) ||
    order.line_items
      ?.map((i) => findMetaByKeys(i.meta_data, ['bezorgtijd', 'delivery_time']))
      .find(Boolean) ||
    (slot === 'avond' ? 'Avond (17:00–22:00)' : slot === 'overdag' ? 'Overdag' : '')

  return { date, time }
}

export type LineItemExtra = { label: string; value: string }

/** Strip HTML prijs-spans e.d. voor leesbare weergave. */
export function formatMetaDisplayValue(value: unknown): string {
  if (value == null || value === '') return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return cleanKaartjeText(String(value))
  }
  if (Array.isArray(value)) {
    return value
      .map((v) => formatMetaDisplayValue(v))
      .filter(Boolean)
      .join(', ')
  }
  if (typeof value === 'object') {
    // Simpele key/value objecten (geen PEWC groups)
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.every(([, v]) => v == null || ['string', 'number', 'boolean'].includes(typeof v))) {
      return entries
        .map(([k, v]) => `${k}: ${formatMetaDisplayValue(v)}`)
        .filter(Boolean)
        .join(', ')
    }
    try {
      return cleanKaartjeText(JSON.stringify(value))
    } catch {
      return ''
    }
  }
  return ''
}

type PewcField = {
  type?: string
  label?: string
  value?: unknown
  value_without_price?: unknown
  price?: number
  hidden?: string | boolean
}

function extractPewcExtras(productExtras: unknown): LineItemExtra[] {
  if (!productExtras || typeof productExtras !== 'object') return []
  const groups = (productExtras as { groups?: unknown }).groups
  if (!groups || typeof groups !== 'object' || Array.isArray(groups)) return []

  const extras: LineItemExtra[] = []
  for (const group of Object.values(groups as Record<string, unknown>)) {
    if (!group || typeof group !== 'object') continue
    for (const field of Object.values(group as Record<string, PewcField>)) {
      if (!field || typeof field !== 'object') continue
      if (field.hidden === true || field.hidden === '1' || field.hidden === 'hidden') continue
      const label = cleanKaartjeText(String(field.label || '')).trim()
      if (!label) continue

      let raw: unknown = field.value_without_price
      if (raw == null || raw === '' || (Array.isArray(raw) && !raw.length)) {
        raw = field.value
      }
      const value = formatMetaDisplayValue(raw)
      if (!value) continue
      extras.push({ label, value })
    }
  }
  return extras
}

const HIDDEN_META_KEYS = new Set([
  'product_extras',
  '_product_extras',
  '_pewc_product_extra_id',
  '_wcpdf_regular_price',
  '_reduced_stock',
])

const HIDDEN_META_PREFIXES = ['_pewc_', '_wcpdf', '_reduced', '_woosea', '_ywgc']

/**
 * Leesbare product-extras (PEWC e.d.) voor orderdetail / pakbon.
 * Parst `product_extras.groups` i.p.v. `[object Object]`.
 * PEWC zet zichtbare velden vaak als `_Label` + display_key.
 */
export function getLineItemExtras(item: WcLineItem): LineItemExtra[] {
  const extras: LineItemExtra[] = []
  const seen = new Set<string>()
  const seenLabels = new Set<string>()

  const push = (label: string, value: string) => {
    const key = `${label.toLowerCase()}|${value.toLowerCase()}`
    if (!label || !value || seen.has(key)) return
    seen.add(key)
    seenLabels.add(label.toLowerCase())
    extras.push({ label, value })
  }

  const meta = item.meta_data || []
  for (const m of meta) {
    const key = String(m.key || '')
    if (key === 'product_extras' || key === '_product_extras') {
      for (const extra of extractPewcExtras(m.value)) {
        push(extra.label, extra.value)
      }
    }
  }

  for (const m of meta) {
    const key = String(m.key || '')
    if (!key) continue
    if (key === 'product_extras' || key === '_product_extras') continue
    if (HIDDEN_META_KEYS.has(key)) continue
    if (HIDDEN_META_PREFIXES.some((p) => key.toLowerCase().startsWith(p))) continue

    const isPewcVisible =
      key.startsWith('_') &&
      Boolean(m.display_key || /^_[A-ZÀ-ÿ]/.test(key) || key.toLowerCase().includes('kaartje'))

    if (key.startsWith('_') && !isPewcVisible) continue
    if (typeof m.value === 'object' && m.value !== null) continue

    const label = cleanKaartjeText(
      String(m.display_key || key.replace(/^_/, '') || key)
    ).trim()
    // Al uit product_extras → skip dubbele underscore-meta
    if (seenLabels.has(label.toLowerCase())) continue

    const value = formatMetaDisplayValue(
      typeof m.display_value === 'string' && m.display_value
        ? m.display_value
        : m.value
    )
    if (value) push(label, value)
  }

  return extras
}

/** Extra's die geen kaartjetekst zijn — voor “globale toevoegingen” op de pakbon. */
export function getLineItemAdditions(item: WcLineItem): LineItemExtra[] {
  return getLineItemExtras(item).filter(
    (e) => !/kaartje/i.test(e.label) && !/kaartje/i.test(e.value)
  )
}
