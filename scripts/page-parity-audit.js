#!/usr/bin/env node
/**
 * Controleert 1:1 pagina-pariteit tussen WooCommerce en Shopify.
 * Vergelijkt redirect targets, WC pagina's en bestaande Shopify Pages.
 *
 * Usage:
 *   node --env-file=.env scripts/page-parity-audit.js
 *   node --env-file=.env scripts/page-parity-audit.js --navigation
 */

const fs = require('fs')
const path = require('path')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql } = require('./lib/shopify-client')

const ROOT = path.join(__dirname, '..')
const PAGES_INPUT = path.join(ROOT, 'data/import/wc-api/pages.json')
const REDIRECTS_CSV = path.join(ROOT, 'shopify-redirects.csv')
const REPORT = path.join(ROOT, 'data/import/page-parity-report.json')

const NAVIGATION_CHECKS = [
  { label: 'Rozen hub', wc: '/rozen-bestellen-bij-de-gier/', shopify: '/pages/rozen-bestellen-bij-de-gier' },
  { label: 'Alle rozen', wc: '/alle-rozen/', shopify: '/pages/alle-rozen' },
  { label: 'Witte rozen', wc: '/witte-rozen/', shopify: '/pages/witte-rozen' },
  { label: 'Rode rozen', wc: '/rode-rozen-2/', shopify: '/pages/rode-rozen-2' },
  { label: 'Roze rozen', wc: '/roze-rozen/', shopify: '/pages/roze-rozen' },
  { label: 'Gele rozen', wc: '/gele-rozen/', shopify: '/pages/gele-rozen' },
  { label: 'Gemengde rozen', wc: '/gemengde-rozen/', shopify: '/pages/gemengde-rozen' },
  { label: 'Boeketten hub', wc: '/boeketten/', shopify: '/pages/boeketten' },
  { label: 'Exclusieve boeketten', wc: '/exclusieve-boeketten/', shopify: '/pages/exclusieve-boeketten' },
  { label: 'Groen & decoratief', wc: '/groen-decoratief/', shopify: '/pages/groen-decoratief' },
  { label: 'Voorjaarsbloemen', wc: '/voorjaarsbloemen/', shopify: '/pages/voorjaarsbloemen' },
  { label: 'Bloemen per soort', wc: '/bloemen-per-soort/', shopify: '/pages/bloemen-per-soort' },
  { label: 'Bloemenpakketten', wc: '/bloemenpakketten/', shopify: '/pages/bloemenpakketten' },
  { label: 'Pioenrozen', wc: '/pioenrozen-bestellen-bij-de-gier/', shopify: '/pages/pioenrozen-bestellen-bij-de-gier' },
  { label: 'Olijfbomen', wc: '/olijfbomen/', shopify: '/pages/olijfbomen' },
  { label: 'Bruiloft bundels', wc: '/bruiloft-bundels/', shopify: '/pages/bruiloft-bundels' },
  { label: 'Zakelijk', wc: '/zakelijk-bloemen-bestellen/', shopify: '/pages/zakelijk-bloemen-bestellen' },
  { label: 'Rozen catalogus', wc: '/product-categorie/rozen/', shopify: '/collections/rozen' },
  { label: 'Klassieke boeketten', wc: '/product-categorie/klassieke-boeketten/', shopify: '/collections/klassieke-boeketten' },
  { label: 'Krans maken', wc: '/product-categorie/krans-maken/', shopify: '/collections/krans-maken' },
]

function getShopifyHandle(page) {
  try {
    const segments = new URL(page.link).pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean)
    const linkHandle = segments[segments.length - 1]
    if (linkHandle) return linkHandle
  } catch {
    // ignore
  }
  return page.slug
}

function getRedirectPageTargets() {
  const handles = new Set()
  const csv = fs.readFileSync(REDIRECTS_CSV, 'utf-8')
  for (const line of csv.split('\n')) {
    const match = line.match(/"\/pages\/([^"]+)"/)
    if (match) handles.add(match[1])
  }
  return [...handles].sort()
}

async function getAllShopifyPages(credentials) {
  const pages = []
  let cursor = null

  while (true) {
    const data = await shopifyGraphql(
      `query($cursor: String) {
        pages(first: 100, after: $cursor) {
          nodes { handle title }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { cursor },
      credentials
    )

    pages.push(...(data.pages?.nodes || []))
    if (!data.pages?.pageInfo?.hasNextPage) break
    cursor = data.pages.pageInfo.endCursor
  }

  return pages
}

async function getAllShopifyCollections(credentials) {
  const collections = []
  let cursor = null

  while (true) {
    const data = await shopifyGraphql(
      `query($cursor: String) {
        collections(first: 100, after: $cursor) {
          nodes { handle title }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { cursor },
      credentials
    )

    collections.push(...(data.collections?.nodes || []))
    if (!data.collections?.pageInfo?.hasNextPage) break
    cursor = data.collections.pageInfo.endCursor
  }

  return collections
}

async function main() {
  const navigationOnly = process.argv.includes('--navigation')
  const wcPages = JSON.parse(fs.readFileSync(PAGES_INPUT, 'utf-8'))
  const redirectTargets = getRedirectPageTargets()
  const credentials = await getCredentials()
  const shopifyPages = await getAllShopifyPages(credentials)
  const shopifyCollections = await getAllShopifyCollections(credentials)
  const shopifyHandles = new Set(shopifyPages.map((page) => page.handle))
  const collectionHandles = new Set(shopifyCollections.map((collection) => collection.handle))

  const wcByHandle = new Map()
  for (const page of wcPages) {
    if (page.status !== 'publish') continue
    wcByHandle.set(page.slug, page)
    wcByHandle.set(getShopifyHandle(page), page)
  }

  const missingInShopify = redirectTargets.filter((handle) => !shopifyHandles.has(handle))
  const missingInWc = redirectTargets.filter((handle) => !wcByHandle.has(handle))

  const navigation = NAVIGATION_CHECKS.map((item) => {
    const handle = item.shopify.replace('/pages/', '').replace('/collections/', '')
    const type = item.shopify.startsWith('/collections/') ? 'collection' : 'page'
    const exists = type === 'collection' ? collectionHandles.has(handle) : shopifyHandles.has(handle)
    return { ...item, handle, type, exists }
  })

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      redirectPageTargets: redirectTargets.length,
      shopifyPages: shopifyPages.length,
      missingInShopify: missingInShopify.length,
      missingInWc: missingInWc.length,
      navigationOk: navigation.filter((item) => item.exists).length,
      navigationTotal: navigation.length,
    },
    missingInShopify,
    missingInWc,
    navigation,
  }

  if (!navigationOnly) {
    report.redirectTargets = redirectTargets
  }

  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))

  console.log('Page parity audit')
  console.log(`  Redirect /pages/ targets: ${report.summary.redirectPageTargets}`)
  console.log(`  Shopify pages:            ${report.summary.shopifyPages}`)
  console.log(`  Ontbrekend in Shopify:    ${report.summary.missingInShopify}`)
  console.log(`  Navigatie OK:             ${report.summary.navigationOk}/${report.summary.navigationTotal}`)
  console.log(`  Rapport: ${REPORT}`)

  if (missingInShopify.length) {
    console.log('\nOntbrekende Shopify pages (eerste 20):')
    missingInShopify.slice(0, 20).forEach((handle) => console.log(`  - ${handle}`))
  }

  const navMissing = navigation.filter((item) => !item.exists)
  if (navMissing.length) {
    console.log('\nNavigatie nog niet OK:')
    navMissing.forEach((item) => console.log(`  - ${item.label}: ${item.shopify}`))
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
