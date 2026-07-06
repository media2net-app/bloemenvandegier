const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '../..')

function getWcConfig() {
  const url = process.env.WC_STORE_URL || process.env.OLD_SHOP_API_URL || 'https://www.bloemenvandegier.nl'
  const consumerKey = process.env.WC_CONSUMER_KEY || process.env.OLD_SHOP_CONSUMER_KEY
  const consumerSecret = process.env.WC_CONSUMER_SECRET || process.env.OLD_SHOP_CONSUMER_SECRET

  if (!consumerKey || !consumerSecret) {
    throw new Error(
      'WooCommerce credentials ontbreken.\n' +
        'Zet WC_STORE_URL, WC_CONSUMER_KEY en WC_CONSUMER_SECRET in .env\n' +
        '(of OLD_SHOP_* varianten).'
    )
  }

  return {
    baseUrl: url.replace(/\/$/, ''),
    consumerKey,
    consumerSecret,
  }
}

function buildUrl(endpoint, params = {}) {
  const { baseUrl, consumerKey, consumerSecret } = getWcConfig()
  const url = new URL(`${baseUrl}/wp-json/wc/v3/${endpoint.replace(/^\//, '')}`)
  url.searchParams.set('consumer_key', consumerKey)
  url.searchParams.set('consumer_secret', consumerSecret)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  })
  return url.toString()
}

async function wcFetch(endpoint, params = {}) {
  const url = buildUrl(endpoint, params)
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`WooCommerce API ${response.status}: ${text.slice(0, 300)}`)
  }

  const data = await response.json()
  const total = parseInt(response.headers.get('x-wp-total') || '0', 10)
  const totalPages = parseInt(response.headers.get('x-wp-totalpages') || '1', 10)

  return { data, total, totalPages, headers: response.headers }
}

async function wcFetchAll(endpoint, params = {}, options = {}) {
  const perPage = options.perPage || 100
  const maxPages = options.maxPages || Infinity
  const onPage = options.onPage

  const all = []
  let page = 1
  let total = 0
  let totalPages = 1

  while (page <= totalPages && page <= maxPages) {
    const result = await wcFetch(endpoint, { ...params, per_page: perPage, page })
    const items = Array.isArray(result.data) ? result.data : [result.data]
    all.push(...items)
    total = result.total
    totalPages = result.totalPages

    if (onPage) onPage(page, totalPages, items.length)

    if (items.length === 0) break
    page++
    if (options.delayMs) await delay(options.delayMs)
  }

  return { items: all, total, pages: page - 1 }
}

async function wcFetchWp(endpoint, params = {}) {
  const { baseUrl } = getWcConfig()
  const url = new URL(`${baseUrl}/wp-json/wp/v2/${endpoint.replace(/^\//, '')}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)))

  const response = await fetch(url.toString())
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`WordPress API ${response.status}: ${text.slice(0, 300)}`)
  }

  const data = await response.json()
  return {
    data,
    total: parseInt(response.headers.get('x-wp-total') || '0', 10),
    totalPages: parseInt(response.headers.get('x-wp-totalpages') || '1', 10),
  }
}

async function wcFetchWpAll(endpoint, params = {}, options = {}) {
  const perPage = options.perPage || 100
  const all = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const result = await wcFetchWp(endpoint, { ...params, per_page: perPage, page })
    const items = Array.isArray(result.data) ? result.data : [result.data]
    all.push(...items)
    totalPages = result.totalPages
    if (items.length === 0) break
    page++
    if (options.delayMs) await delay(options.delayMs)
  }

  return { items: all, total: all.length }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function writeJson(relativePath, data) {
  const fullPath = path.join(ROOT, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2))
}

module.exports = {
  ROOT,
  getWcConfig,
  wcFetch,
  wcFetchAll,
  wcFetchWpAll,
  writeJson,
  delay,
}
