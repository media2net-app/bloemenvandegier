#!/usr/bin/env node
/**
 * Genereert hub-pagina config + Liquid snippet uit WooCommerce pagina's.
 * Hub-pagina's krijgen collectie-stijl: breadcrumbs, SEO intro, categorieblokken of productgrid.
 *
 * Usage: node scripts/generate-hub-pages-config.js
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const PAGES_INPUT = path.join(ROOT, 'data/import/wc-api/pages.json')
const WC_EXPORT = path.join(ROOT, 'data/import/wc-export-latest.csv')
const SHOPIFY_PRODUCTS = path.join(ROOT, 'data/import/shopify-products.csv')
const OUTPUT_JSON = path.join(ROOT, 'data/hub-pages.json')
const OUTPUT_SNIPPET = path.join(ROOT, 'SHOPIFY/snippets/hub-pages-content.liquid')
const OUTPUT_HEADING = path.join(ROOT, 'SHOPIFY/snippets/hub-page-heading.liquid')

const HUB_SLUGS = [
  'rozen-bestellen-bij-de-gier',
  'alle-rozen',
  'witte-rozen',
  'rode-rozen-2',
  'roze-rozen',
  'gele-rozen',
  'gemengde-rozen',
  'boeketten',
  'groen-decoratief',
  'alle-groen-decoratief',
  'voorjaarsbloemen',
  'herfstbloemen',
  'bloemen-per-soort',
  'bloemenpakketten',
  'bloemenbundels',
  'bruiloft-bundels',
  'olijfbomen',
  'droogbloemen',
  'pasen',
  'pioenrozen-bestellen-bij-de-gier',
  'tulpen-bestellen',
  'alle-seizoenen-en-feestdagen',
  'luxe-boeketten',
  'weekdeals',
]

const TITLE_OVERRIDES = {
  'rode-rozen-2': 'Rode rozen',
  'alle-groen-decoratief': 'Alle groen & decoratief',
  'boeket-bloemen': 'Alle boeketten',
  'exclusieve-boeketten': 'Exclusieve boeketten',
}

const COLLECTION_BY_PAGE = {
  'alle-rozen': 'rozen',
  'bloemenpakketten': 'bloemenpakketten',
  'bloemenbundels': 'bloemenbundels',
  'droogbloemen': 'droogbloemen',
  'weekdeals': 'weekdeals',
}

function buildWcSlugToShopifyHandle() {
  const { parseRecords } = require('./lib/wc-import-utils')
  const wc = parseRecords(WC_EXPORT)
  const shop = parseRecords(SHOPIFY_PRODUCTS)
  const shopByTitle = new Map()

  for (const row of shop) {
    if (!row.Handle || !row.Title) continue
    const key = row.Title.split('|')[0].trim().toLowerCase()
    if (!shopByTitle.has(key)) shopByTitle.set(key, row.Handle)
  }

  const map = new Map()
  for (const row of wc) {
    const match = (row.Permalink || '').match(/\/product\/([^/]+)\/?/)
    if (!match) continue
    const wcSlug = match[1]
    const title = row.Title?.split('|')[0]?.trim().toLowerCase()
    const handle = shopByTitle.get(title)
    if (handle) map.set(wcSlug, handle)
  }

  return map
}

function mapProductHandles(wcHandles, slugMap) {
  return [...new Set(wcHandles.map((slug) => slugMap.get(slug) || slug))]
}

const categories = require(path.join(ROOT, 'lib/data/categories.json'))
const catSlugs = new Set(categories.map((c) => c.slug))

function decodeHtml(text) {
  return text
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&nbsp;/g, ' ')
    .replace(/&euro;/g, '€')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getHandle(page) {
  try {
    const segments = new URL(page.link).pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean)
    return segments[segments.length - 1]
  } catch {
    return page.slug
  }
}

function wcPathToShopify(pathname) {
  const clean = pathname.replace(/^\/|\/$/g, '')
  if (!clean) return '/'
  if (clean.startsWith('product-categorie/')) {
    const slug = clean.replace('product-categorie/', '').split('/').pop()
    return `/collections/${slug}`
  }
  if (clean.startsWith('product/')) {
    return `/products/${clean.replace('product/', '')}`
  }
  if (catSlugs.has(clean)) return `/collections/${clean}`
  return `/pages/${clean}`
}

function blockTitle(path) {
  const slug = path.split('/').pop()
  if (TITLE_OVERRIDES[slug]) return TITLE_OVERRIDES[slug]
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getBlockRegion(html) {
  const h1Index = html.search(/<h1[^>]*>/i)
  if (h1Index < 0) return html

  const beforeH1 = html.slice(0, h1Index)
  const afterH1 = html.slice(h1Index)
  const afterIntro = afterH1.replace(/^[\s\S]*?<\/h1>\s*(?:<p[^>]*>[\s\S]*?<\/p>\s*)?/i, '')
  const seoStart = afterIntro.search(/<h[23][^>]*>[\s\S]*?<\/h[23]>\s*<p[^>]*>[^<]{60,}/i)
  const betweenIntroAndSeo = seoStart > 0 ? afterIntro.slice(0, seoStart) : afterIntro

  return beforeH1 + betweenIntroAndSeo
}

function extractLinksFromRegion(region, handle) {
  const linkRe = /href="(?:https?:\/\/www\.bloemenvandegier\.nl)?\/([^"#?]+)"/gi
  const seen = new Set()
  const links = []
  let match

  while ((match = linkRe.exec(region)) !== null) {
    const pathValue = match[1].replace(/\/$/, '')
    if (pathValue.startsWith('product/') || pathValue.includes('wp-') || pathValue === handle) continue
    const isCategory =
      pathValue.startsWith('product-categorie/') || catSlugs.has(pathValue.split('/').pop())
    const isPage = !pathValue.includes('/')
    if (!isCategory && !isPage) continue
    if (seen.has(pathValue)) continue
    seen.add(pathValue)
    const slug = pathValue.replace('product-categorie/', '').split('/').pop()
    links.push({
      path: pathValue,
      title: blockTitle(slug),
      url: wcPathToShopify(pathValue),
    })
  }

  return links
}

function extractHubData(page, slugMap) {
  const html = page.content?.rendered || ''
  const handle = getHandle(page)

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const h1Index = html.search(/<h1[^>]*>/i)
  const afterH1 = h1Index >= 0 ? html.slice(h1Index) : html

  const heading = h1Match ? decodeHtml(h1Match[1]) : decodeHtml(page.title?.rendered || page.slug)

  const introMatch = afterH1.match(/<\/h1>\s*<p[^>]*>([\s\S]*?)<\/p>/i)
  const intro = introMatch ? decodeHtml(introMatch[1]) : ''

  const blockRegion = getBlockRegion(html)
  const images = [...blockRegion.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/gi)]
    .map((m) => m[1])
    .filter((src) => src.includes('wp-content/uploads') && !src.includes('logo') && !src.includes('32x32'))

  const links = extractLinksFromRegion(blockRegion, handle)

  const blocks = links.slice(0, 24).map((link, i) => ({
    title: link.title,
    url: link.url,
    image: images[i] || null,
  }))

  const wcProductHandles = [
    ...new Set(
      [...html.matchAll(/href="(?:https?:\/\/www\.bloemenvandegier\.nl)?\/product\/([^"/?#]+)/gi)].map(
        (m) => m[1]
      )
    ),
  ].slice(0, 48)
  const productHandles = mapProductHandles(wcProductHandles, slugMap)

  const seoSections = []
  const afterIntro = afterH1.replace(/<\/h1>\s*<p[^>]*>[\s\S]*?<\/p>/i, '')
  const sectionRe = /<h([23])[^>]*>([\s\S]*?)<\/h\1>\s*((?:<p[^>]*>[\s\S]*?<\/p>\s*)*)/gi
  let sectionMatch

  while ((sectionMatch = sectionRe.exec(afterIntro)) !== null) {
    const title = decodeHtml(sectionMatch[2])
    if (
      !title ||
      title.length < 8 ||
      title === 'Title' ||
      title.includes('Service') ||
      title.includes('Categorie') ||
      title.includes('Seizoenen') ||
      title.includes('De Gier Bloemen')
    ) {
      continue
    }
    const paragraphs = [...sectionMatch[3].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((m) => decodeHtml(m[1]))
      .filter((t) => t.length > 40 && !t.includes('9.1 uit'))
    if (paragraphs.length) {
      seoSections.push({ level: sectionMatch[1], title, paragraphs })
    }
  }

  const collectionHandle =
    blocks.length < 2 ? COLLECTION_BY_PAGE[handle] || (catSlugs.has(handle) ? handle : null) : null
  const layout =
    blocks.length >= 2
      ? 'blocks'
      : collectionHandle
        ? 'collection'
        : productHandles.length >= 4
          ? 'products'
          : 'content'

  return {
    handle,
    title: decodeHtml(page.title?.rendered || page.slug),
    heading,
    intro,
    layout,
    blocks,
    collectionHandle,
    productHandles: layout === 'products' ? productHandles : [],
    seoSections,
  }
}

function liquidEscape(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
}

function renderBlockCard(block) {
  const img = block.image
    ? `<img src="${block.image}" alt="${liquidEscape(block.title)}" loading="lazy" width="400" height="300">`
    : `<div class="hub-card__placeholder" aria-hidden="true"></div>`

  return `        <a href="${block.url}" class="hub-card">
          <div class="hub-card__image">${img}</div>
          <div class="hub-card__body">
            <h2 class="hub-card__title">${block.title}</h2>
            <span class="hub-card__cta">Bekijk collectie →</span>
          </div>
        </a>`
}

function renderHubLiquid(handle, data) {
  const lines = [`{%- when '${handle}' -%}`]

  if (data.intro) {
    lines.push(`  <div class="hub-page__intro rte">`)
    lines.push(`    <p>${liquidEscape(data.intro)}</p>`)
    lines.push(`  </div>`)
  }

  if (data.layout === 'blocks' && data.blocks.length) {
    lines.push(`  <div class="hub-page__grid">`)
    lines.push(data.blocks.map(renderBlockCard).join('\n'))
    lines.push(`  </div>`)
  } else if (data.layout === 'collection' && data.collectionHandle) {
    lines.push(`  {%- assign hub_collection = collections['${data.collectionHandle}'] -%}`)
    lines.push(`  {%- if hub_collection != blank -%}`)
    lines.push(`    <p class="hub-page__count">{{ hub_collection.products_count }} {{ 'collection.products_available' | t }}</p>`)
    lines.push(`    <div class="collection-page__grid">`)
    lines.push(`      {%- for product in hub_collection.products limit: 48 -%}`)
    lines.push(`        {%- if product.featured_image -%}`)
    lines.push(`          {% render 'product-card', product: product, show_rating: true %}`)
    lines.push(`        {%- endif -%}`)
    lines.push(`      {%- endfor -%}`)
    lines.push(`    </div>`)
    lines.push(`  {%- endif -%}`)
  } else if (data.layout === 'products' && data.productHandles.length) {
    lines.push(`  <div class="collection-page__grid">`)
    for (const productHandle of data.productHandles) {
      lines.push(`    {%- assign hub_product = all_products['${productHandle}'] -%}`)
      lines.push(`    {%- if hub_product != blank and hub_product.featured_image -%}`)
      lines.push(`      {% render 'product-card', product: hub_product, show_rating: true %}`)
      lines.push(`    {%- endif -%}`)
    }
    lines.push(`  </div>`)
  }

  if (data.seoSections?.length) {
    lines.push(`  <div class="hub-page__seo rte">`)
    for (const section of data.seoSections) {
      const tag = section.level === '2' ? 'h2' : 'h3'
      lines.push(`    <${tag} class="hub-page__seo-title">${liquidEscape(section.title)}</${tag}>`)
      for (const para of section.paragraphs) {
        lines.push(`    <p>${liquidEscape(para)}</p>`)
      }
    }
    lines.push(`  </div>`)
  }

  return lines.join('\n')
}

function renderHeadingLiquid(config) {
  const cases = Object.entries(config)
    .filter(([, data]) => data.heading && data.heading !== data.title)
    .map(([handle, data]) => `  {%- when '${handle}' -%}${liquidEscape(data.heading)}`)
    .join('\n')

  return `{%- comment -%} Auto-generated hub page headings {%- endcomment -%}
{%- case page.handle -%}
${cases}
  {%- else -%}{{ page.title }}
{%- endcase -%}`
}

function main() {
  const pages = JSON.parse(fs.readFileSync(PAGES_INPUT, 'utf-8'))
  const slugMap = buildWcSlugToShopifyHandle()
  const config = {}

  for (const slug of HUB_SLUGS) {
    const page = pages.find((p) => p.slug === slug || getHandle(p) === slug)
    if (!page || page.status !== 'publish') continue
    const data = extractHubData(page, slugMap)
    const configKey = data.handle === 'luxe-boeketten' ? 'exclusieve-boeketten' : data.handle
    config[configKey] = { ...data, handle: configKey }
  }

  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(config, null, 2)}\n`)

  const hubHandles = Object.keys(config)
  const cases = hubHandles.map((h) => renderHubLiquid(h, config[h])).join('\n')

  const snippet = `{%- comment -%} Auto-generated by scripts/generate-hub-pages-config.js — niet handmatig bewerken {%- endcomment -%}
{%- case page.handle -%}
${cases}
{%- else -%}
  <div class="hub-page__fallback rte">{{ page.content }}</div>
{%- endcase -%}
`

  fs.writeFileSync(OUTPUT_SNIPPET, snippet)
  fs.writeFileSync(OUTPUT_HEADING, renderHeadingLiquid(config))

  console.log(`hub-pages.json: ${hubHandles.length} pagina's`)
  console.log(`hub-pages-content.liquid geschreven`)
  hubHandles.forEach((h) => {
    const d = config[h]
    console.log(`  ${h}: ${d.layout} (${d.blocks.length} blocks, ${d.productHandles.length} products)`)
  })
}

main()
