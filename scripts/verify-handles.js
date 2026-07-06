#!/usr/bin/env node
/**
 * Verifieer dat Shopify handles overeenkomen met WC slugs.
 *
 * Usage:
 *   node scripts/verify-handles.js
 */

const fs = require('fs')
const path = require('path')
const { parseRecords } = require('./lib/wc-import-utils')
const { resolveCollectionHandle, resolveShopifyHandle, buildShopByTitleMap, buildPermalinkMap } = require('./lib/seo-utils')

const ROOT = path.join(__dirname, '..')
const WC_EXPORT = path.join(ROOT, 'data/import/wc-export-latest.csv')
const SHOPIFY_PRODUCTS = path.join(ROOT, 'data/import/shopify-products.csv')
const WC_CATEGORIES = path.join(ROOT, 'data/import/wc-api/categories.json')
const SHOPIFY_COLLECTIONS = path.join(ROOT, 'data/import/shopify-collections-report.json')
const REPORT = path.join(ROOT, 'data/import/handles-verify-report.json')

/** WC producten die bewust niet in Shopify staan (test, intern, abonnement-prototype). */
const EXCLUDE_PRODUCT_SLUGS = new Set([
  'test-mark',
  'mos-bundel',
  'test-abbo',
  'nobilis-kerstgroen-5kg-2-2',
  'grote-rode-rozen',
  'onbewerkte-rode-roos-per-stuk-te-bestellen',
  'onbewerkte-rode-roos-150',
  'onbewerkte-rode-roos-195',
  'onbewerkte-rode-roos-250',
  'onbewerkte-rode-roos-142',
  'per-stuk-verpakte-rode-roos-245',
  'onbewerkte-gemengde-roos-092-kopie',
  'bruiloftsemmer-warm-oranje',
  'bruiloftsemmer-wit',
  'bruiloftsemmer-roze',
  '55-avalanche-5-red-naomi-in-het-midden-totaal-60',
  'cfd-plukboeket',
])

const EXCLUDE_COLLECTION_SLUGS = new Set(['uncategorized', 'upsell', '16', '5'])

function main() {
  const wcProducts = parseRecords(WC_EXPORT)
  const shopProducts = parseRecords(SHOPIFY_PRODUCTS)
  const shopHandles = new Set(shopProducts.map((r) => r.Handle).filter(Boolean))
  const shopByTitle = buildShopByTitleMap()
  const permalinkMap = buildPermalinkMap()

  const productMismatches = []
  const productMissing = []

  const seen = new Set()
  for (const row of wcProducts) {
    const match = (row.Permalink || '').match(/\/product\/([^/]+)\/?/)
    if (!match) continue
    const wcSlug = match[1]
    if (seen.has(wcSlug)) continue
    if (EXCLUDE_PRODUCT_SLUGS.has(wcSlug)) continue
    seen.add(wcSlug)

    const expected = resolveShopifyHandle(wcSlug, shopByTitle, permalinkMap)
    if (!shopHandles.has(expected)) {
      productMissing.push({ wcSlug, expectedHandle: expected, title: row.Title })
    } else if (expected !== wcSlug) {
      productMismatches.push({ wcSlug, shopifyHandle: expected, title: row.Title })
    }
  }

  const categories = JSON.parse(fs.readFileSync(WC_CATEGORIES, 'utf-8'))
  let shopifyCollectionHandles = new Set()
  if (fs.existsSync(SHOPIFY_COLLECTIONS)) {
    const collReport = JSON.parse(fs.readFileSync(SHOPIFY_COLLECTIONS, 'utf-8'))
    shopifyCollectionHandles = new Set(
      (collReport.results || []).map((r) => r.handle).filter(Boolean)
    )
  }
  const missingCollReport = path.join(ROOT, 'data/import/shopify-missing-collections-report.json')
  if (fs.existsSync(missingCollReport)) {
    const extra = JSON.parse(fs.readFileSync(missingCollReport, 'utf-8'))
    for (const r of extra.results || []) {
      if (r.handle) shopifyCollectionHandles.add(r.handle)
    }
  }

  /** Hub-pagina's die in WC als categorie bestaan maar in Shopify een /pages/ zijn. */
  const HUB_PAGE_COLLECTIONS = new Set(['bloemenpakketten'])

  const collectionMissing = []
  const collectionAliases = []

  for (const cat of categories) {
    if (!cat.slug || cat.slug === 'uncategorized' || EXCLUDE_COLLECTION_SLUGS.has(cat.slug)) continue
    const expected = resolveCollectionHandle(cat.slug)
    if (expected !== cat.slug) {
      collectionAliases.push({ wcSlug: cat.slug, shopifyHandle: expected, name: cat.name })
    }
    if (HUB_PAGE_COLLECTIONS.has(cat.slug)) continue
    if (shopifyCollectionHandles.size && !shopifyCollectionHandles.has(expected)) {
      collectionMissing.push({ wcSlug: cat.slug, expectedHandle: expected, name: cat.name })
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    products: {
      wcUnique: seen.size,
      shopifyTotal: shopHandles.size,
      missing: productMissing.length,
      aliased: productMismatches.length,
      ok: seen.size - productMissing.length,
    },
    collections: {
      wcTotal: categories.filter((c) => c.slug && c.slug !== 'uncategorized').length,
      missing: collectionMissing.length,
      aliased: collectionAliases.length,
    },
    productMissing: productMissing.slice(0, 50),
    productAliases: productMismatches.slice(0, 30),
    collectionMissing: collectionMissing.slice(0, 30),
    collectionAliases: collectionAliases.slice(0, 30),
    passed: productMissing.length === 0,
  }

  fs.mkdirSync(path.dirname(REPORT), { recursive: true })
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))

  console.log(`Producten OK: ${report.products.ok}/${report.products.wcUnique}`)
  console.log(`Producten ontbrekend: ${report.products.missing}`)
  console.log(`Collecties ontbrekend: ${report.collections.missing}`)
  console.log(`Rapport: ${REPORT}`)
  if (!report.passed) process.exit(1)
}

main()
