#!/usr/bin/env node
/**
 * Maak ontbrekende WC-collecties aan in Shopify (uit full-content-audit.json).
 *
 * Usage:
 *   node --env-file=.env scripts/shopify-import-missing-collections.js
 *   node --env-file=.env scripts/shopify-import-missing-collections.js --dry-run
 */

const fs = require('fs')
const path = require('path')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql, delay } = require('./lib/shopify-client')
const { getOnlineStorePublicationId, publishProduct } = require('./lib/shopify-product')
const { buildCollectionDescriptionHtml, resolveCollectionHandle } = require('./lib/seo-utils')

const ROOT = path.join(__dirname, '..')
const AUDIT = path.join(ROOT, 'data/import/full-content-audit.json')
const WC_CATEGORIES = path.join(ROOT, 'data/import/wc-api/categories.json')
const REPORT = path.join(ROOT, 'data/import/shopify-missing-collections-report.json')

const dryRun = process.argv.includes('--dry-run')
const SKIP_HANDLES = new Set(['16', '5', 'upsell'])

async function getCollectionByHandle(handle, credentials) {
  const data = await shopifyGraphql(
    `query($handle: String!) {
      collectionByHandle(handle: $handle) { id handle title }
    }`,
    { handle },
    credentials
  )
  return data.collectionByHandle
}

async function createCollection(input, credentials) {
  const data = await shopifyGraphql(
    `mutation($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection { id handle title }
        userErrors { field message }
      }
    }`,
    { input },
    credentials
  )
  const result = data.collectionCreate
  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map((e) => e.message).join('; '))
  }
  return result.collection
}

async function main() {
  const audit = JSON.parse(fs.readFileSync(AUDIT, 'utf-8'))
  const categories = JSON.parse(fs.readFileSync(WC_CATEGORIES, 'utf-8'))
  const bySlug = new Map(categories.map((c) => [c.slug, c]))

  const missing = (audit.collectionIssues || [])
    .filter((item) => item.issues?.includes('collection_missing'))
    .map((item) => item.wcSlug || item.handle)
    .filter((handle) => handle && !SKIP_HANDLES.has(handle))

  if (!missing.length) {
    console.log('Geen ontbrekende collecties in audit.')
    return
  }

  const credentials = await getCredentials()
  const publicationId = await getOnlineStorePublicationId(credentials)

  const report = {
    startedAt: new Date().toISOString(),
    dryRun,
    created: 0,
    skipped: 0,
    errors: [],
    results: [],
  }

  console.log(`Ontbrekende collecties: ${missing.length}`)

  for (let i = 0; i < missing.length; i++) {
    const wcSlug = missing[i]
    const handle = resolveCollectionHandle(wcSlug)
    const category = bySlug.get(wcSlug)
    const title = category?.name?.replace(/&gt;/g, '>') || handle
    process.stdout.write(`[${i + 1}/${missing.length}] ${handle}... `)

    try {
      const existing = await getCollectionByHandle(handle, credentials)
      if (existing) {
        report.skipped++
        report.results.push({ handle, wcSlug, status: 'exists', id: existing.id })
        console.log('bestaat al')
        continue
      }

      const descriptionHtml = category ? buildCollectionDescriptionHtml(category, null) : ''
      const input = { title, handle }
      if (descriptionHtml) input.descriptionHtml = descriptionHtml

      if (dryRun) {
        report.created++
        report.results.push({ handle, wcSlug, status: 'dry-run', title })
        console.log(`dry-run (${descriptionHtml.length} chars)`)
        continue
      }

      const collection = await createCollection(input, credentials)
      await publishProduct(collection.id, publicationId, credentials)
      report.created++
      report.results.push({ handle, wcSlug, status: 'created', id: collection.id })
      console.log('aangemaakt + live')
      await delay(300)
    } catch (error) {
      report.errors.push({ handle, wcSlug, error: error.message })
      report.results.push({ handle, wcSlug, status: 'error', error: error.message })
      console.log(`FOUT: ${error.message}`)
    }
  }

  report.finishedAt = new Date().toISOString()
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))
  console.log(`\nAangemaakt: ${report.created}, overgeslagen: ${report.skipped}, fouten: ${report.errors.length}`)
  console.log(`Rapport: ${REPORT}`)
  if (report.errors.length) process.exit(1)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
