#!/usr/bin/env node
/**
 * Testimport van 20 WooCommerce producten naar Shopify via GraphQL productSet.
 * Bevat verplicht variabele producten zoals witte-tulpen (30/50/100).
 *
 * Usage:
 *   SHOPIFY_ADMIN_API_TOKEN=shpat_... node scripts/shopify-import-test.js
 *   node scripts/shopify-import-test.js --dry-run
 */

const fs = require('fs')
const path = require('path')
const { parseRecords, buildProducts, getTestHandles } = require('./lib/wc-import-utils')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql } = require('./lib/shopify-client')
const { importProduct } = require('./lib/shopify-product')

const ROOT = path.join(__dirname, '..')
const INPUT = path.join(ROOT, 'data/import/wc-export-latest.csv')
const OUTPUT_DIR = path.join(ROOT, 'data/import')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

async function verifyProduct(handle, credentials) {
  const query = `
    query productByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        handle
        title
        variants(first: 20) {
          nodes {
            price
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  `

  const data = await shopifyGraphql(query, { handle }, credentials)
  return data.productByHandle
}

async function main() {
  if (!fs.existsSync(INPUT)) {
    throw new Error(`Input niet gevonden: ${INPUT}`)
  }

  const handles = getTestHandles(20)
  const records = parseRecords(INPUT)
  const products = buildProducts(records, handles)

  if (products.length < handles.length) {
    const missing = handles.filter((handle) => !products.find((product) => product.handle === handle))
    console.warn(`Waarschuwing: ${missing.length} handles niet gevonden:`, missing.join(', '))
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  fs.writeFileSync(path.join(OUTPUT_DIR, 'shopify-products-test.json'), JSON.stringify(products, null, 2))

  console.log(`Testset: ${products.length} producten`)
  products.forEach((product) => {
    const variantInfo = product.isVariable
      ? `${product.variants.length} varianten (${product.options.map((o) => o.name).join(', ')})`
      : 'simpel'
    console.log(`  - ${product.handle}: ${variantInfo}`)
  })

  const witteTulpen = products.find((product) => product.handle === 'witte-tulpen')
  if (!witteTulpen || witteTulpen.variants.length < 3) {
    throw new Error('witte-tulpen ontbreekt of heeft minder dan 3 varianten in testset')
  }

  console.log('\nwitte-tulpen varianten:')
  witteTulpen.variants.forEach((variant) => {
    const options = variant.optionValues.map((option) => `${option.optionName}=${option.name}`).join(', ')
    console.log(`  - ${options} → €${variant.price}`)
  })

  if (dryRun) {
    console.log('\nDry-run: geen import uitgevoerd.')
    console.log(`Details: ${path.join(OUTPUT_DIR, 'shopify-products-test.json')}`)
    return
  }

  const credentials = await getCredentials()
  const results = []
  const errors = []

  for (const product of products) {
    process.stdout.write(`Importeren: ${product.handle}... `)
    try {
      const imported = await importProduct(product, credentials)
      results.push({
        handle: imported.handle,
        id: imported.id,
        variants: imported.variants.nodes.map((variant) => ({
          price: variant.price,
          options: variant.selectedOptions,
        })),
      })
      console.log('OK')
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.log('FOUT')
      errors.push({ handle: product.handle, error: error.message })
    }
  }

  const report = {
    importedAt: new Date().toISOString(),
    store: credentials.store,
    requested: handles.length,
    imported: results.length,
    failed: errors.length,
    results,
    errors,
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'shopify-import-test-report.json'), JSON.stringify(report, null, 2))

  console.log('\n--- Verificatie witte-tulpen ---')
  const verified = await verifyProduct('witte-tulpen', credentials)
  if (verified) {
    verified.variants.nodes.forEach((variant) => {
      const options = variant.selectedOptions.map((option) => `${option.name}=${option.value}`).join(', ')
      console.log(`  ✓ ${options} → €${variant.price}`)
    })
  } else {
    console.log('  ✗ witte-tulpen niet gevonden in Shopify')
  }

  console.log(`\nKlaar: ${results.length}/${products.length} geïmporteerd`)

  console.log('\n⚠️  BELANGRIJK: API-import publiceert niet automatisch naar Online Store.')
  console.log('   Producten staan in Admin maar kunnen 404 geven op de storefront.')
  console.log('   Oplossing (kies één):')
  console.log('   1. Shopify Admin → Producten → selecteer → "Publiceren op verkoopkanalen" → Online Store')
  console.log('   2. Of per product: Beschikbaarheid → Online Store aanvinken')
  console.log('   3. Of: SHOPIFY_ADMIN_API_TOKEN=shpat_... node scripts/shopify-publish-products.js')

  if (errors.length) {
    console.log('Fouten:')
    errors.forEach((entry) => console.log(`  - ${entry.handle}: ${entry.error}`))
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
