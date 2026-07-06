#!/usr/bin/env node
/**
 * Audit SEO-pariteit tussen WooCommerce en Shopify (collecties + producten).
 *
 * Usage:
 *   node --env-file=.env scripts/seo-parity-audit.js
 */

const fs = require('fs')
const path = require('path')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql, delay } = require('./lib/shopify-client')
const { buildCollectionSeoData, buildProductSeoData } = require('./lib/seo-utils')

const ROOT = path.join(__dirname, '..')
const REPORT = path.join(ROOT, 'data/import/seo-parity-report.json')

async function getShopifyCollections(credentials) {
  const collections = []
  let cursor = null

  do {
    const data = await shopifyGraphql(
      `query($cursor: String) {
        collections(first: 50, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes {
            handle
            descriptionHtml
            seo { title description }
          }
        }
      }`,
      { cursor },
      credentials
    )

    collections.push(...data.collections.nodes)
    cursor = data.collections.pageInfo.hasNextPage ? data.collections.pageInfo.endCursor : null
    await delay(100)
  } while (cursor)

  return collections
}

async function getShopifyProducts(credentials) {
  const products = []
  let cursor = null

  do {
    const data = await shopifyGraphql(
      `query($cursor: String) {
        products(first: 50, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes {
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
    await delay(100)
  } while (cursor)

  return products
}

function auditCollections(wcItems, shopifyItems) {
  const shopifyByHandle = new Map(shopifyItems.map((item) => [item.handle, item]))
  const results = []

  for (const wc of wcItems) {
    const shopify = shopifyByHandle.get(wc.handle)
    const issues = []

    if (!shopify) {
      issues.push('collection_missing')
    } else {
      if (wc.descriptionHtml && !(shopify.descriptionHtml || '').trim()) issues.push('missing_description')
      if (wc.seoTitle && !(shopify.seo?.title || '').trim()) issues.push('missing_seo_title')
      if (wc.seoDescription && !(shopify.seo?.description || '').trim()) issues.push('missing_seo_description')
    }

    if (issues.length) {
      results.push({
        type: 'collection',
        handle: wc.handle,
        wcSlug: wc.wcSlug,
        issues,
        wcHasBody: wc.hasBodyDescription,
        wcHasYoast: wc.hasYoast,
      })
    }
  }

  return results
}

function auditProducts(wcItems, shopifyItems) {
  const shopifyByHandle = new Map(shopifyItems.map((item) => [item.handle, item]))
  const results = []

  for (const wc of wcItems) {
    const shopify = shopifyByHandle.get(wc.handle)
    const issues = []

    if (!shopify) {
      issues.push('product_missing')
    } else {
      if (wc.seoTitle && !(shopify.seo?.title || '').trim()) issues.push('missing_seo_title')
      if (wc.seoDescription && !(shopify.seo?.description || '').trim()) issues.push('missing_seo_description')
    }

    if (issues.length) {
      results.push({
        type: 'product',
        handle: wc.handle,
        wcSlug: wc.wcSlug,
        issues,
      })
    }
  }

  return results
}

async function main() {
  const credentials = await getCredentials()
  const wcCollections = buildCollectionSeoData().filter(
    (item) => item.descriptionHtml || item.seoTitle || item.seoDescription
  )
  const wcProducts = buildProductSeoData()

  const [shopifyCollections, shopifyProducts] = await Promise.all([
    getShopifyCollections(credentials),
    getShopifyProducts(credentials),
  ])

  const collectionIssues = auditCollections(wcCollections, shopifyCollections)
  const productIssues = auditProducts(wcProducts, shopifyProducts)

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      wcCollectionsWithSeo: wcCollections.length,
      shopifyCollections: shopifyCollections.length,
      collectionIssues: collectionIssues.length,
      wcProductsWithSeo: wcProducts.length,
      shopifyProducts: shopifyProducts.length,
      productIssues: productIssues.length,
    },
    collectionIssues,
    productIssues,
  }

  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))

  console.log('SEO parity audit')
  console.log(`Collecties: ${collectionIssues.length} issues van ${wcCollections.length} WC items`)
  console.log(`Producten: ${productIssues.length} issues van ${wcProducts.length} WC items`)
  console.log(`Rapport: ${REPORT}`)

  if (collectionIssues.length || productIssues.length) process.exit(1)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
