#!/usr/bin/env node
/**
 * Importeer WC product Yoast SEO naar Shopify producten.
 *
 * Usage:
 *   node --env-file=.env scripts/shopify-import-product-seo.js
 *   node --env-file=.env scripts/shopify-import-product-seo.js --dry-run
 *   node --env-file=.env scripts/shopify-import-product-seo.js --handle=de-gier-boeket
 */

const fs = require('fs')
const path = require('path')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql, delay } = require('./lib/shopify-client')
const { buildProductSeoData } = require('./lib/seo-utils')

const ROOT = path.join(__dirname, '..')
const REPORT = path.join(ROOT, 'data/import/shopify-product-seo-report.json')

const dryRun = process.argv.includes('--dry-run')
const handleArg = process.argv.find((arg) => arg.startsWith('--handle='))
const handleFilter = handleArg ? handleArg.split('=')[1] : null

async function listShopifyProducts(credentials) {
  const products = []
  let cursor = null

  do {
    const data = await shopifyGraphql(
      `query($cursor: String) {
        products(first: 50, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            handle
            seo { title description }
          }
        }
      }`,
      { cursor },
      credentials
    )

    products.push(...data.products.nodes)
    cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null
    await delay(150)
  } while (cursor)

  return products
}

async function updateProductSeo(productId, seo, credentials) {
  const data = await shopifyGraphql(
    `mutation($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id handle seo { title description } }
        userErrors { field message }
      }
    }`,
    {
      input: {
        id: productId,
        seo: {
          title: seo.title || undefined,
          description: seo.description || undefined,
        },
      },
    },
    credentials
  )

  const result = data.productUpdate
  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map((error) => error.message).join('; '))
  }
  return result.product
}

async function main() {
  const credentials = await getCredentials()
  const seoByHandle = new Map(buildProductSeoData().map((item) => [item.handle, item]))
  let shopifyProducts = await listShopifyProducts(credentials)

  if (handleFilter) {
    shopifyProducts = shopifyProducts.filter((product) => product.handle === handleFilter)
  }

  const candidates = shopifyProducts.filter((product) => seoByHandle.has(product.handle))
  console.log(`Producten in Shopify: ${shopifyProducts.length}`)
  console.log(`Product-SEO kandidaten: ${candidates.length}`)

  const report = {
    startedAt: new Date().toISOString(),
    dryRun,
    updated: 0,
    skipped: 0,
    missingSeoData: shopifyProducts.length - candidates.length,
    errors: [],
    results: [],
  }

  for (let i = 0; i < candidates.length; i++) {
    const product = candidates[i]
    const seoData = seoByHandle.get(product.handle)
    process.stdout.write(`[${i + 1}/${candidates.length}] ${product.handle}... `)

    try {
      const unchanged =
        (product.seo?.title || '') === (seoData.seoTitle || '') &&
        (product.seo?.description || '') === (seoData.seoDescription || '')

      if (unchanged) {
        report.skipped++
        report.results.push({ handle: product.handle, status: 'unchanged', id: product.id })
        console.log('ongewijzigd')
        continue
      }

      if (dryRun) {
        report.updated++
        report.results.push({
          handle: product.handle,
          wcSlug: seoData.wcSlug,
          status: 'dry-run',
          seoTitle: seoData.seoTitle,
        })
        console.log('dry-run')
        continue
      }

      await updateProductSeo(
        product.id,
        { title: seoData.seoTitle, description: seoData.seoDescription },
        credentials
      )
      report.updated++
      report.results.push({ handle: product.handle, wcSlug: seoData.wcSlug, status: 'updated', id: product.id })
      console.log('bijgewerkt')
      await delay(200)
    } catch (error) {
      report.errors.push({ handle: product.handle, error: error.message })
      report.results.push({ handle: product.handle, status: 'error', error: error.message })
      console.log(`FOUT: ${error.message}`)
    }
  }

  report.finishedAt = new Date().toISOString()
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))

  console.log(`\nBijgewerkt: ${report.updated}, overgeslagen: ${report.skipped}, fouten: ${report.errors.length}`)
  console.log(`Rapport: ${REPORT}`)
  if (report.errors.length) process.exit(1)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
