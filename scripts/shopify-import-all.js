#!/usr/bin/env node
/**
 * Volledige WooCommerce → Shopify import via GraphQL productSet.
 * Importeert alle gepubliceerde producten inclusief afbeeldingen en publiceert naar Online Store.
 *
 * Usage:
 *   node scripts/shopify-import-all.js --dry-run
 *   node scripts/shopify-import-all.js
 *   node scripts/shopify-import-all.js --resume
 *   node scripts/shopify-import-all.js --publish-only
 *   node scripts/shopify-import-all.js --limit=10
 */

const fs = require('fs')
const path = require('path')
const { parseRecords, buildAllProducts } = require('./lib/wc-import-utils')
const { getCredentials } = require('./lib/shopify-auth')
const { delay } = require('./lib/shopify-client')
const {
  importProduct,
  getOnlineStorePublicationId,
  getProductByHandle,
  publishProduct,
} = require('./lib/shopify-product')

const ROOT = path.join(__dirname, '..')
const INPUT = path.join(ROOT, 'data/import/wc-export-latest.csv')
const OUTPUT_DIR = path.join(ROOT, 'data/import')
const REPORT_PATH = path.join(OUTPUT_DIR, 'shopify-import-all-report.json')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const resume = args.includes('--resume')
const publishOnly = args.includes('--publish-only')
const skipPublish = args.includes('--skip-publish')
const limitArg = args.find((arg) => arg.startsWith('--limit='))
const handlesArg = args.find((arg) => arg.startsWith('--handles='))
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null
const handlesFilter = handlesArg
  ? handlesArg.split('=')[1].split(',').map((handle) => handle.trim()).filter(Boolean)
  : null

function loadReport() {
  if (!fs.existsSync(REPORT_PATH)) return null
  try {
    return JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'))
  } catch {
    return null
  }
}

function saveReport(report) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))
}

function getCompletedHandles(report) {
  if (!report) return new Set()
  const handles = new Set()
  report.results?.forEach((entry) => {
    if (entry.imported && entry.published) handles.add(entry.handle)
  })
  return handles
}

async function main() {
  if (!fs.existsSync(INPUT)) {
    throw new Error(`Input niet gevonden: ${INPUT}`)
  }

  const records = parseRecords(INPUT)
  let products = handlesFilter
    ? buildAllProducts(records).filter((product) => handlesFilter.includes(product.handle))
    : buildAllProducts(records)

  if (limit && limit > 0) {
    products = products.slice(0, limit)
  }

  const previousReport = resume ? loadReport() : null
  const completed = resume ? getCompletedHandles(previousReport) : new Set()

  if (resume && completed.size) {
    products = products.filter((product) => !completed.has(product.handle))
  }

  const withImages = products.filter((product) => product.images.length > 0).length
  const withoutImages = products.length - withImages

  console.log(`Producten te verwerken: ${products.length}`)
  console.log(`  Met afbeeldingen: ${withImages}`)
  console.log(`  Zonder afbeeldingen: ${withoutImages}`)
  if (resume && completed.size) {
    console.log(`  Overgeslagen (al klaar): ${completed.size}`)
  }

  if (dryRun) {
    console.log('\nDry-run: geen import uitgevoerd.')
    products.slice(0, 10).forEach((product) => {
      console.log(`  - ${product.handle} (${product.images.length} img, ${product.variants.length} var)`)
    })
    if (products.length > 10) console.log(`  ... en ${products.length - 10} meer`)
    return
  }

  const credentials = await getCredentials()
  const publicationId = skipPublish ? null : await getOnlineStorePublicationId(credentials)

  const report = {
    startedAt: new Date().toISOString(),
    store: credentials.store,
    mode: publishOnly ? 'publish-only' : 'import-and-publish',
    total: products.length,
    results: [],
    errors: [],
  }

  if (publishOnly) {
    console.log(`\nPubliceren naar Online Store (${publicationId})...\n`)
  } else {
    console.log(`\nImporteren + publiceren (${publicationId})...\n`)
  }

  let imported = 0
  let published = 0
  let failed = 0

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const progress = `[${i + 1}/${products.length}]`
    const entry = { handle: product.handle, imported: false, published: false }

    try {
      if (!publishOnly) {
        process.stdout.write(`${progress} ${product.handle} import... `)
        const importedProduct = await importProduct(product, credentials)
        entry.imported = true
        entry.id = importedProduct.id
        entry.imageCount = importedProduct.media?.nodes?.length || 0
        entry.variantCount = importedProduct.variants?.nodes?.length || 0
        imported++
        process.stdout.write(`OK (${entry.imageCount} img) `)
        await delay(400)
      } else {
        const existing = await getProductByHandle(product.handle, credentials, publicationId)
        if (!existing) {
          throw new Error('product niet gevonden in Shopify')
        }
        entry.id = existing.id
        if (existing.publishedOnPublication) {
          entry.imported = true
          entry.published = true
          entry.skipped = 'already-published'
          console.log(`${progress} ${product.handle} al gepubliceerd`)
          report.results.push(entry)
          continue
        }
      }

      if (!skipPublish && publicationId) {
        process.stdout.write('publish... ')
        const productId = entry.id || (await getProductByHandle(product.handle, credentials))?.id
        if (!productId) {
          throw new Error('kon product ID niet ophalen voor publicatie')
        }
        await publishProduct(productId, publicationId, credentials)
        entry.published = true
        published++
        process.stdout.write('live\n')
      } else {
        process.stdout.write('\n')
      }

      report.results.push(entry)
      await delay(300)
    } catch (error) {
      failed++
      entry.error = error.message
      report.errors.push({ handle: product.handle, error: error.message })
      console.log(`${progress} ${product.handle} FOUT: ${error.message}`)
      report.results.push(entry)
    }

    if ((i + 1) % 25 === 0) {
      report.updatedAt = new Date().toISOString()
      report.imported = imported
      report.published = published
      report.failed = failed
      saveReport(report)
    }
  }

  report.finishedAt = new Date().toISOString()
  report.imported = imported
  report.published = published
  report.failed = failed
  saveReport(report)

  console.log('\n--- Samenvatting ---')
  console.log(`Geïmporteerd: ${imported}`)
  console.log(`Gepubliceerd:  ${published}`)
  console.log(`Mislukt:       ${failed}`)
  console.log(`Rapport:       ${REPORT_PATH}`)

  if (failed > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
