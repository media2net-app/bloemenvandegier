#!/usr/bin/env node
/**
 * Publiceer producten naar de Online Store sales channel.
 *
 * Usage:
 *   node scripts/shopify-publish-products.js --all
 *   node scripts/shopify-publish-products.js --handles=witte-tulpen,rode-tulpen
 */

const fs = require('fs')
const path = require('path')
const { parseRecords, buildAllProducts } = require('./lib/wc-import-utils')
const { getCredentials } = require('./lib/shopify-auth')
const { delay } = require('./lib/shopify-client')
const {
  getOnlineStorePublicationId,
  getProductByHandle,
  publishProduct,
} = require('./lib/shopify-product')

const ROOT = path.join(__dirname, '..')
const INPUT = path.join(ROOT, 'data/import/wc-export-latest.csv')

const args = process.argv.slice(2)
const handlesArg = args.find((arg) => arg.startsWith('--handles='))?.split('=')[1]
const all = args.includes('--all')

function getDefaultHandles() {
  const reportPath = path.join(ROOT, 'data/import/shopify-import-all-report.json')
  if (fs.existsSync(reportPath)) {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))
    return report.results.filter((entry) => entry.imported).map((entry) => entry.handle)
  }

  const testReportPath = path.join(ROOT, 'data/import/shopify-import-test-report.json')
  if (fs.existsSync(testReportPath)) {
    const report = JSON.parse(fs.readFileSync(testReportPath, 'utf-8'))
    return report.results.map((entry) => entry.handle)
  }

  return ['witte-tulpen']
}

function getAllHandles() {
  const records = parseRecords(INPUT)
  return buildAllProducts(records).map((product) => product.handle)
}

async function main() {
  const credentials = await getCredentials()
  const handles = handlesArg
    ? handlesArg.split(',').map((handle) => handle.trim())
    : all
      ? getAllHandles()
      : getDefaultHandles()

  const publicationId = await getOnlineStorePublicationId(credentials)

  console.log(`Online Store: ${publicationId}`)
  console.log(`Publiceren: ${handles.length} producten\n`)

  let published = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < handles.length; i++) {
    const handle = handles[i]
    process.stdout.write(`[${i + 1}/${handles.length}] ${handle}... `)

    try {
      const product = await getProductByHandle(handle, credentials, publicationId)
      if (!product) {
        failed++
        console.log('niet gevonden')
        continue
      }

      if (product.publishedOnPublication) {
        skipped++
        console.log('al live')
        continue
      }

      await publishProduct(product.id, publicationId, credentials)
      published++
      console.log('live')
      await delay(250)
    } catch (error) {
      failed++
      console.log(`FOUT: ${error.message}`)
    }
  }

  console.log(`\nGepubliceerd: ${published}, overgeslagen: ${skipped}, mislukt: ${failed}`)
  if (failed > 0) process.exit(1)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
