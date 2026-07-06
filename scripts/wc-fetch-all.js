#!/usr/bin/env node
/**
 * Haal alle WooCommerce migratiedata op via REST API.
 * Geen officiële WooCommerce CLI — dit script werkt als lokale "CLI" op je MacBook.
 *
 * Usage:
 *   node --env-file=.env scripts/wc-fetch-all.js
 *   node --env-file=.env scripts/wc-fetch-all.js --only=products,categories
 *   node --env-file=.env scripts/wc-fetch-all.js --skip-variations
 *   node --env-file=.env scripts/wc-fetch-all.js --status
 */

const {
  getWcConfig,
  wcFetch,
  wcFetchAll,
  wcFetchWpAll,
  writeJson,
  delay,
} = require('./lib/wc-api-client')

const OUTPUT_DIR = 'data/import/wc-api'
const args = process.argv.slice(2)
const onlyArg = args.find((a) => a.startsWith('--only='))?.split('=')[1]
const only = onlyArg ? onlyArg.split(',').map((s) => s.trim()) : null
const skipVariations = args.includes('--skip-variations')
const statusOnly = args.includes('--status')

function shouldFetch(type) {
  return !only || only.includes(type)
}

async function testConnection() {
  const config = getWcConfig()
  const result = await wcFetch('products', { per_page: 1, status: 'publish' })
  return {
    connected: true,
    storeUrl: config.baseUrl,
    productTotal: result.total,
    message: `Verbonden met ${config.baseUrl}`,
  }
}

async function fetchProducts() {
  console.log('Producten ophalen...')
  const { items, total } = await wcFetchAll(
    'products',
    { status: 'publish' },
    {
      perPage: 100,
      delayMs: 200,
      onPage: (page, totalPages) => process.stdout.write(`  pagina ${page}/${totalPages}\r`),
    }
  )
  console.log(`\n  ${items.length} gepubliceerde producten (${total} totaal in API)`)

  if (!skipVariations) {
    const variable = items.filter((p) => p.type === 'variable')
    console.log(`  Variaties ophalen voor ${variable.length} variabele producten...`)

    for (let i = 0; i < variable.length; i++) {
      const product = variable[i]
      process.stdout.write(`  variaties ${i + 1}/${variable.length}: ${product.slug}...\r`)
      try {
        const { items: variations } = await wcFetchAll(`products/${product.id}/variations`, {}, {
          perPage: 100,
          delayMs: 100,
        })
        product.variations_data = variations
      } catch (error) {
        product.variations_error = error.message
      }
      await delay(150)
    }
    console.log('')
  }

  writeJson(`${OUTPUT_DIR}/products.json`, items)
  return items.length
}

async function fetchCategories() {
  console.log('Categorieën ophalen...')
  const { items, total } = await wcFetchAll('products/categories', { per_page: 100 }, { delayMs: 150 })
  console.log(`  ${items.length} categorieën (${total} totaal)`)
  writeJson(`${OUTPUT_DIR}/categories.json`, items)
  return items.length
}

async function fetchTags() {
  console.log('Tags ophalen...')
  const { items } = await wcFetchAll('products/tags', { per_page: 100 }, { delayMs: 150 })
  console.log(`  ${items.length} tags`)
  writeJson(`${OUTPUT_DIR}/tags.json`, items)
  return items.length
}

async function fetchAttributes() {
  console.log('Attributen ophalen...')
  const { items } = await wcFetchAll('products/attributes', { per_page: 100 }, { delayMs: 150 })
  console.log(`  ${items.length} attributen`)
  writeJson(`${OUTPUT_DIR}/attributes.json`, items)
  return items.length
}

async function fetchPages() {
  console.log('WordPress pagina\'s ophalen...')
  const { items } = await wcFetchWpAll('pages', { status: 'publish' }, { delayMs: 150 })
  console.log(`  ${items.length} pagina's`)
  writeJson(`${OUTPUT_DIR}/pages.json`, items)
  return items.length
}

async function fetchPosts() {
  console.log('Blog posts ophalen...')
  const { items } = await wcFetchWpAll('posts', { status: 'publish' }, { delayMs: 150 })
  console.log(`  ${items.length} posts`)
  writeJson(`${OUTPUT_DIR}/posts.json`, items)
  return items.length
}

async function main() {
  if (statusOnly) {
    const status = await testConnection()
    console.log(JSON.stringify(status, null, 2))
    return
  }

  const startedAt = new Date().toISOString()
  const config = getWcConfig()
  const connection = await testConnection()
  console.log(`\n${connection.message}`)
  console.log(`Output: ${OUTPUT_DIR}/\n`)

  const counts = {}

  if (shouldFetch('products')) counts.products = await fetchProducts()
  if (shouldFetch('categories')) counts.categories = await fetchCategories()
  if (shouldFetch('tags')) counts.tags = await fetchTags()
  if (shouldFetch('attributes')) counts.attributes = await fetchAttributes()
  if (shouldFetch('pages')) counts.pages = await fetchPages()
  if (shouldFetch('posts')) counts.posts = await fetchPosts()

  const manifest = {
    fetchedAt: new Date().toISOString(),
    startedAt,
    storeUrl: config.baseUrl,
    counts,
    apiProductTotal: connection.productTotal,
    options: { skipVariations, only },
  }

  writeJson(`${OUTPUT_DIR}/manifest.json`, manifest)

  console.log('\n--- Klaar ---')
  console.log(JSON.stringify(manifest, null, 2))
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
