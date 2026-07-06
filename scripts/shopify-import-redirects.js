#!/usr/bin/env node
/**
 * Importeer shopify-redirects.csv naar Shopify.
 * Probeert eerst bulk import; valt terug op urlRedirectCreate per redirect.
 *
 * Usage:
 *   node --env-file=.env scripts/shopify-import-redirects.js
 *   node --env-file=.env scripts/shopify-import-redirects.js --batch-only
 */

const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql, delay } = require('./lib/shopify-client')

const ROOT = path.join(__dirname, '..')
const INPUT = path.join(ROOT, 'shopify-redirects.csv')
const REPORT = path.join(ROOT, 'data/import/shopify-redirects-report.json')

const batchOnly = process.argv.includes('--batch-only')
const fixHubs = process.argv.includes('--fix-hubs')

const HUB_PAGE_PATHS = [
  '/alle-groen-decoratief',
  '/bloemenbundels',
  '/bloemenpakketten',
  '/bruiloft-bundels',
  '/droogbloemen',
  '/groen-decoratief',
  '/herfstbloemen',
  '/moederdag-cadeau',
  '/olijfbomen',
  '/pasen',
  '/voorjaarsbloemen',
  '/weekdeals',
]

function loadRedirects() {
  const csv = fs.readFileSync(INPUT, 'utf-8')
  const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true, bom: true })
  return rows.map((row) => ({
    path: row['Redirect from'] || row.path,
    target: row['Redirect to'] || row.target,
  }))
}

async function createRedirect(redirect, credentials) {
  const data = await shopifyGraphql(
    `mutation($urlRedirect: UrlRedirectInput!) {
      urlRedirectCreate(urlRedirect: $urlRedirect) {
        urlRedirect { id path target }
        userErrors { field message }
      }
    }`,
    {
      urlRedirect: {
        path: redirect.path,
        target: redirect.target,
      },
    },
    credentials
  )

  const result = data.urlRedirectCreate
  if (result.userErrors?.length) {
    const msg = result.userErrors.map((e) => e.message).join('; ')
    if (msg.includes('already exists') || msg.includes('has already been taken')) {
      return { skipped: true }
    }
    throw new Error(msg)
  }
  return { created: true }
}

async function importBatch(redirects, credentials) {
  const report = {
    method: 'batch',
    startedAt: new Date().toISOString(),
    total: redirects.length,
    created: 0,
    skipped: 0,
    errors: [],
  }

  for (let i = 0; i < redirects.length; i++) {
    const redirect = redirects[i]
    if (i % 50 === 0) {
      process.stdout.write(`[${i + 1}/${redirects.length}] redirects...\r`)
      fs.mkdirSync(path.dirname(REPORT), { recursive: true })
      fs.writeFileSync(REPORT, JSON.stringify({ ...report, progress: i + 1 }, null, 2))
    }

    try {
      const result = await createRedirect(redirect, credentials)
      if (result.skipped) report.skipped++
      else report.created++
      await delay(150)
    } catch (error) {
      report.errors.push({
        path: redirect.path,
        target: redirect.target,
        error: error.message,
      })
    }
  }

  report.finishedAt = new Date().toISOString()
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))
  return report
}

async function findRedirectByPath(pathValue, credentials) {
  const data = await shopifyGraphql(
    `query($query: String!) {
      urlRedirects(first: 5, query: $query) {
        nodes { id path target }
      }
    }`,
    { query: `path:${pathValue}` },
    credentials
  )
  return data.urlRedirects?.nodes?.find((node) => node.path === pathValue) || null
}

async function updateRedirect(id, redirect, credentials) {
  const data = await shopifyGraphql(
    `mutation($id: ID!, $urlRedirect: UrlRedirectInput!) {
      urlRedirectUpdate(id: $id, urlRedirect: $urlRedirect) {
        urlRedirect { id path target }
        userErrors { field message }
      }
    }`,
    {
      id,
      urlRedirect: {
        path: redirect.path,
        target: redirect.target,
      },
    },
    credentials
  )

  const result = data.urlRedirectUpdate
  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map((e) => e.message).join('; '))
  }
  return result.urlRedirect
}

async function fixHubRedirects(credentials) {
  const report = {
    method: 'fix-hubs',
    startedAt: new Date().toISOString(),
    updated: 0,
    skipped: 0,
    created: 0,
    errors: [],
    results: [],
  }

  for (const hubPath of HUB_PAGE_PATHS) {
    const target = `/pages/${hubPath.replace(/^\//, '')}`
    process.stdout.write(`${hubPath} → ${target}...`)

    try {
      const existing = await findRedirectByPath(hubPath, credentials)
      if (existing) {
        if (existing.target === target) {
          report.skipped++
          report.results.push({ path: hubPath, status: 'ok' })
          console.log(' al correct')
        } else {
          await updateRedirect(existing.id, { path: hubPath, target }, credentials)
          report.updated++
          report.results.push({ path: hubPath, status: 'updated', from: existing.target, to: target })
          console.log(` bijgewerkt (${existing.target})`)
        }
      } else {
        const result = await createRedirect({ path: hubPath, target }, credentials)
        if (result.skipped) {
          report.skipped++
          report.results.push({ path: hubPath, status: 'skipped' })
          console.log(' overgeslagen')
        } else {
          report.created++
          report.results.push({ path: hubPath, status: 'created' })
          console.log(' aangemaakt')
        }
      }
    } catch (error) {
      report.errors.push({ path: hubPath, error: error.message })
      report.results.push({ path: hubPath, status: 'error', error: error.message })
      console.log(` fout: ${error.message}`)
    }

    await delay(200)
  }

  report.finishedAt = new Date().toISOString()
  fs.mkdirSync(path.dirname(REPORT), { recursive: true })
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))

  console.log(`\nBijgewerkt: ${report.updated}, aangemaakt: ${report.created}, overgeslagen: ${report.skipped}`)
  console.log(`Fouten: ${report.errors.length}`)
  console.log(`Rapport: ${REPORT}`)
}

async function main() {
  if (!fs.existsSync(INPUT) && !fixHubs) {
    throw new Error(`Bestand niet gevonden: ${INPUT}`)
  }

  const credentials = await getCredentials()

  if (fixHubs) {
    console.log('Hub-pagina redirects bijwerken naar /pages/...')
    await fixHubRedirects(credentials)
    return
  }

  const redirects = loadRedirects()
  console.log(`Redirects: ${redirects.length}`)
  console.log('Importeren via urlRedirectCreate (batch)...')

  const report = await importBatch(redirects, credentials)

  console.log(`\nAangemaakt: ${report.created}`)
  console.log(`Overgeslagen (bestond al): ${report.skipped}`)
  console.log(`Fouten: ${report.errors.length}`)
  console.log(`Rapport: ${REPORT}`)

  if (report.errors.length > 10) process.exit(1)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
