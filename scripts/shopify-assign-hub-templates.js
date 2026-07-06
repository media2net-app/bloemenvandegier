#!/usr/bin/env node
/**
 * Wijs hub-template (page.hub) toe aan overzichtspagina's in Shopify.
 *
 * Usage:
 *   node --env-file=.env scripts/shopify-assign-hub-templates.js
 *   node --env-file=.env scripts/shopify-assign-hub-templates.js --dry-run
 */

const fs = require('fs')
const path = require('path')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql, delay } = require('./lib/shopify-client')

const ROOT = path.join(__dirname, '..')
const HUB_CONFIG = path.join(ROOT, 'data/hub-pages.json')
const REPORT = path.join(ROOT, 'data/import/shopify-hub-templates-report.json')

const dryRun = process.argv.includes('--dry-run')

async function getPageByHandle(handle, credentials) {
  const data = await shopifyGraphql(
    `query($query: String!) {
      pages(first: 1, query: $query) {
        nodes { id handle title templateSuffix }
      }
    }`,
    { query: `handle:${handle}` },
    credentials
  )
  return data.pages?.nodes?.[0] || null
}

async function updatePageTemplate(pageId, credentials) {
  const data = await shopifyGraphql(
    `mutation($id: ID!, $page: PageUpdateInput!) {
      pageUpdate(id: $id, page: $page) {
        page { id handle templateSuffix }
        userErrors { field message }
      }
    }`,
    { id: pageId, page: { templateSuffix: 'hub' } },
    credentials
  )

  const result = data.pageUpdate
  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map((e) => e.message).join('; '))
  }
  return result.page
}

async function main() {
  if (!fs.existsSync(HUB_CONFIG)) {
    throw new Error(`Hub config niet gevonden. Draai eerst: node scripts/generate-hub-pages-config.js`)
  }

  const hubPages = Object.keys(JSON.parse(fs.readFileSync(HUB_CONFIG, 'utf-8')))
  console.log(`Hub-pagina's: ${hubPages.length}${dryRun ? ' (dry-run)' : ''}`)

  if (dryRun) {
    hubPages.forEach((h) => console.log(`  - ${h}`))
    return
  }

  const credentials = await getCredentials()
  const report = {
    startedAt: new Date().toISOString(),
    total: hubPages.length,
    updated: 0,
    skipped: 0,
    missing: 0,
    errors: [],
    results: [],
  }

  for (let i = 0; i < hubPages.length; i++) {
    const handle = hubPages[i]
    process.stdout.write(`[${i + 1}/${hubPages.length}] ${handle}...`)

    try {
      const page = await getPageByHandle(handle, credentials)
      if (!page) {
        report.missing++
        report.results.push({ handle, status: 'missing' })
        console.log(' niet gevonden')
        await delay(150)
        continue
      }

      if (page.templateSuffix === 'hub') {
        report.skipped++
        report.results.push({ handle, status: 'already_hub', id: page.id })
        console.log(' al hub-template')
        await delay(150)
        continue
      }

      await updatePageTemplate(page.id, credentials)
      report.updated++
      report.results.push({ handle, status: 'updated', id: page.id })
      console.log(' hub-template gezet')
    } catch (error) {
      report.errors.push({ handle, error: error.message })
      report.results.push({ handle, status: 'error', error: error.message })
      console.log(` fout: ${error.message}`)
    }

    await delay(250)
  }

  report.finishedAt = new Date().toISOString()
  fs.mkdirSync(path.dirname(REPORT), { recursive: true })
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))

  console.log(`\nBijgewerkt: ${report.updated}, overgeslagen: ${report.skipped}, ontbrekend: ${report.missing}`)
  console.log(`Rapport: ${REPORT}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
