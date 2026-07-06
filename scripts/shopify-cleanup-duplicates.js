#!/usr/bin/env node
/**
 * Verwijder Shopify-producten die niet in de WC-export voorkomen.
 *
 * Usage:
 *   node --env-file=.env scripts/shopify-cleanup-duplicates.js --dry-run
 *   node --env-file=.env scripts/shopify-cleanup-duplicates.js --execute
 */

const fs = require('fs')
const path = require('path')
const { parseRecords, buildAllProducts } = require('./lib/wc-import-utils')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql, delay } = require('./lib/shopify-client')

const ROOT = path.join(__dirname, '..')
const WC_INPUT = path.join(ROOT, 'data/import/wc-export-latest.csv')
const REPORT = path.join(ROOT, 'data/import/shopify-cleanup-report.json')

const execute = process.argv.includes('--execute')
const dryRun = !execute

async function fetchAllShopifyProducts(credentials) {
  const products = []
  let cursor = null
  let page = 0

  while (true) {
    page++
    const data = await shopifyGraphql(
      `query($cursor: String) {
        products(first: 100, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { id handle title status }
        }
      }`,
      { cursor },
      credentials
    )

    products.push(...data.products.nodes)
    process.stdout.write(`  Shopify producten laden: ${products.length}\r`)

    if (!data.products.pageInfo.hasNextPage) break
    cursor = data.products.pageInfo.endCursor
    await delay(200)
  }

  console.log('')
  return products
}

async function deleteProduct(id, credentials) {
  const data = await shopifyGraphql(
    `mutation($input: ProductDeleteInput!) {
      productDelete(input: $input) {
        deletedProductId
        userErrors { field message }
      }
    }`,
    { input: { id } },
    credentials
  )

  const result = data.productDelete
  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map((e) => e.message).join('; '))
  }
}

async function main() {
  if (!fs.existsSync(WC_INPUT)) {
    throw new Error(`WC export niet gevonden: ${WC_INPUT}`)
  }

  const wcHandles = new Set(buildAllProducts(parseRecords(WC_INPUT)).map((p) => p.handle))
  const credentials = await getCredentials()

  console.log(`WC handles (bron): ${wcHandles.size}`)
  console.log('Shopify producten ophalen...')
  const shopifyProducts = await fetchAllShopifyProducts(credentials)

  const orphans = shopifyProducts.filter((p) => !wcHandles.has(p.handle))
  const matched = shopifyProducts.length - orphans.length

  console.log(`Shopify totaal: ${shopifyProducts.length}`)
  console.log(`Match met WC:   ${matched}`)
  console.log(`Te verwijderen: ${orphans.length}`)

  if (orphans.length) {
    console.log('\nVoorbeelden:')
    orphans.slice(0, 10).forEach((p) => console.log(`  - ${p.handle} (${p.title})`))
  }

  const report = {
    checkedAt: new Date().toISOString(),
    mode: dryRun ? 'dry-run' : 'execute',
    wcHandles: wcHandles.size,
    shopifyTotal: shopifyProducts.length,
    matched,
    orphanCount: orphans.length,
    orphans: orphans.map((p) => ({ id: p.id, handle: p.handle, title: p.title })),
    deleted: [],
    errors: [],
  }

  if (dryRun) {
    console.log('\nDry-run: geen verwijderingen. Gebruik --execute om op te ruimen.')
    fs.mkdirSync(path.dirname(REPORT), { recursive: true })
    fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))
    return
  }

  console.log('\nVerwijderen...')
  for (let i = 0; i < orphans.length; i++) {
    const product = orphans[i]
    process.stdout.write(`[${i + 1}/${orphans.length}] ${product.handle}... `)
    try {
      await deleteProduct(product.id, credentials)
      report.deleted.push(product.handle)
      console.log('verwijderd')
      await delay(400)
    } catch (error) {
      report.errors.push({ handle: product.handle, error: error.message })
      console.log(`FOUT: ${error.message}`)
    }
  }

  report.finishedAt = new Date().toISOString()
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))

  console.log(`\nVerwijderd: ${report.deleted.length}, fouten: ${report.errors.length}`)
  if (report.errors.length) process.exit(1)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
