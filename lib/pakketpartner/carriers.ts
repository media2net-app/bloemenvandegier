import {
  getCarrierServiceAvond,
  getCarrierServiceOverdag,
  ppFetchJson,
} from '@/lib/pakketpartner/client'
import type { WcOrder } from '@/lib/woocommerce/orders'
import {
  getShippingMethodTitle,
  getShippingSlot,
} from '@/lib/woocommerce/order-display'

export type PpCarrierService = {
  id: string
  carrier_id?: string
  carrier_name: string
  carrier_service_name: string
  active?: number | boolean
}

/** Bekende Packs tijdvakken (account De Gier). */
export const PACKS_TIME_SLOT_SERVICES = [
  {
    id: 'acsr_zbzTQEnp26XAKwUt',
    label: 'Packs P2 · 08:00–10:30',
    match: /08[:.]?00.*10[:.]?30|10[:.]?30/,
  },
  {
    id: 'acsr_n3jFHs6Sn9am3fDr',
    label: 'Packs P2 · 08:00–12:00',
    match: /08[:.]?00.*12[:.]?00|voor\s*12|ochtend/,
  },
  {
    id: 'acsr_3rRuvNuzCiH7aT8W',
    label: 'Packs P2 · 13:00–17:00',
    match: /13[:.]?00.*17[:.]?00|middag|13[:.-]/,
  },
  {
    id: 'acsr_WmRZJahZwxiC1Zw2',
    label: 'Packs P2 · Gegarandeerde levering',
    match: /gegarandeerd/,
  },
  {
    id: 'acsr_jq9iO9bRPNQU4T7e',
    label: 'Packs P2 · standaard overdag',
    match: /overdag|packs|p2/,
  },
] as const

export const DEFAULT_CARRIER_OPTIONS: Array<{ id: string; label: string }> = [
  { id: 'acsr_Lpz10eFIPukQuPEA', label: 'Trunkrs Same Day (avond)' },
  ...PACKS_TIME_SLOT_SERVICES.map((s) => ({ id: s.id, label: s.label })),
  { id: 'acsr_9MfvkbuPW1BQezYQ', label: 'Packs MailPack' },
]

export async function listCarrierServices(): Promise<PpCarrierService[]> {
  const res = await ppFetchJson<{ data?: PpCarrierService[] }>('carrier_services')
  const list = Array.isArray(res.data) ? res.data : []
  return list.filter((s) => s.active === 1 || s.active === true || s.active == null)
}

/** Kies Packs-tijdvak / Trunkrs op basis van verzendtitel of bezorgtijd. */
export function pickCarrierServiceForOrder(order: WcOrder): string {
  const title = getShippingMethodTitle(order).toLowerCase()
  const slot = getShippingSlot(order)

  if (slot === 'avond' || /avond|trunkrs|same.?day/.test(title)) {
    return getCarrierServiceAvond()
  }

  for (const svc of PACKS_TIME_SLOT_SERVICES) {
    if (svc.id === getCarrierServiceOverdag()) continue
    if (svc.match.test(title)) return svc.id
  }

  return getCarrierServiceOverdag()
}

export function carrierOptionsFromApi(services: PpCarrierService[]) {
  if (!services.length) return DEFAULT_CARRIER_OPTIONS
  return services.map((s) => ({
    id: s.id,
    label: `${s.carrier_name} · ${s.carrier_service_name}`,
  }))
}
