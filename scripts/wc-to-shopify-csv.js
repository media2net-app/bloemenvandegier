#!/usr/bin/env node
/**
 * WooCommerce WP All Export CSV → Shopify product import CSV
 *
 * Usage:
 *   node scripts/wc-to-shopify-csv.js
 *   node scripts/wc-to-shopify-csv.js --input /path/to/export.csv
 *   node scripts/wc-to-shopify-csv.js --include-drafts
 */

const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

const ROOT = path.join(__dirname, '..')
const DEFAULT_INPUT = path.join(ROOT, 'data/import/wc-export-latest.csv')
const OUTPUT_DIR = path.join(ROOT, 'data/import')

const SHOPIFY_COLUMNS = [
  'Handle',
  'Title',
  'Body (HTML)',
  'Vendor',
  'Type',
  'Tags',
  'Published',
  'Option1 Name',
  'Option1 Value',
  'Option2 Name',
  'Option2 Value',
  'Option3 Name',
  'Option3 Value',
  'Variant SKU',
  'Variant Price',
  'Variant Compare At Price',
  'Variant Inventory Qty',
  'Variant Inventory Policy',
  'Variant Requires Shipping',
  'Variant Taxable',
  'Image Src',
  'Image Position',
  'Image Alt Text',
  'Gift Card',
]

const args = process.argv.slice(2)
const inputPath = getArgValue('--input') || DEFAULT_INPUT
const includeDrafts = args.includes('--include-drafts')

function getArgValue(flag) {
  const index = args.indexOf(flag)
  return index >= 0 ? args[index + 1] : null
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseRecords(filePath) {
  const csv = fs.readFileSync(filePath, 'utf-8')
  return parse(csv, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
    bom: true,
  })
}

function isPublished(row) {
  return row.Status === 'publish'
}

function isTopLevel(row) {
  const parentId = row['Parent Product ID']
  return !parentId || parentId === '0'
}

function getImages(row) {
  const urls = []
  const featured = row['Image Featured'] || row['Image URL']
  if (featured && featured.startsWith('http')) urls.push(featured)
  if (row['Image URL'] && row['Image URL'].startsWith('http') && !urls.includes(row['Image URL'])) {
    urls.push(row['Image URL'])
  }
  return urls
}

function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function getCategories(row) {
  if (!row.Productcategorieën) return []
  return row.Productcategorieën
    .split('|')
    .flatMap((part) => part.split('>').map((name) => decodeHtmlEntities(name.trim())))
    .filter(Boolean)
}

function getTags(row) {
  const tags = new Set(getCategories(row))
  if (row['Product Tags']) {
    row['Product Tags']
      .split('|')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .forEach((tag) => tags.add(tag))
  }
  return [...tags]
}

function getChildOptionValues(child) {
  const values = []
  const taxes = new Set()

  Object.keys(child).forEach((key) => {
    const match = key.match(/^Attribute Name \((.+)\)$/)
    if (match && child[key]) taxes.add(match[1])
  })

  taxes.forEach((tax) => {
    const value = (child[`Attribute Value (${tax})`] || '').trim()
    if (!value) return
    const name = (child[`Attribute Name (${tax})`] || tax)
      .replace(/^pa_/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
    values.push({ tax, name, value })
  })

  return values
}

function inferOptions(children) {
  const optionMap = new Map()

  children.forEach((child) => {
    getChildOptionValues(child).forEach(({ tax, name, value }) => {
      if (!optionMap.has(tax)) {
        optionMap.set(tax, { name, values: new Set() })
      }
      optionMap.get(tax).name = name
      optionMap.get(tax).values.add(value)
    })
  })

  return [...optionMap.values()]
    .slice(0, 3)
    .map((option) => ({
      name: option.name,
      values: [...option.values],
    }))
}

function formatPrice(value) {
  if (value === undefined || value === null || value === '') return ''
  const normalized = String(value).replace(',', '.').trim()
  const number = Number(normalized)
  if (Number.isNaN(number)) return ''
  return number.toFixed(2)
}

function inventoryQty(row) {
  const stock = row.Stock
  if (stock === undefined || stock === null || stock === '') return ''
  const qty = parseInt(stock, 10)
  return Number.isNaN(qty) ? '' : String(qty)
}

function inventoryPolicy(row) {
  return row['Stock Status'] === 'instock' ? 'continue' : 'deny'
}

function compareAtPrice(row) {
  const sale = formatPrice(row['Sale Price'])
  const regular = formatPrice(row['Regular Price'])
  if (sale && regular && sale !== regular) return regular
  return ''
}

function variantPrice(row) {
  return formatPrice(row.Price || row['Regular Price'] || row['Sale Price'])
}

function emptyRow() {
  return Object.fromEntries(SHOPIFY_COLUMNS.map((column) => [column, '']))
}

function csvEscape(value) {
  const text = value == null ? '' : String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function rowToCsv(row) {
  return SHOPIFY_COLUMNS.map((column) => csvEscape(row[column] ?? '')).join(',')
}

function ensureUniqueHandles(products) {
  const used = new Map()

  return products.map((product) => {
    let handle = product.handle || slugify(product.title)
    if (!handle) handle = `product-${product.id}`

    if (!used.has(handle)) {
      used.set(handle, 1)
      return { ...product, handle }
    }

    const count = used.get(handle) + 1
    used.set(handle, count)
    return { ...product, handle: `${handle}-${product.id}` }
  })
}

function buildShopifyRows(records) {
  const childrenByParent = new Map()

  records.forEach((row) => {
    const parentId = row['Parent Product ID']
    if (!parentId || parentId === '0') return
    if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, [])
    childrenByParent.get(parentId).push(row)
  })

  const parents = records.filter((row) => {
    if (!isTopLevel(row)) return false
    return includeDrafts || isPublished(row)
  })

  const uniqueParents = ensureUniqueHandles(
    parents.map((row) => ({
      id: row.ID,
      handle: row.Slug || slugify(row.Title),
      title: row.Title,
      row,
    }))
  )

  const shopifyRows = []
  const report = {
    generatedAt: new Date().toISOString(),
    input: inputPath,
    includeDrafts,
    parents: uniqueParents.length,
    simple: 0,
    variable: 0,
    variantRows: 0,
    imageOnlyRows: 0,
    skipped: [],
    categories: new Set(),
    withoutImages: [],
  }

  uniqueParents.forEach(({ row, handle, title }) => {
    const publishedChildren = (childrenByParent.get(row.ID) || []).filter((child) =>
      includeDrafts ? true : isPublished(child)
    )
    const images = getImages(row)
    const tags = getTags(row)
    const categories = getCategories(row)
    categories.forEach((category) => report.categories.add(category))

    if (!images.length) {
      report.withoutImages.push({ id: row.ID, title, handle })
    }

    const base = emptyRow()
    base.Handle = handle
    base.Title = title
    base['Body (HTML)'] = row.Content || ''
    base.Vendor = 'Bloemen van De Gier'
    base.Type = categories[0] || 'Bloemen'
    base.Tags = tags.join(', ')
    base.Published = isPublished(row) ? 'TRUE' : 'FALSE'
    base['Gift Card'] = 'FALSE'
    base['Variant Requires Shipping'] = 'TRUE'
    base['Variant Taxable'] = 'TRUE'

    if (publishedChildren.length > 0) {
      report.variable += 1
      const options = inferOptions(publishedChildren)

      options.forEach((option, index) => {
        base[`Option${index + 1} Name`] = option.name
      })

      publishedChildren.forEach((child, childIndex) => {
        const variantRow = { ...base }
        if (childIndex > 0) {
          variantRow.Title = ''
          variantRow['Body (HTML)'] = ''
          variantRow.Vendor = ''
          variantRow.Type = ''
          variantRow.Tags = ''
          variantRow.Published = ''
        }

        const childOptions = getChildOptionValues(child)
        options.forEach((option, index) => {
          const match = childOptions.find((value) =>
            option.values.includes(value.value)
          )
          variantRow[`Option${index + 1} Value`] = match ? match.value : option.values[childIndex] || ''
        })

        variantRow['Variant SKU'] = child.Sku || ''
        variantRow['Variant Price'] = variantPrice(child)
        variantRow['Variant Compare At Price'] = compareAtPrice(child)
        variantRow['Variant Inventory Qty'] = inventoryQty(child)
        variantRow['Variant Inventory Policy'] = inventoryPolicy(child)

        if (childIndex === 0 && images[0]) {
          variantRow['Image Src'] = images[0]
          variantRow['Image Position'] = '1'
          variantRow['Image Alt Text'] = row['Image Alt Text'] || title
        }

        shopifyRows.push(variantRow)
        report.variantRows += 1
      })
    } else {
      report.simple += 1

      base['Variant SKU'] = row.Sku || ''
      base['Variant Price'] = variantPrice(row)
      base['Variant Compare At Price'] = compareAtPrice(row)
      base['Variant Inventory Qty'] = inventoryQty(row)
      base['Variant Inventory Policy'] = inventoryPolicy(row)

      if (images[0]) {
        base['Image Src'] = images[0]
        base['Image Position'] = '1'
        base['Image Alt Text'] = row['Image Alt Text'] || title
      }

      shopifyRows.push(base)
      report.variantRows += 1
    }

    images.slice(1).forEach((imageUrl, index) => {
      const imageRow = emptyRow()
      imageRow.Handle = handle
      imageRow['Image Src'] = imageUrl
      imageRow['Image Position'] = String(index + 2)
      imageRow['Image Alt Text'] = row['Image Alt Text'] || title
      shopifyRows.push(imageRow)
      report.imageOnlyRows += 1
    })
  })

  report.categories = [...report.categories].sort()
  return { shopifyRows, report }
}

function writeCollectionsFile(categories) {
  const lines = ['name,slug']
  const slugCounts = new Map()

  categories.forEach((name) => {
    const baseSlug = slugify(name)
    if (!baseSlug) return
    const count = slugCounts.get(baseSlug) || 0
    slugCounts.set(baseSlug, count + 1)
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`
    lines.push(`${csvEscape(name)},${slug}`)
  })

  fs.writeFileSync(path.join(OUTPUT_DIR, 'shopify-collections.csv'), `${lines.join('\n')}\n`)
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input niet gevonden: ${inputPath}`)
    process.exit(1)
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const records = parseRecords(inputPath)
  const { shopifyRows, report } = buildShopifyRows(records)

  const csvLines = [SHOPIFY_COLUMNS.join(','), ...shopifyRows.map(rowToCsv)]
  const outputCsv = path.join(OUTPUT_DIR, 'shopify-products.csv')
  fs.writeFileSync(outputCsv, `${csvLines.join('\n')}\n`)

  writeCollectionsFile(report.categories)

  const reportPath = path.join(OUTPUT_DIR, 'import-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log('Shopify import CSV gegenereerd')
  console.log(`Input:          ${inputPath}`)
  console.log(`Output:         ${outputCsv}`)
  console.log(`Collections:    ${path.join(OUTPUT_DIR, 'shopify-collections.csv')}`)
  console.log(`Report:         ${reportPath}`)
  console.log('')
  console.log(`Producten:      ${report.parents} (${report.simple} simpel, ${report.variable} met varianten)`)
  console.log(`CSV rijen:      ${shopifyRows.length} (${report.variantRows} varianten + ${report.imageOnlyRows} extra afbeeldingen)`)
  console.log(`Categorieën:    ${report.categories.length}`)
  console.log(`Zonder afbeelding: ${report.withoutImages.length}`)
  if (report.withoutImages.length) {
    report.withoutImages.slice(0, 5).forEach((item) => {
      console.log(`  - ${item.title} (${item.handle})`)
    })
  }
}

main()
