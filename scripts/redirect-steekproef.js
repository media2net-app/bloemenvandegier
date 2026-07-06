#!/usr/bin/env node
/**
 * Test belangrijke redirects tegen de live Shopify storefront.
 *
 * Usage:
 *   node scripts/redirect-steekproef.js
 *   SHOPIFY_STOREFRONT_URL=https://xn68xb-0f.myshopify.com node scripts/redirect-steekproef.js
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const REDIRECTS = path.join(ROOT, 'shopify-redirects.csv')
const REPORT = path.join(ROOT, 'data/import/redirect-steekproef-report.json')

const STOREFRONT = process.env.SHOPIFY_STOREFRONT_URL || 'https://xn68xb-0f.myshopify.com'
const SAMPLE_SIZE = Number(process.env.REDIRECT_SAMPLE_SIZE || 30)

const PRIORITY_PATHS = [
  '/product-categorie/plukboeketten/',
  '/product-categorie/rozen/',
  '/product-categorie/tulpen-boeketten/',
  '/product-categorie/klassieke-boeketten/',
  '/product-categorie/asparagus-takken/',
  '/product/plukboeket-bont/',
  '/product/100-witte-rozen/',
  '/pages/rozen-bestellen-bij-de-gier',
  '/pages/pioenrozen-bestellen',
  '/pages/exclusieve-boeketten',
  '/blog/',
]

function loadRedirectPaths() {
  const csv = fs.readFileSync(REDIRECTS, 'utf-8')
  const lines = csv.split('\n').slice(1).filter(Boolean)
  const paths = lines
    .map((line) => {
      const match = line.match(/^"([^"]+)"/)
      return match ? match[1] : null
    })
    .filter(Boolean)
  return paths
}

function pickSample(allPaths) {
  const picked = new Set(PRIORITY_PATHS.filter((p) => allPaths.includes(p)))
  for (const p of allPaths) {
    if (picked.size >= SAMPLE_SIZE) break
    picked.add(p)
  }
  return [...picked].slice(0, SAMPLE_SIZE)
}

async function checkPath(pathname) {
  const url = `${STOREFRONT.replace(/\/$/, '')}${pathname}`
  try {
    const response = await fetch(url, { redirect: 'manual' })
    const location = response.headers.get('location') || ''
    const ok = response.status === 301 || response.status === 302 || response.status === 200
    return {
      path: pathname,
      status: response.status,
      location,
      ok,
    }
  } catch (error) {
    return {
      path: pathname,
      status: 0,
      location: '',
      ok: false,
      error: error.message,
    }
  }
}

async function main() {
  if (!fs.existsSync(REDIRECTS)) {
    throw new Error(`Redirects niet gevonden: ${REDIRECTS}`)
  }

  const allPaths = loadRedirectPaths()
  const sample = pickSample(allPaths)

  console.log(`Steekproef: ${sample.length} URLs op ${STOREFRONT}`)

  const results = []
  for (const pathname of sample) {
    process.stdout.write(`${pathname} ... `)
    const result = await checkPath(pathname)
    results.push(result)
    console.log(result.ok ? `${result.status} OK` : `FOUT ${result.status}`)
  }

  const failed = results.filter((r) => !r.ok)
  const report = {
    testedAt: new Date().toISOString(),
    storefront: STOREFRONT,
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    results,
  }

  fs.mkdirSync(path.dirname(REPORT), { recursive: true })
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))

  console.log(`\nGeslaagd: ${report.passed}/${report.total}`)
  console.log(`Rapport: ${REPORT}`)
  if (failed.length) process.exit(1)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
