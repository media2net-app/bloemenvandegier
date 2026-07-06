#!/usr/bin/env node
/**
 * Koppel Shopify-producten aan collecties op basis van WC-categorieën.
 *
 * Usage:
 *   node --env-file=.env scripts/shopify-assign-collections.js
 *   node --env-file=.env scripts/shopify-assign-collections.js --dry-run
 */

const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql, delay } = require('./lib/shopify-client')
const {
  parseRecords,
  buildAllProducts,
  getCategories,
  isPublished,
  isTopLevel,
  slugify,
} = require('./lib/wc-import-utils')

const ROOT = path.join(__dirname, '..')
const WC_INPUT = path.join(ROOT, 'data/import/wc-export-latest.csv')
const COLLECTIONS_CSV = path.join(ROOT, 'data/import/shopify-collections.csv')
const COLLECTIONS_REPORT = path.join(ROOT, 'data/import/shopify-collections-report.json')
const REPORT = path.join(ROOT, 'data/import/shopify-assign-collections-report.json')

const dryRun = process.argv.includes('--dry-run')
const BATCH_SIZE = 50

function loadCollectionSlugMap() {
  const csv = fs.readFileSync(COLLECTIONS_CSV, 'utf-8')
  const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true })
  const nameToSlug = new Map()
  const slugSet = new Set()

  rows.forEach((row) => {
    nameToSlug.set(row.name.trim(), row.slug.trim())
    slugSet.add(row.slug.trim())
  })

  return { nameToSlug, slugSet }
}

function loadCollectionIds() {
  const ids = new Map()
  if (!fs.existsSync(COLLECTIONS_REPORT)) return ids

  const report = JSON.parse(fs.readFileSync(COLLECTIONS_REPORT, 'utf-8'))
  report.results?.forEach((entry) => {
    if (entry.handle && entry.id) ids.set(entry.handle, entry.id)
  })
  return ids
}

function categoryToSlug(categoryName, nameToSlug) {
  if (nameToSlug.has(categoryName)) return nameToSlug.get(categoryName)
  const slug = slugify(categoryName)
  return slug || null
}

function buildAssignments(records, nameToSlug) {
  const collectionToHandles = new Map()

  records.forEach((row) => {
    if (!isTopLevel(row) || !isPublished(row)) return

    const handle = row.Slug
    if (!handle) return

    const categories = getCategories(row)
    categories.forEach((categoryName) => {
      const collectionSlug = categoryToSlug(categoryName, nameToSlug)
      if (!collectionSlug) return
      if (!collectionToHandles.has(collectionSlug)) {
        collectionToHandles.set(collectionSlug, new Set())
      }
      collectionToHandles.get(collectionSlug).add(handle)
    })
  })

  return collectionToHandles
}

async function fetchAllProducts(credentials) {
  const byHandle = new Map()
  let cursor = null

  while (true) {
    const data = await shopifyGraphql(
      `query($cursor: String) {
        products(first: 100, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { id handle }
        }
      }`,
      { cursor },
      credentials
    )

    data.products.nodes.forEach((product) => byHandle.set(product.handle, product.id))
    process.stdout.write(`  Producten laden: ${byHandle.size}\r`)

    if (!data.products.pageInfo.hasNextPage) break
    cursor = data.products.pageInfo.endCursor
    await delay(150)
  }

  console.log('')
  return byHandle
}

async function getCollectionIdByHandle(handle, credentials, cache) {
  if (cache.has(handle)) return cache.get(handle)

  const data = await shopifyGraphql(
    `query($handle: String!) {
      collectionByHandle(handle: $handle) { id handle }
    }`,
    { handle },
    credentials
  )

  const id = data.collectionByHandle?.id || null
  cache.set(handle, id)
  return id
}

async function addProductsToCollection(collectionId, productIds, credentials) {
  const data = await shopifyGraphql(
    `mutation($id: ID!, $productIds: [ID!]!) {
      collectionAddProducts(id: $id, productIds: $productIds) {
        collection { id }
        userErrors { field message }
      }
    }`,
    { id: collectionId, productIds },
    credentials
  )

  const result = data.collectionAddProducts
  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map((e) => e.message).join('; '))
  }
}

async function main() {
  if (!fs.existsSync(WC_INPUT)) {
    throw new Error(`WC export niet gevonden: ${WC_INPUT}`)
  }
  if (!fs.existsSync(COLLECTIONS_CSV)) {
    throw new Error(`Collecties CSV niet gevonden: ${COLLECTIONS_CSV}`)
  }

  const records = parseRecords(WC_INPUT)
  const { nameToSlug } = loadCollectionSlugMap()
  const collectionToHandles = buildAssignments(records, nameToSlug)
  const credentials = await getCredentials()
  const collectionIdCache = loadCollectionIds()

  console.log(`Collecties met producten: ${collectionToHandles.size}`)
  console.log('Shopify producten ophalen...')
  const productsByHandle = await fetchAllProducts(credentials)

  const report = {
    startedAt: new Date().toISOString(),
    dryRun,
    collections: [],
    assigned: 0,
    skippedCollections: 0,
    missingProducts: [],
    errors: [],
  }

  const entries = [...collectionToHandles.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  let index = 0

  for (const [collectionSlug, handles] of entries) {
    index++
    let collectionId = collectionIdCache.get(collectionSlug)
    if (!collectionId) {
      collectionId = await getCollectionIdByHandle(collectionSlug, credentials, collectionIdCache)
      await delay(100)
    }

    if (!collectionId) {
      report.skippedCollections++
      report.errors.push({ collection: collectionSlug, error: 'Collectie niet gevonden in Shopify' })
      continue
    }

    const productIds = []
    const missing = []

    handles.forEach((handle) => {
      const id = productsByHandle.get(handle)
      if (id) productIds.push(id)
      else missing.push(handle)
    })

    missing.forEach((handle) => {
      if (!report.missingProducts.includes(handle)) report.missingProducts.push(handle)
    })

    const entry = {
      handle: collectionSlug,
      products: productIds.length,
      missing: missing.length,
    }

    if (dryRun) {
      report.collections.push(entry)
      report.assigned += productIds.length
      process.stdout.write(`[${index}/${entries.length}] ${collectionSlug}: ${productIds.length} producten (dry-run)\r`)
      continue
    }

    try {
      for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
        const batch = productIds.slice(i, i + BATCH_SIZE)
        await addProductsToCollection(collectionId, batch, credentials)
        await delay(250)
      }
      entry.status = 'done'
      report.assigned += productIds.length
      process.stdout.write(`[${index}/${entries.length}] ${collectionSlug}: ${productIds.length} producten gekoppeld\r`)
    } catch (error) {
      entry.status = 'error'
      entry.error = error.message
      report.errors.push({ collection: collectionSlug, error: error.message })
    }

    report.collections.push(entry)
  }

  console.log('')
  report.finishedAt = new Date().toISOString()
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))

  console.log(`Klaar. ${report.assigned} product-koppelingen${dryRun ? ' (dry-run)' : ''}.`)
  console.log(`Rapport: ${REPORT}`)
  if (report.missingProducts.length) {
    console.log(`Ontbrekende producten: ${report.missingProducts.length}`)
  }
  if (report.errors.length) {
    console.log(`Fouten: ${report.errors.length}`)
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
