import fs from 'fs'
import path from 'path'

export interface WooCommerceStatus {
  connected: boolean
  hasCredentials: boolean
  storeUrl: string | null
  productTotal: number | null
  lastFetchAt: string | null
  manifestCounts: Record<string, number> | null
  message: string
}

function getWcCredentials() {
  const storeUrl = process.env.WC_STORE_URL || process.env.OLD_SHOP_API_URL || null
  const consumerKey = process.env.WC_CONSUMER_KEY || process.env.OLD_SHOP_CONSUMER_KEY || null
  const consumerSecret = process.env.WC_CONSUMER_SECRET || process.env.OLD_SHOP_CONSUMER_SECRET || null
  return { storeUrl, consumerKey, consumerSecret }
}

function readManifest(): {
  fetchedAt: string
  counts: Record<string, number>
} | null {
  try {
    const manifestPath = path.join(process.cwd(), 'data/import/wc-api/manifest.json')
    if (!fs.existsSync(manifestPath)) return null
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  } catch {
    return null
  }
}

export async function getWooCommerceStatus(): Promise<WooCommerceStatus> {
  const { storeUrl, consumerKey, consumerSecret } = getWcCredentials()
  const manifest = readManifest()

  if (!consumerKey || !consumerSecret) {
    return {
      connected: false,
      hasCredentials: false,
      storeUrl,
      productTotal: null,
      lastFetchAt: manifest?.fetchedAt ?? null,
      manifestCounts: manifest?.counts ?? null,
      message: 'Geen API keys — zet WC_CONSUMER_KEY + WC_CONSUMER_SECRET in .env',
    }
  }

  const baseUrl = (storeUrl || 'https://www.bloemenvandegier.nl').replace(/\/$/, '')
  const url = new URL(`${baseUrl}/wp-json/wc/v3/products`)
  url.searchParams.set('consumer_key', consumerKey)
  url.searchParams.set('consumer_secret', consumerSecret)
  url.searchParams.set('per_page', '1')
  url.searchParams.set('status', 'publish')

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5_000),
    })

    if (!response.ok) {
      return {
        connected: false,
        hasCredentials: true,
        storeUrl: baseUrl,
        productTotal: null,
        lastFetchAt: manifest?.fetchedAt ?? null,
        manifestCounts: manifest?.counts ?? null,
        message: `API fout ${response.status} — controleer keys en rechten`,
      }
    }

    const productTotal = parseInt(response.headers.get('x-wp-total') || '0', 10)

    return {
      connected: true,
      hasCredentials: true,
      storeUrl: baseUrl,
      productTotal,
      lastFetchAt: manifest?.fetchedAt ?? null,
      manifestCounts: manifest?.counts ?? null,
      message: `REST API verbonden — ${productTotal} producten live`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Verbinding mislukt'
    return {
      connected: false,
      hasCredentials: true,
      storeUrl: baseUrl,
      productTotal: null,
      lastFetchAt: manifest?.fetchedAt ?? null,
      manifestCounts: manifest?.counts ?? null,
      message: `Niet bereikbaar — ${message}`,
    }
  }
}
