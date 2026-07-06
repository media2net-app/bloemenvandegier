#!/usr/bin/env node
/**
 * Haal een Shopify Admin API access token op via client credentials.
 *
 * Usage:
 *   node scripts/shopify-get-token.js
 *   node scripts/shopify-get-token.js --test
 */

const { getCredentials, STORE } = require('./lib/shopify-auth')
const { shopifyGraphql } = require('./lib/shopify-client')

const test = process.argv.includes('--test')

async function main() {
  const credentials = await getCredentials()
  console.log(`Store: ${STORE}`)
  console.log(`Token: ${credentials.token.slice(0, 12)}...`)

  if (test) {
    const data = await shopifyGraphql(
      `{ shop { name myshopifyDomain } productsCount { count } }`,
      {},
      credentials
    )
    console.log(`Shop: ${data.shop.name} (${data.shop.myshopifyDomain})`)
    console.log(`Producten in Shopify: ${data.productsCount.count}`)
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
