/**
 * Pakketpartner REST API client.
 * Docs: https://pakketpartner.nl/pakketpartner-rest-api/
 * Auth: HTTP Basic, API key as username, empty password.
 */

const API_BASE = 'https://dashboard.pakketpartner.nl/api/v1'

export function getPakketpartnerApiKey() {
  const key = process.env.PAKKETPARTNER_API_KEY?.trim()
  if (!key) {
    throw new Error('PAKKETPARTNER_API_KEY ontbreekt in .env')
  }
  return key
}

export function getPakketpartnerSenderHash() {
  return process.env.PAKKETPARTNER_SENDER_HASH?.trim() || 's_PVBFAoct9QWX4qnB'
}

/** Trunkrs Same Day – typisch avond / same-day */
export function getCarrierServiceAvond() {
  return process.env.PAKKETPARTNER_CARRIER_AVOND?.trim() || 'acsr_Lpz10eFIPukQuPEA'
}

/** Packs P2 – typisch overdag */
export function getCarrierServiceOverdag() {
  return process.env.PAKKETPARTNER_CARRIER_OVERDAG?.trim() || 'acsr_jq9iO9bRPNQU4T7e'
}

function authHeader(apiKey: string) {
  const token = Buffer.from(`${apiKey}:`, 'utf8').toString('base64')
  return `Basic ${token}`
}

export class PakketpartnerApiError extends Error {
  status: number
  payload: unknown
  constructor(message: string, status: number, payload?: unknown) {
    super(message)
    this.name = 'PakketpartnerApiError'
    this.status = status
    this.payload = payload
  }
}

async function parseJson(res: Response) {
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return text
  }
}

export async function ppFetchJson<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const apiKey = getPakketpartnerApiKey()
  const url = `${API_BASE}/${path.replace(/^\//, '')}`
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authHeader(apiKey),
      ...(init.headers || {}),
    },
    cache: 'no-store',
  })

  const payload = await parseJson(res)
  if (!res.ok) {
    const msg =
      (payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message?: string }).message || '')
        : '') || `Pakketpartner API ${res.status}`
    throw new PakketpartnerApiError(msg || `Pakketpartner API ${res.status}`, res.status, payload)
  }
  return payload as T
}

export async function ppFetchPdf(path: string): Promise<Buffer> {
  const apiKey = getPakketpartnerApiKey()
  const url = `${API_BASE}/${path.replace(/^\//, '')}`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/pdf',
      Authorization: authHeader(apiKey),
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new PakketpartnerApiError(
      `Label PDF ophalen mislukt (${res.status})`,
      res.status,
      text.slice(0, 300)
    )
  }
  const ab = await res.arrayBuffer()
  return Buffer.from(ab)
}

export type PpLabel = {
  tracking_code?: string | null
  tracking_url?: string | null
  label_url_pdf?: string | null
  label_url_png?: string | null
  label_url_zpl?: string | null
}

export type PpShipment = {
  id: string
  carrier_service?: string
  order_reference?: string | null
  carrier?: { key?: string; name?: string; service?: string; profile?: string | null }
  recipient?: Record<string, unknown>
  labels?: PpLabel[]
  tracking_code?: string | null
  tracking_url?: string | null
  label_url_pdf?: string | null
  created_at?: string
}
