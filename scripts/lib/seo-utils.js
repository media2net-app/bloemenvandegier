const fs = require('fs')
const path = require('path')
const { parseRecords } = require('./wc-import-utils')

const ROOT = path.join(__dirname, '../..')
const WC_CATEGORIES = path.join(ROOT, 'data/import/wc-api/categories.json')
const WC_PRODUCTS = path.join(ROOT, 'data/import/wc-api/products.json')
const WC_EXPORT = path.join(ROOT, 'data/import/wc-export-latest.csv')
const SHOPIFY_PRODUCTS = path.join(ROOT, 'data/import/shopify-products.csv')
const CATEGORY_SEO_LIVE = path.join(ROOT, 'data/import/category-seo-live.json')

const COLLECTION_SLUG_ALIASES = {
  'boeket-bloemen': 'alle-boeketten',
  allium: 'alliums',
  alstroemerias: 'alstroemeria-s',
  campanula: 'campanula-s',
  freesias: 'freesia-s',
  'glitter-glamour': 'gekleurde-kerstbomen',
  'bloemen-sturen-geliefde': 'geliefde',
  gerberas: 'gerbera-s',
  guirlande: 'guirlandes',
  hortensias: 'hortensia-s',
  moederdagcadeau: 'moederdag-cadeau',
  'mos-kopen': 'mossen',
  'zonnebloemen-in-vaas': 'zonnebloemen',
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function stripSimpleHtml(text) {
  return String(text || '')
    .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '')
}

function capitalizeHeading(text) {
  const value = String(text || '').trim()
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function isLikelyHeading(line, nextLine) {
  if (!line || line.length > 80) return false
  if (line.endsWith('.') || line.endsWith('!') || line.endsWith('?')) return false
  if (!nextLine || nextLine.length < 40) return false
  return true
}

function descriptionToHtml(text) {
  let raw = decodeHtmlEntities(text).trim()
  if (!raw) return ''

  if (/<(?:h[1-6]|p|ul|ol|li|div|section)\b/i.test(raw)) return raw

  raw = stripSimpleHtml(raw)

  const lines = raw.replace(/\r\n/g, '\n').split('\n').map((line) => line.trim()).filter(Boolean)
  const parts = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const nextLine = lines[index + 1]

    if (isLikelyHeading(line, nextLine)) {
      parts.push(`<h2>${escapeHtml(capitalizeHeading(line))}</h2>`)
      index++
      const paragraph = []
      while (index < lines.length) {
        const current = lines[index]
        const upcoming = lines[index + 1]
        if (isLikelyHeading(current, upcoming)) break
        paragraph.push(current)
        index++
      }
      if (paragraph.length) {
        parts.push(`<p>${escapeHtml(paragraph.join(' '))}</p>`)
      }
      continue
    }

    parts.push(`<p>${escapeHtml(line)}</p>`)
    index++
  }

  return parts.join('\n')
}

function buildShopByTitleMap() {
  const shop = parseRecords(SHOPIFY_PRODUCTS)
  const map = new Map()
  for (const row of shop) {
    if (!row.Handle || !row.Title) continue
    const key = row.Title.split('|')[0].trim().toLowerCase()
    if (!map.has(key)) map.set(key, row.Handle)
  }
  return map
}

function buildPermalinkMap() {
  const wc = parseRecords(WC_EXPORT)
  const map = new Map()
  for (const row of wc) {
    const match = (row.Permalink || '').match(/\/product\/([^/]+)\/?/)
    if (match) map.set(match[1], row)
  }
  return map
}

function resolveShopifyHandle(wcSlug, shopByTitle, permalinkMap) {
  const row = permalinkMap.get(wcSlug)
  const title = row?.Title?.split('|')[0]?.trim().toLowerCase()
  return shopByTitle.get(title) || wcSlug
}

function resolveCollectionHandle(wcSlug) {
  return COLLECTION_SLUG_ALIASES[wcSlug] || wcSlug
}

function loadLiveCategorySeo() {
  if (!fs.existsSync(CATEGORY_SEO_LIVE)) return {}
  return JSON.parse(fs.readFileSync(CATEGORY_SEO_LIVE, 'utf-8'))
}

function liveSectionsToHtml(sections) {
  if (!sections?.length) return ''
  return sections
    .map((s) => `<h2>${escapeHtml(s.title)}</h2>\n<p>${escapeHtml(s.paragraphs.join(' '))}</p>`)
    .join('\n')
}

function buildCollectionDescriptionHtml(category, liveData) {
  const yoast = category.yoast_head_json || {}
  const apiHtml = descriptionToHtml(category.description || '')
  const liveHtml = liveSectionsToHtml(liveData?.sections)

  if (liveHtml.length > apiHtml.length + 200) return liveHtml
  if (apiHtml.length > 100) return apiHtml
  if (liveHtml) return liveHtml
  if (yoast.description) return `<p>${escapeHtml(yoast.description)}</p>`
  return ''
}

function buildCollectionSeoData() {
  const categories = JSON.parse(fs.readFileSync(WC_CATEGORIES, 'utf-8'))
  const liveSeo = loadLiveCategorySeo()

  return categories.map((category) => {
    const handle = resolveCollectionHandle(category.slug)
    const yoast = category.yoast_head_json || {}
    const liveData = liveSeo[category.slug]
    const descriptionHtml = buildCollectionDescriptionHtml(category, liveData)
    const apiLen = (category.description || '').trim().length
    const liveLen = liveData?.liveHtmlLength || 0

    return {
      wcSlug: category.slug,
      handle,
      name: category.name,
      descriptionHtml,
      seoTitle: yoast.title || null,
      seoDescription: yoast.description || null,
      hasBodyDescription: Boolean(category.description?.trim()),
      hasLiveSeo: liveLen > 200,
      hasYoast: Boolean(yoast.title || yoast.description),
      contentSource:
        liveLen > apiLen + 200 ? 'live' : apiLen > 100 ? 'api' : liveLen > 0 ? 'live' : yoast.description ? 'yoast' : 'none',
      apiDescriptionLength: apiLen,
      liveHtmlLength: liveLen,
    }
  })
}

function buildProductSeoData() {
  const products = JSON.parse(fs.readFileSync(WC_PRODUCTS, 'utf-8'))
  const shopByTitle = buildShopByTitleMap()
  const permalinkMap = buildPermalinkMap()
  const map = new Map()

  for (const product of products) {
    const yoast = product.yoast_head_json || {}
    if (!yoast.title && !yoast.description) continue

    const handle = resolveShopifyHandle(product.slug, shopByTitle, permalinkMap)
    map.set(handle, {
      wcSlug: product.slug,
      handle,
      seoTitle: yoast.title || null,
      seoDescription: yoast.description || null,
    })
  }

  return [...map.values()]
}

module.exports = {
  COLLECTION_SLUG_ALIASES,
  escapeHtml,
  descriptionToHtml,
  resolveCollectionHandle,
  resolveShopifyHandle,
  buildShopByTitleMap,
  buildPermalinkMap,
  buildCollectionSeoData,
  buildProductSeoData,
  buildCollectionDescriptionHtml,
  liveSectionsToHtml,
  loadLiveCategorySeo,
}
