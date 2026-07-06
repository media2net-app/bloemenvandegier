#!/usr/bin/env node
/**
 * Importeer collecties uit data/import/shopify-collections.csv naar Shopify.
 *
 * Usage:
 *   node --env-file=.env scripts/shopify-import-collections.js
 *   node --env-file=.env scripts/shopify-import-collections.js --dry-run
 */

const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql, delay } = require('./lib/shopify-client')
const { getOnlineStorePublicationId, publishProduct } = require('./lib/shopify-product')

const ROOT = path.join(__dirname, '..')
const INPUT = path.join(ROOT, 'data/import/shopify-collections.csv')
const REPORT = path.join(ROOT, 'data/import/shopify-collections-report.json')

const dryRun = process.argv.includes('--dry-run')

function loadCollections() {
  const csv = fs.readFileSync(INPUT, 'utf-8')
  return parse(csv, { columns: true, skip_empty_lines: true, trim: true })
}

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

async function createCollection(row, credentials) {
  const title = row.name.replace(/\s*>\s*/g, ' / ')
  const handle = row.slug

  const data = await shopifyGraphql(
    `mutation($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection { id handle title }
        userErrors { field message }
      }
    }`,
    {
      input: { title, handle },
    },
    credentials
  )

  const result = data.collectionCreate
  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map((e) => e.message).join('; '))
  }
  return result.collection
}

async function main() {
  if (!fs.existsSync(INPUT)) {
    throw new Error(`Bestand niet gevonden: ${INPUT}`)
  }

  const collections = loadCollections()
  const credentials = await getCredentials()
  const publicationId = await getOnlineStorePublicationId(credentials)

  console.log(`Collecties: ${collections.length}`)
  if (dryRun) {
    collections.slice(0, 5).forEach((c) => console.log(`  - ${c.slug}: ${c.name}`))
    console.log(`  ... en ${collections.length - 5} meer`)
    return
  }

  const report = {
    startedAt: new Date().toISOString(),
    created: 0,
    skipped: 0,
    published: 0,
    errors: [],
    results: [],
  }

  for (let i = 0; i < collections.length; i++) {
    const row = collections[i]
    process.stdout.write(`[${i + 1}/${collections.length}] ${row.slug}... `)

    try {
      const existing = await getCollectionByHandle(row.slug, credentials)
      if (existing) {
        report.skipped++
        report.results.push({ handle: row.slug, status: 'exists', id: existing.id })
        console.log('bestaat al')
        continue
      }

      const collection = await createCollection(row, credentials)
      report.created++
      await publishProduct(collection.id, publicationId, credentials)
      report.published++
      report.results.push({ handle: row.slug, status: 'created', id: collection.id })
      console.log('aangemaakt + live')
      await delay(300)
    } catch (error) {
      report.errors.push({ handle: row.slug, error: error.message })
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
