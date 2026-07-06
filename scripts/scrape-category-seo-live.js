#!/usr/bin/env node
/**
 * Scrape SEO-secties (H2 + alinea) van live WooCommerce categoriepagina's.
 * Veel categorieën (zoals asparagus-takken) hebben uitgebreide SEO alleen op de live site,
 * niet in de WC REST API category.description.
 *
 * Usage:
 *   node scripts/scrape-category-seo-live.js
 *   node scripts/scrape-category-seo-live.js --slug=asparagus-takken
 */

const fs = require('fs')
const https = require('https')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const WC_CATEGORIES = path.join(ROOT, 'data/import/wc-api/categories.json')
const OUTPUT = path.join(ROOT, 'data/import/category-seo-live.json')

const slugArg = process.argv.find((a) => a.startsWith('--slug='))
const slugFilter = slugArg ? slugArg.split('=')[1] : null
const LIVE_BASE = 'https://www.bloemenvandegier.nl/product-categorie'

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Bloemenvandegier-migration/1.0' } }, (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => resolve(data))
      })
      .on('error', reject)
  })
}

function decode(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function stripHtml(html) {
  return decode(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
}

function extractSections(html) {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')

  const sections = []
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>/gi
  let match

  while ((match = re.exec(cleaned))) {
    const title = stripHtml(match[1])
    const paragraph = stripHtml(match[2])
    if (title.length < 15 || paragraph.length < 60) continue
    if (/service|categorie|bloemenmand|de gier bloemen/i.test(title)) continue
    sections.push({ title, paragraphs: [paragraph] })
  }

  return sections
}

function sectionsToHtml(sections) {
  const { escapeHtml } = require('./lib/seo-utils')
  return sections
    .map((s) => `<h2>${escapeHtml(s.title)}</h2>\n<p>${escapeHtml(s.paragraphs.join(' '))}</p>`)
    .join('\n')
}

async function main() {
  let categories = JSON.parse(fs.readFileSync(WC_CATEGORIES, 'utf-8')).filter(
    (c) => c.count > 0 && c.slug !== 'uncategorized'
  )

  if (slugFilter) {
    categories = categories.filter((c) => c.slug === slugFilter)
  }

  const existing = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, 'utf-8')) : {}
  const results = slugFilter ? { ...existing } : {}

  console.log(`Scrapen: ${categories.length} categorieën`)

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i]
    process.stdout.write(`[${i + 1}/${categories.length}] ${cat.slug}... `)

    try {
      const html = await fetch(`${LIVE_BASE}/${cat.slug}/`)
      const sections = extractSections(html)
      const liveHtml = sectionsToHtml(sections)

      results[cat.slug] = {
        name: cat.name,
        wcSlug: cat.slug,
        apiDescriptionLength: (cat.description || '').trim().length,
        liveSectionCount: sections.length,
        liveHtmlLength: liveHtml.length,
        sections,
        yoastTitle: cat.yoast_head_json?.title || null,
        yoastDescription: cat.yoast_head_json?.description || null,
        productCount: cat.count,
        scrapedAt: new Date().toISOString(),
      }

      console.log(`${sections.length} secties (${liveHtml.length} chars)`)
      await new Promise((r) => setTimeout(r, 120))
    } catch (error) {
      console.log(`FOUT: ${error.message}`)
      results[cat.slug] = { wcSlug: cat.slug, error: error.message }
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2))
  console.log(`\nOpgeslagen: ${OUTPUT}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
