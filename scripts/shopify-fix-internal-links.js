#!/usr/bin/env node
/**
 * Vervang oude WooCommerce-URLs in Shopify content (pagina's, collecties, producten).
 *
 * Usage:
 *   node --env-file=.env scripts/shopify-fix-internal-links.js
 *   node --env-file=.env scripts/shopify-fix-internal-links.js --dry-run
 *   node --env-file=.env scripts/shopify-fix-internal-links.js --pages-only
 */

const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql, delay } = require('./lib/shopify-client')
const { resolveCollectionHandle, resolveShopifyHandle, buildShopByTitleMap, buildPermalinkMap } = require('./lib/seo-utils')

const ROOT = path.join(__dirname, '..')
const REDIRECTS_CSV = path.join(ROOT, 'shopify-redirects.csv')
const WC_PRODUCTS = path.join(ROOT, 'data/import/wc-api/products.json')
const REPORT = path.join(ROOT, 'data/import/shopify-internal-links-report.json')

const dryRun = process.argv.includes('--dry-run')
const pagesOnly = process.argv.includes('--pages-only')
const collectionsOnly = process.argv.includes('--collections-only')
const productsOnly = process.argv.includes('--products-only')

const WC_HOSTS = [
  'https://www.bloemenvandegier.nl',
  'https://bloemenvandegier.nl',
  'http://www.bloemenvandegier.nl',
  'http://bloemenvandegier.nl',
  'https://woocommerce-1218090-4329870.cloudwaysapps.com',
]

function loadRedirectPageMap() {
  const map = new Map()
  if (!fs.existsSync(REDIRECTS_CSV)) return map
  const rows = parse(fs.readFileSync(REDIRECTS_CSV, 'utf-8'), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  })
  for (const row of rows) {
    const from = (row['Redirect from'] || row.path || '').replace(/\/$/, '')
    const to = row['Redirect to'] || row.target || ''
    if (to.startsWith('/pages/')) {
      map.set(from.replace(/^\//, ''), to)
    }
  }
  return map
}

function buildProductSlugMap() {
  const products = JSON.parse(fs.readFileSync(WC_PRODUCTS, 'utf-8'))
  const shopByTitle = buildShopByTitleMap()
  const permalinkMap = buildPermalinkMap()
  const map = new Map()
  for (const product of products) {
    const handle = resolveShopifyHandle(product.slug, shopByTitle, permalinkMap)
    map.set(product.slug, handle)
  }
  return map
}

function rewriteHtml(html, pagePathMap, productSlugMap) {
  if (!html || typeof html !== 'string') return { html, changes: 0 }

  let output = html
  let changes = 0

  function countReplace(pattern, replacer) {
    const before = output
    output = output.replace(pattern, (...args) => {
      changes++
      return typeof replacer === 'function' ? replacer(...args) : replacer
    })
    if (output === before && typeof replacer === 'string') {
      // no-op for string replacer counted wrong - use only function form for accurate count
    }
  }

  // Strip WC host prefixes to relative paths
  for (const host of WC_HOSTS) {
    const escaped = host.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(escaped, 'gi')
    const before = output
    output = output.replace(re, '')
    if (output !== before) changes++
  }

  // product-categorie → collections
  output = output.replace(
    /(?:href=["'])?\/?product-categorie\/([a-z0-9-]+)\/?/gi,
    (match, slug) => {
      changes++
      const handle = resolveCollectionHandle(slug.toLowerCase())
      const prefix = match.includes('href=') ? 'href="/collections/' : '/collections/'
      const suffix = match.includes('href=') ? '"' : ''
      return `${prefix}${handle}${suffix}`
    }
  )

  // product-category (EN variant)
  output = output.replace(
    /(?:href=["'])?\/?product-category\/([a-z0-9-]+)\/?/gi,
    (match, slug) => {
      changes++
      const handle = resolveCollectionHandle(slug.toLowerCase())
      const prefix = match.includes('href=') ? 'href="/collections/' : '/collections/'
      const suffix = match.includes('href=') ? '"' : ''
      return `${prefix}${handle}${suffix}`
    }
  )

  // product → products
  output = output.replace(
    /(?:href=["'])?\/?product\/([a-z0-9-]+)\/?/gi,
    (match, slug) => {
      changes++
      const handle = productSlugMap.get(slug.toLowerCase()) || slug.toLowerCase()
      const prefix = match.includes('href=') ? 'href="/products/' : '/products/'
      const suffix = match.includes('href=') ? '"' : ''
      return `${prefix}${handle}${suffix}`
    }
  )

  // Root-level WC page paths → /pages/ (from redirects)
  for (const [wcPath, shopifyPath] of pagePathMap) {
    const slug = wcPath.replace(/^\//, '')
    if (!slug || slug.includes('/')) continue
    const patterns = [
      new RegExp(`href=["']\\/?${slug}\\/?["']`, 'gi'),
      new RegExp(`href=["']${slug}\\/?["']`, 'gi'),
    ]
    for (const pattern of patterns) {
      const before = output
      output = output.replace(pattern, `href="${shopifyPath}"`)
      if (output !== before) changes++
    }
  }

  // collections hub pages that should be /pages/
  const hubPaths = [
    'rozen-bestellen-bij-de-gier',
    'alle-rozen',
    'boeketten',
    'exclusieve-boeketten',
    'pioenrozen-bestellen-bij-de-gier',
    'groen-decoratief',
    'voorjaarsbloemen',
    'bloemenpakketten',
    'olijfbomen',
    'pasen',
    'weekdeals',
  ]
  for (const hub of hubPaths) {
    const before = output
    output = output.replace(
      new RegExp(`href=["']/collections/${hub}/?["']`, 'gi'),
      `href="/pages/${hub}"`
    )
    if (output !== before) changes++
  }

  return { html: output, changes }
}

async function fetchAllPages(credentials) {
  const items = []
  let cursor = null
  do {
    const data = await shopifyGraphql(
      `query($cursor: String) {
        pages(first: 50, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { id handle title body }
        }
      }`,
      { cursor },
      credentials
    )
    items.push(...data.pages.nodes)
    cursor = data.pages.pageInfo.hasNextPage ? data.pages.pageInfo.endCursor : null
    await delay(100)
  } while (cursor)
  return items
}

async function fetchAllCollections(credentials) {
  const items = []
  let cursor = null
  do {
    const data = await shopifyGraphql(
      `query($cursor: String) {
        collections(first: 50, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { id handle title descriptionHtml }
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
          nodes { id handle title descriptionHtml }
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

async function updatePage(id, body, credentials) {
  const data = await shopifyGraphql(
    `mutation($id: ID!, $page: PageUpdateInput!) {
      pageUpdate(id: $id, page: $page) {
        page { id handle }
        userErrors { field message }
      }
    }`,
    { id, page: { body } },
    credentials
  )
  const errors = data.pageUpdate.userErrors
  if (errors?.length) throw new Error(errors.map((e) => e.message).join('; '))
  return data.pageUpdate.page
}

async function updateCollection(id, descriptionHtml, credentials) {
  const data = await shopifyGraphql(
    `mutation($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection { id handle }
        userErrors { field message }
      }
    }`,
    { input: { id, descriptionHtml } },
    credentials
  )
  const errors = data.collectionUpdate.userErrors
  if (errors?.length) throw new Error(errors.map((e) => e.message).join('; '))
  return data.collectionUpdate.collection
}

async function updateProduct(id, descriptionHtml, credentials) {
  const data = await shopifyGraphql(
    `mutation($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id handle }
        userErrors { field message }
      }
    }`,
    { input: { id, descriptionHtml } },
    credentials
  )
  const errors = data.productUpdate.userErrors
  if (errors?.length) throw new Error(errors.map((e) => e.message).join('; '))
  return data.productUpdate.product
}

async function processItems(items, type, rewriteFn, updateFn, credentials, report) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const field = type === 'page' ? 'body' : 'descriptionHtml'
    const original = item[field] || ''
    const { html, changes } = rewriteFn(original)

    if (changes === 0) {
      report.skipped++
      continue
    }

    process.stdout.write(`[${type}] ${item.handle} (${changes} links)... `)

    if (dryRun) {
      report.updated++
      report.results.push({ type, handle: item.handle, changes, status: 'dry-run' })
      console.log('dry-run')
      continue
    }

    try {
      await updateFn(item.id, html, credentials)
      report.updated++
      report.results.push({ type, handle: item.handle, changes, status: 'updated' })
      console.log('ok')
      await delay(200)
    } catch (error) {
      report.errors.push({ type, handle: item.handle, error: error.message })
      report.results.push({ type, handle: item.handle, changes, status: 'error', error: error.message })
      console.log(`fout: ${error.message}`)
    }
  }
}

async function main() {
  const credentials = await getCredentials()
  const pagePathMap = loadRedirectPageMap()
  const productSlugMap = buildProductSlugMap()
  const rewriteFn = (html) => rewriteHtml(html, pagePathMap, productSlugMap)

  const report = {
    startedAt: new Date().toISOString(),
    dryRun,
    updated: 0,
    skipped: 0,
    errors: [],
    results: [],
  }

  const runAll = !pagesOnly && !collectionsOnly && !productsOnly

  if (runAll || pagesOnly) {
    console.log('Pagina\'s ophalen...')
    const pages = await fetchAllPages(credentials)
    console.log(`Pagina's: ${pages.length}`)
    await processItems(pages, 'page', rewriteFn, updatePage, credentials, report)
  }

  if (runAll || collectionsOnly) {
    console.log('Collecties ophalen...')
    const collections = await fetchAllCollections(credentials)
    console.log(`Collecties: ${collections.length}`)
    await processItems(collections, 'collection', rewriteFn, updateCollection, credentials, report)
  }

  if (runAll || productsOnly) {
    console.log('Producten ophalen...')
    const products = await fetchAllProducts(credentials)
    console.log(`Producten: ${products.length}`)
    await processItems(products, 'product', rewriteFn, updateProduct, credentials, report)
  }

  report.finishedAt = new Date().toISOString()

  let previous = null
  if (fs.existsSync(REPORT)) {
    try {
      previous = JSON.parse(fs.readFileSync(REPORT, 'utf-8'))
    } catch {
      previous = null
    }
  }
  if (previous?.results?.length) {
    const seen = new Set(report.results.map((r) => `${r.type}:${r.handle}`))
    for (const r of previous.results) {
      const key = `${r.type}:${r.handle}`
      if (!seen.has(key)) {
        report.results.push(r)
        seen.add(key)
        if (r.status === 'updated' || r.status === 'dry-run') report.updated++
        else report.skipped++
      }
    }
  }

  fs.mkdirSync(path.dirname(REPORT), { recursive: true })
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))

  console.log(`\nBijgewerkt: ${report.updated}, overgeslagen: ${report.skipped}, fouten: ${report.errors.length}`)
  console.log(`Rapport: ${REPORT}`)
  if (report.errors.length) process.exit(1)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
