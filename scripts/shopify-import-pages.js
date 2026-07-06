#!/usr/bin/env node
/**
 * Importeer WordPress pagina's naar Shopify Pages.
 *
 * Standaard: alleen essentiële pagina's (voorwaarden, privacy, contact, etc.)
 * Optioneel:
 *   --all               alle niet-stad pagina's
 *   --navigation        menu- en hub-pagina's (rozen, boeketten, etc.)
 *   --redirect-targets  alle unieke /pages/ handles uit shopify-redirects.csv
 *   --slug=handle       één pagina
 *   --dry-run
 *
 * Usage:
 *   node --env-file=.env scripts/shopify-import-pages.js
 *   node --env-file=.env scripts/shopify-import-pages.js --redirect-targets
 */

const fs = require('fs')
const path = require('path')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql, delay } = require('./lib/shopify-client')

const ROOT = path.join(__dirname, '..')
const PAGES_INPUT = path.join(ROOT, 'data/import/wc-api/pages.json')
const REDIRECTS_CSV = path.join(ROOT, 'shopify-redirects.csv')
const REPORT = path.join(ROOT, 'data/import/shopify-pages-report.json')
const HUB_CONFIG = path.join(ROOT, 'data/hub-pages.json')

function getHubHandles() {
  if (!fs.existsSync(HUB_CONFIG)) return new Set()
  return new Set(Object.keys(JSON.parse(fs.readFileSync(HUB_CONFIG, 'utf-8'))))
}

const dryRun = process.argv.includes('--dry-run')
const importAll = process.argv.includes('--all')
const importNavigation = process.argv.includes('--navigation')
const importRedirectTargets = process.argv.includes('--redirect-targets')
const slugArg = process.argv.find((arg) => arg.startsWith('--slug='))
const singleSlug = slugArg ? slugArg.split('=')[1] : null

const ESSENTIAL_SLUGS = [
  'algemene-voorwaarden',
  'privacy-verklaring-2',
  'cookiebeleid-eu',
  'contact-opnemen',
  'veelgestelde-vragen',
  'verzendkosten-en-levering',
  'verzendkosten-levertijden',
  'retour-beleid',
  'terugbetalen_retournering',
  'klachtenregeling',
  'zakelijk-bloemen-bestellen',
  'bloemen-laten-bezorgen',
  'bloemen-verzorging',
  'op-de-markt',
]

const NAVIGATION_SLUGS = [
  'rozen-bestellen-bij-de-gier',
  'alle-rozen',
  'witte-rozen',
  'rode-rozen-2',
  'roze-rozen',
  'gele-rozen',
  'gemengde-rozen',
  'boeketten',
  'luxe-boeketten',
  'pioenrozen-bestellen-bij-de-gier',
  'groen-decoratief',
  'alle-groen-decoratief',
  'voorjaarsbloemen',
  'herfstbloemen',
  'bloemen-per-soort',
  'bloemenpakketten',
  'bloemenbundels',
  'olijfbomen',
  'bruiloft-bundels',
  'krans-maken-2',
  'zakelijk-bloemen-bestellen',
  'tulpen-bestellen',
  'tulpen-bestellen-2',
  'droogbloemen',
  'pasen',
  'weekdeals',
  'alle-seizoenen-en-feestdagen',
]

const SKIP_SLUGS = new Set([
  'home',
  'shop',
  'checkout',
  'checkout-2',
  'my-account',
  'mijn-account',
  'afrekenen',
  'sample-page',
  'webshop',
  'blog',
  'order-formulier',
  'quick-order-form',
  'bedankt-voor-uw-aanvraag',
  'zakelijke-bedankt-pagina',
  'zakelijke-login',
  'zakelijk-account-aanmaken',
]);

function getShopifyHandle(page) {
  try {
    const segments = new URL(page.link).pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean)
    const linkHandle = segments[segments.length - 1]
    if (linkHandle) return linkHandle
  } catch {
    // ignore invalid URLs
  }
  return page.slug
}

function findPageByHandle(allPages, handle) {
  return allPages.find((page) => {
    if (page.status !== 'publish') return false
    if (SKIP_SLUGS.has(page.slug)) return false
    return page.slug === handle || getShopifyHandle(page) === handle
  })
}

function getRedirectTargetHandles() {
  if (!fs.existsSync(REDIRECTS_CSV)) {
    throw new Error(`Redirects CSV niet gevonden: ${REDIRECTS_CSV}`)
  }

  const handles = new Set()
  const csv = fs.readFileSync(REDIRECTS_CSV, 'utf-8')
  for (const line of csv.split('\n')) {
    const match = line.match(/"\/pages\/([^"]+)"/)
    if (match) handles.add(match[1])
  }
  return [...handles].sort()
}

function shouldImport(page) {
  if (page.status !== 'publish') return false
  if (SKIP_SLUGS.has(page.slug)) return false
  if (singleSlug) return page.slug === singleSlug || getShopifyHandle(page) === singleSlug
  if (page.slug.startsWith('bloemen-bezorgen-')) return importAll
  if (importAll) return true
  if (importNavigation) return NAVIGATION_SLUGS.includes(page.slug)
  return ESSENTIAL_SLUGS.includes(page.slug)
}

function resolvePagesToImport(allPages) {
  if (importRedirectTargets) {
    const seen = new Set()
    const pages = []

    for (const handle of getRedirectTargetHandles()) {
      if (seen.has(handle)) continue
      const page = findPageByHandle(allPages, handle)
      if (!page) continue
      seen.add(handle)
      pages.push(page)
    }

    return pages
  }

  return allPages.filter(shouldImport)
}

function getImportMode() {
  if (importRedirectTargets) return 'redirect-targets'
  if (importAll) return 'all'
  if (importNavigation) return 'navigation'
  if (singleSlug) return 'single'
  return 'essential'
}

async function getPageByHandle(handle, credentials) {
  const data = await shopifyGraphql(
    `query($query: String!) {
      pages(first: 1, query: $query) {
        nodes { id handle title }
      }
    }`,
    { query: `handle:${handle}` },
    credentials
  )
  return data.pages?.nodes?.[0] || null
}

async function createPage(page, handle, credentials, hubHandles) {
  const title = page.title?.rendered?.replace(/&#038;/g, '&').replace(/&amp;/g, '&') || page.slug
  const bodyHtml = page.content?.rendered || ''
  const isHub = hubHandles.has(handle)

  const input = {
    title,
    handle,
    body: bodyHtml,
    isPublished: true,
  }
  if (isHub) input.templateSuffix = 'hub'

  const data = await shopifyGraphql(
    `mutation($page: PageCreateInput!) {
      pageCreate(page: $page) {
        page { id handle title templateSuffix }
        userErrors { field message }
      }
    }`,
    { page: input },
    credentials
  )

  const result = data.pageCreate
  if (result.userErrors?.length) {
    const msg = result.userErrors.map((e) => e.message).join('; ')
    if (msg.includes('already been taken') || msg.includes('already exists')) {
      return { skipped: true }
    }
    throw new Error(msg)
  }
  return { created: true, page: result.page }
}

async function main() {
  if (!fs.existsSync(PAGES_INPUT)) {
    throw new Error(`Pagina's niet gevonden. Draai eerst: npm run wc:fetch-all\nPad: ${PAGES_INPUT}`)
  }

  const allPages = JSON.parse(fs.readFileSync(PAGES_INPUT, 'utf-8'))
  const pages = resolvePagesToImport(allPages)
  const mode = getImportMode()

  console.log(`Pagina's te importeren: ${pages.length} (${mode})`)

  if (dryRun) {
    pages.forEach((page) => {
      const handle = getShopifyHandle(page)
      const alias = handle !== page.slug ? ` [${page.slug} → ${handle}]` : ''
      console.log(`  - ${handle}${alias}`)
    })
    return
  }

  const credentials = await getCredentials()
  const hubHandles = getHubHandles()
  const report = {
    startedAt: new Date().toISOString(),
    mode,
    total: pages.length,
    created: 0,
    skipped: 0,
    errors: [],
    results: [],
  }

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const handle = getShopifyHandle(page)
    const label = handle !== page.slug ? `${page.slug} → ${handle}` : handle
    process.stdout.write(`[${i + 1}/${pages.length}] ${label}...`)

    try {
      const existing = await getPageByHandle(handle, credentials)
      if (existing) {
        report.skipped++
        report.results.push({ slug: page.slug, handle, status: 'exists', id: existing.id })
        console.log(' bestaat al')
        await delay(150)
        continue
      }

      const result = await createPage(page, handle, credentials, hubHandles)
      if (result.skipped) {
        report.skipped++
        report.results.push({ slug: page.slug, handle, status: 'skipped' })
        console.log(' overgeslagen')
      } else {
        report.created++
        report.results.push({ slug: page.slug, handle, status: 'created', id: result.page.id })
        console.log(' aangemaakt')
      }
    } catch (error) {
      report.errors.push({ slug: page.slug, handle, error: error.message })
      report.results.push({ slug: page.slug, handle, status: 'error', error: error.message })
      console.log(` fout: ${error.message}`)
    }

    await delay(300)
  }

  report.finishedAt = new Date().toISOString()
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))

  console.log(`\nKlaar. Aangemaakt: ${report.created}, overgeslagen: ${report.skipped}, fouten: ${report.errors.length}`)
  console.log(`Rapport: ${REPORT}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
