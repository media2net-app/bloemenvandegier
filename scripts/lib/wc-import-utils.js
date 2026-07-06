const fs = require('fs')
const { parse } = require('csv-parse/sync')

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

function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function getImages(row) {
  const urls = []
  const add = (url) => {
    if (!url) return
    String(url)
      .split('|')
      .map((part) => part.trim())
      .filter(isValidImageUrl)
      .forEach((part) => {
        if (!urls.includes(part)) urls.push(part)
      })
  }

  add(row['Image Featured'])
  add(row['Image URL'])
  add(row['Product Image Gallery'])

  return urls
}

function isValidImageUrl(url) {
  return typeof url === 'string' && /^https:\/\/.+/i.test(url)
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
  if (value === undefined || value === null || value === '') return null
  const normalized = String(value).replace(',', '.').trim()
  const number = Number(normalized)
  if (Number.isNaN(number)) return null
  return number.toFixed(2)
}

function inventoryPolicy(row) {
  return row['Stock Status'] === 'instock' ? 'CONTINUE' : 'DENY'
}

function compareAtPrice(row) {
  const sale = formatPrice(row['Sale Price'])
  const regular = formatPrice(row['Regular Price'])
  if (sale && regular && sale !== regular) return regular
  return null
}

function variantPrice(row) {
  return formatPrice(row.Price || row['Regular Price'] || row['Sale Price'])
}

function buildVariant(row, options, childIndex) {
  const childOptions = getChildOptionValues(row)
  const variant = {
    price: variantPrice(row),
    compareAtPrice: compareAtPrice(row),
    sku: row.Sku || undefined,
    inventoryPolicy: inventoryPolicy(row),
  }

  if (options.length) {
    variant.optionValues = options.map((option, index) => {
      const match = childOptions.find((value) => option.values.includes(value.value))
      return {
        optionName: option.name,
        name: match ? match.value : option.values[childIndex] || option.values[0],
      }
    })
  }

  const stock = row.Stock
  if (stock !== undefined && stock !== null && stock !== '') {
    const qty = parseInt(stock, 10)
    if (!Number.isNaN(qty)) variant.inventoryQuantity = qty
  }

  return variant
}

function buildProductFromRow(row, children, handle) {
  const images = getImages(row)
  const options = children.length ? inferOptions(children) : []
  const variants = children.length
    ? children.map((child, index) => buildVariant(child, options, index))
    : [buildVariant(row, [], 0)]

  return {
    wcId: row.ID,
    handle: handle || row.Slug || slugify(row.Title),
    title: row.Title,
    descriptionHtml: row.Content || '',
    vendor: 'Bloemen van De Gier',
    productType: getCategories(row)[0] || 'Bloemen',
    tags: getTags(row),
    status: isPublished(row) ? 'ACTIVE' : 'DRAFT',
    options,
    variants,
    images,
    isVariable: children.length > 0,
  }
}

function indexRecords(records) {
  const childrenByParent = new Map()
  const topLevelBySlug = new Map()

  records.forEach((row) => {
    const parentId = row['Parent Product ID']
    if (parentId && parentId !== '0') {
      if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, [])
      childrenByParent.get(parentId).push(row)
    }
  })

  records.forEach((row) => {
    if (!isTopLevel(row) || !isPublished(row)) return
    if (row.Slug) topLevelBySlug.set(row.Slug, row)
  })

  return { childrenByParent, topLevelBySlug }
}

function buildProducts(records, handleFilter) {
  const { childrenByParent, topLevelBySlug } = indexRecords(records)
  const products = []

  handleFilter.forEach((handle) => {
    const row = topLevelBySlug.get(handle)
    if (!row) return
    const children = (childrenByParent.get(row.ID) || []).filter(isPublished)
    products.push(buildProductFromRow(row, children, handle))
  })

  return products
}

function buildAllProducts(records) {
  const { childrenByParent, topLevelBySlug } = indexRecords(records)
  const products = []

  for (const [handle, row] of topLevelBySlug) {
    const children = (childrenByParent.get(row.ID) || []).filter(isPublished)
    products.push(buildProductFromRow(row, children, handle))
  }

  return products.sort((a, b) => a.handle.localeCompare(b.handle))
}

const TEST_HANDLES = {
  required: ['witte-tulpen', 'rode-tulpen', 'gemengde-tulpen', 'oranje-tulpen'],
  variable: ['nobilis-takken', 'steeneik-groen', 'mega-kerstboeket', 'pepperberries'],
  simple: [
    'buurtjes-emmer',
    'plukboeket-xl',
    'de-gier-boeket',
    'villa-vol-xxl',
    'bontgekleurde-emmer',
    'klassiek-wit-boeket',
    'grote-de-gier',
    'top-tulpen-boeket',
    '50-tulpen-verrassingskleur',
    'rozen-boeket-kort-50-stelen',
    'appelblad-salalblad',
    'verse-eucalyptus-cinerea-300-gram',
  ],
}

function getTestHandles(limit = 20) {
  const handles = []
  const add = (slug) => {
    if (!handles.includes(slug)) handles.push(slug)
  }

  TEST_HANDLES.required.forEach(add)
  TEST_HANDLES.variable.forEach(add)
  TEST_HANDLES.simple.forEach(add)

  return handles.slice(0, limit)
}

module.exports = {
  parseRecords,
  buildProducts,
  buildAllProducts,
  getTestHandles,
  buildProductFromRow,
  indexRecords,
  isPublished,
  isTopLevel,
  getCategories,
  slugify,
}
