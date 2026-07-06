#!/usr/bin/env node
/**
 * Maak /pages/track aan met template track (volg bestelling).
 *
 * Usage:
 *   node --env-file=.env scripts/shopify-create-track-page.js
 */

const fs = require('fs')
const path = require('path')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql, delay } = require('./lib/shopify-client')

const ROOT = path.join(__dirname, '..')
const REPORT = path.join(ROOT, 'data/import/shopify-track-page-report.json')

const HANDLE = 'track'
const TITLE = 'Volg je bestelling'

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
  return data.pages.nodes[0] || null
}

async function createPage(credentials) {
  const data = await shopifyGraphql(
    `mutation($page: PageCreateInput!) {
      pageCreate(page: $page) {
        page { id handle title templateSuffix }
        userErrors { field message }
      }
    }`,
    {
      page: {
        title: TITLE,
        handle: HANDLE,
        templateSuffix: 'track',
        isPublished: true,
        body: '',
      },
    },
    credentials
  )
  const result = data.pageCreate
  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map((e) => e.message).join('; '))
  }
  return result.page
}

async function main() {
  const credentials = await getCredentials()
  const existing = await getPageByHandle(HANDLE, credentials)

  const report = {
    startedAt: new Date().toISOString(),
    handle: HANDLE,
    status: existing ? 'exists' : 'created',
    id: existing?.id || null,
    url: `/pages/${HANDLE}`,
  }

  if (existing) {
    console.log(`Pagina bestaat al: /pages/${HANDLE}`)
  } else {
    const page = await createPage(credentials)
    report.id = page.id
    report.status = 'created'
    console.log(`Pagina aangemaakt: /pages/${HANDLE}`)
    await delay(200)
  }

  report.finishedAt = new Date().toISOString()
  fs.mkdirSync(path.dirname(REPORT), { recursive: true })
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))
  console.log(`Rapport: ${REPORT}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
