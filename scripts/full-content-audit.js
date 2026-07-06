#!/usr/bin/env node
/**
 * Volledige content-pariteit audit: categorieën, producten, SEO-teksten.
 * Vergelijkt WC + live site data met Shopify.
 *
 * Usage:
 *   node --env-file=.env scripts/full-content-audit.js
 */

const fs = require('fs')
const path = require('path')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql, delay } = require('./lib/shopify-client')
const {
  buildCollectionSeoData,
  buildProductSeoData,
  resolveCollectionHandle,
  loadLiveCategorySeo,
} = require('./lib/seo-utils')

const ROOT = path.join(__dirname, '..')
const REPORT = path.join(ROOT, 'data/import/full-content-audit.json')
const WC_PRODUCTS = path.join(ROOT, 'data/import/wc-api/products.json')
const HUB_PAGES = path.join(ROOT, 'data/hub-pages.json')

async function fetchAllCollections(credentials) {
  const items = []
  let cursor = null
  do {
    const data = await shopifyGraphql(
      `query($cursor: String) {
        collections(first: 50, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { handle title descriptionHtml seo { title description } }
        }
      }`,
      { cursor },
      credentials
    )
    items.push(...data.collections.nodes)
    cursor = data.collections.pageInfo.hasNextPage ? data.collections.pageInfo.endCursor : null
    await delay(100)
  } while (cursor)
  return items
}

async function fetchAllProducts(credentials) {
  const items = []
  let cursor = null
  do {
    const data = await shopifyGraphql(
      `query($cursor: String) {
        products(first: 50, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { handle title descriptionHtml seo { title description } }
        }
      }`,
      { cursor },
      credentials
    )
    items.push(...data.products.nodes)
    cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null
    await delay(100)
  } while (cursor)
  return items
}

function stripHtmlLen(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length
}

async function main() {
  const credentials = await getCredentials()
  const wcCollections = buildCollectionSeoData().filter((c) => c.descriptionHtml || c.seoTitle)
  const wcProducts = buildProductSeoData()
  const liveSeo = loadLiveCategorySeo()
  const wcProductItems = JSON.parse(fs.readFileSync(WC_PRODUCTS, 'utf-8'))
  const hubPages = fs.existsSync(HUB_PAGES) ? JSON.parse(fs.readFileSync(HUB_PAGES, 'utf-8')) : {}

  const [shopifyCollections, shopifyProducts] = await Promise.all([
    fetchAllCollections(credentials),
    fetchAllProducts(credentials),
  ])

  const shopifyCollectionByHandle = new Map(shopifyCollections.map((c) => [c.handle, c]))
  const shopifyProductByHandle = new Map(shopifyProducts.map((p) => [p.handle, p]))

  const collectionIssues = []
  let collectionsOk = 0

  for (const wc of wcCollections) {
    if (wc.wcSlug === 'uncategorized') continue
    const shopify = shopifyCollectionByHandle.get(wc.handle)
    const expectedLen = stripHtmlLen(wc.descriptionHtml)
    const actualLen = stripHtmlLen(shopify?.descriptionHtml)
    const issues = []

    if (!shopify) issues.push('collection_missing')
    else {
      if (expectedLen > 200 && actualLen < expectedLen * 0.5) issues.push('seo_text_too_short')
      if (wc.seoTitle && !(shopify.seo?.title || '').trim()) issues.push('missing_seo_title')
      if (wc.seoDescription && !(shopify.seo?.description || '').trim()) issues.push('missing_seo_description')
    }

    if (issues.length) {
      collectionIssues.push({
        handle: wc.handle,
        wcSlug: wc.wcSlug,
        name: wc.name,
        issues,
        contentSource: wc.contentSource,
        expectedLength: expectedLen,
        shopifyLength: actualLen,
        liveSections: liveSeo[wc.wcSlug]?.liveSectionCount || 0,
        productCount: liveSeo[wc.wcSlug]?.productCount || null,
      })
    } else if (shopify) {
      collectionsOk++
    }
  }

  const productIssues = []
  let productsOk = 0
  const productBodyIssues = []

  for (const wc of wcProducts) {
    const shopify = shopifyProductByHandle.get(wc.handle)
    const issues = []
    if (!shopify) issues.push('product_missing')
    else {
      if (wc.seoTitle && !(shopify.seo?.title || '').trim()) issues.push('missing_seo_title')
      if (wc.seoDescription && !(shopify.seo?.description || '').trim()) issues.push('missing_seo_description')
    }
    if (issues.length) {
      productIssues.push({ handle: wc.handle, wcSlug: wc.wcSlug, issues })
    } else if (shopify) {
      productsOk++
    }
  }

  for (const product of wcProductItems) {
    const handle = product.slug
    const shopify = shopifyProductByHandle.get(handle)
    const wcBodyLen = stripHtmlLen(product.description)
    if (wcBodyLen < 100) continue
    const shopifyBodyLen = stripHtmlLen(shopify?.descriptionHtml)
    if (!shopify) continue
    if (shopifyBodyLen < wcBodyLen * 0.4) {
      productBodyIssues.push({
        handle: shopify.handle,
        wcSlug: product.slug,
        wcBodyLength: wcBodyLen,
        shopifyBodyLength: shopifyBodyLen,
      })
    }
  }

  const liveOnlyCategories = Object.values(liveSeo).filter(
    (c) => c.liveHtmlLength > 500 && (c.apiDescriptionLength || 0) < 100
  )

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      wcCategoriesWithSeo: wcCollections.length,
      shopifyCollections: shopifyCollections.length,
      collectionsOk,
      collectionIssues: collectionIssues.length,
      liveOnlyCategorySeo: liveOnlyCategories.length,
      wcProductsWithYoast: wcProducts.length,
      shopifyProducts: shopifyProducts.length,
      productsOk,
      productMetaIssues: productIssues.length,
      productBodyIssues: productBodyIssues.length,
      hubPages: Object.keys(hubPages).length,
    },
    collectionIssues: collectionIssues.sort((a, b) => b.expectedLength - a.expectedLength),
    productMetaIssues: productIssues,
    productBodyIssues: productBodyIssues.slice(0, 50),
    liveOnlyCategories: liveOnlyCategories.map((c) => ({
      slug: c.wcSlug,
      name: c.name,
      liveSections: c.liveSectionCount,
      liveHtmlLength: c.liveHtmlLength,
      apiDescriptionLength: c.apiDescriptionLength,
    })),
    notes: [
      'Veel categorieën hebben uitgebreide SEO alleen op de live site (Avada/Fusion), niet in WC API.',
      'liveOnlyCategories zijn gescraped via scripts/scrape-category-seo-live.js.',
      'productBodyIssues vergelijkt WC slug met Shopify handle — kan false positives geven bij slug-mismatch.',
    ],
  }

  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))

  console.log('=== Volledige content audit ===')
  console.log(`Collecties OK: ${collectionsOk}/${wcCollections.length}`)
  console.log(`Collectie issues: ${collectionIssues.length}`)
  console.log(`  waarvan live-only SEO bron: ${liveOnlyCategories.length}`)
  console.log(`Product meta OK: ${productsOk}/${wcProducts.length}`)
  console.log(`Product body issues (sample): ${productBodyIssues.length}`)
  console.log(`\nTop collectie issues:`)
  collectionIssues.slice(0, 10).forEach((item) => {
    console.log(`  - ${item.handle}: ${item.issues.join(', ')} (verwacht ${item.expectedLength}, shopify ${item.shopifyLength}, bron: ${item.contentSource})`)
  })
  console.log(`\nRapport: ${REPORT}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
