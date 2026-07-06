#!/usr/bin/env node
/**
 * Importeer WC categorie-SEO naar Shopify collecties (descriptionHtml + seo velden).
 *
 * Usage:
 *   node --env-file=.env scripts/shopify-import-collection-seo.js
 *   node --env-file=.env scripts/shopify-import-collection-seo.js --dry-run
 *   node --env-file=.env scripts/shopify-import-collection-seo.js --slug=klassieke-boeketten
 */

const fs = require('fs')
const path = require('path')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql, delay } = require('./lib/shopify-client')
const { buildCollectionSeoData } = require('./lib/seo-utils')

const ROOT = path.join(__dirname, '..')
const REPORT = path.join(ROOT, 'data/import/shopify-collection-seo-report.json')

const dryRun = process.argv.includes('--dry-run')
const slugArg = process.argv.find((arg) => arg.startsWith('--slug='))
const slugFilter = slugArg ? slugArg.split('=')[1] : null

async function getCollectionByHandle(handle, credentials) {
  const data = await shopifyGraphql(
    `query($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        handle
        title
        descriptionHtml
        seo { title description }
      }
    }`,
    { handle },
    credentials
  )
  return data.collectionByHandle
}

async function updateCollection(collectionId, payload, credentials) {
  const data = await shopifyGraphql(
    `mutation($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection { id handle descriptionHtml seo { title description } }
        userErrors { field message }
      }
    }`,
    { input: { id: collectionId, ...payload } },
    credentials
  )

  const result = data.collectionUpdate
  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map((error) => error.message).join('; '))
  }
  return result.collection
}

async function main() {
  const credentials = await getCredentials()
  let items = buildCollectionSeoData().filter((item) => item.descriptionHtml || item.seoTitle || item.seoDescription)

  if (slugFilter) {
    items = items.filter((item) => item.handle === slugFilter || item.wcSlug === slugFilter)
  }

  console.log(`Collectie-SEO items: ${items.length}`)
  if (!items.length) return

  const report = {
    startedAt: new Date().toISOString(),
    dryRun,
    updated: 0,
    skipped: 0,
    missing: 0,
    errors: [],
    results: [],
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    process.stdout.write(`[${i + 1}/${items.length}] ${item.handle}... `)

    try {
      const existing = await getCollectionByHandle(item.handle, credentials)
      if (!existing) {
        report.missing++
        report.results.push({ handle: item.handle, wcSlug: item.wcSlug, status: 'missing' })
        console.log('collectie niet gevonden')
        continue
      }

      const input = {}
      if (item.descriptionHtml) input.descriptionHtml = item.descriptionHtml
      if (item.seoTitle || item.seoDescription) {
        input.seo = {
          title: item.seoTitle || undefined,
          description: item.seoDescription || undefined,
        }
      }

      const unchanged =
        (existing.descriptionHtml || '') === (input.descriptionHtml || '') &&
        (existing.seo?.title || '') === (input.seo?.title || '') &&
        (existing.seo?.description || '') === (input.seo?.description || '')

      if (unchanged) {
        report.skipped++
        report.results.push({ handle: item.handle, wcSlug: item.wcSlug, status: 'unchanged', id: existing.id })
        console.log('ongewijzigd')
        continue
      }

      if (dryRun) {
        report.updated++
        report.results.push({
          handle: item.handle,
          wcSlug: item.wcSlug,
          status: 'dry-run',
          id: existing.id,
          seoTitle: item.seoTitle,
          descriptionLength: item.descriptionHtml.length,
        })
        console.log(`dry-run (${item.descriptionHtml.length} chars)`)
        continue
      }

      await updateCollection(existing.id, input, credentials)
      report.updated++
      report.results.push({
        handle: item.handle,
        wcSlug: item.wcSlug,
        status: 'updated',
        id: existing.id,
        hasBodyDescription: item.hasBodyDescription,
      })
      console.log('bijgewerkt')
      await delay(250)
    } catch (error) {
      report.errors.push({ handle: item.handle, wcSlug: item.wcSlug, error: error.message })
      report.results.push({ handle: item.handle, wcSlug: item.wcSlug, status: 'error', error: error.message })
      console.log(`FOUT: ${error.message}`)
    }
  }

  report.finishedAt = new Date().toISOString()
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))

  console.log(`\nBijgewerkt: ${report.updated}, overgeslagen: ${report.skipped}, ontbrekend: ${report.missing}, fouten: ${report.errors.length}`)
  console.log(`Rapport: ${REPORT}`)
  if (report.errors.length) process.exit(1)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
