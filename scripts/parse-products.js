const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

// Read CSV file
const csvPath = path.join(__dirname, '..', 'wc-product-export-13-1-2026-1768330539821.csv')
const csvContent = fs.readFileSync(csvPath, 'utf-8')

// Parse CSV with proper handling of quoted fields and newlines
function parseCSV(csv) {
  try {
    const records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true,
      bom: true,
    })
    
    return records
  } catch (error) {
    console.error('Error parsing CSV:', error.message)
    return []
  }
}

// Transform WooCommerce product to our format
function transformProduct(wcProduct) {
  // Parse images (comma-separated URLs)
  const imageUrls = wcProduct.Afbeeldingen 
    ? wcProduct.Afbeeldingen.split(',').map(url => url.trim()).filter(Boolean)
    : []
  
  // Parse categories (comma-separated)
  const categories = wcProduct.Categorieën
    ? wcProduct.Categorieën.split(',').map(cat => cat.trim()).filter(Boolean)
    : []
  
  // Get slug from custom URI or generate from name
  let slug = wcProduct['Aangepaste URI'] || ''
  if (slug) {
    // Remove 'product/' prefix if present
    slug = slug.replace(/^product\//, '')
  } else {
    // Generate slug from name
    slug = wcProduct.Naam
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  
  // Determine price (sale price or regular price)
  const regularPrice = wcProduct['Reguliere prijs'] || wcProduct.Actieprijs || '0'
  const salePrice = wcProduct.Actieprijs && wcProduct.Actieprijs !== wcProduct['Reguliere prijs'] 
    ? wcProduct.Actieprijs 
    : ''
  const price = salePrice || regularPrice
  
  // Stock status
  const stockStatus = wcProduct['Op voorraad?'] === '1' ? 'instock' : 'outofstock'
  const stockQuantity = wcProduct.Voorraad ? parseInt(wcProduct.Voorraad) : null
  
  // Clean description - remove escape characters and normalize whitespace
  const cleanDescription = (text) => {
    if (!text) return ''
    return text
      .replace(/\\r\\n/g, ' ')
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\r\n/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  return {
    id: parseInt(wcProduct.ID),
    name: wcProduct.Naam,
    slug: slug,
    sku: wcProduct.SKU || '',
    permalink: `/product/${slug}`,
    price: price.replace(',', '.'),
    regular_price: regularPrice.replace(',', '.'),
    sale_price: salePrice.replace(',', '.'),
    on_sale: !!salePrice,
    images: imageUrls.map((url, index) => ({
      id: index + 1,
      src: url,
      alt: wcProduct.Naam + (index > 0 ? ` ${index + 1}` : ''),
      name: wcProduct.Naam,
    })),
    description: cleanDescription(wcProduct.Beschrijving),
    short_description: cleanDescription(wcProduct['Korte beschrijving']),
    stock_status: stockStatus,
    stock_quantity: stockQuantity,
    categories: categories.map((cat, index) => ({
      id: index + 1,
      name: cat,
      slug: cat.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    })),
    featured: wcProduct['Uitgelicht?'] === '1',
    average_rating: '0', // Not in export, will be 0
    rating_count: 0,
  }
}

// Parse and transform
console.log('Parsing CSV...')
const wcProducts = parseCSV(csvContent)
console.log(`Found ${wcProducts.length} published and visible products`)

console.log('Transforming products...')
const products = wcProducts.map(transformProduct)

// Group by category for easier access
const productsByCategory = {}
products.forEach(product => {
  product.categories.forEach(category => {
    if (!productsByCategory[category.name]) {
      productsByCategory[category.name] = []
    }
    productsByCategory[category.name].push(product)
  })
})

// Save to JSON
const outputPath = path.join(__dirname, '..', 'lib', 'data', 'products.json')
const categoriesPath = path.join(__dirname, '..', 'lib', 'data', 'categories.json')

// Ensure directory exists
const dataDir = path.dirname(outputPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf-8')
console.log(`Saved ${products.length} products to ${outputPath}`)

// Save categories
const categories = Object.keys(productsByCategory).map((name, index) => ({
  id: index + 1,
  name: name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  productCount: productsByCategory[name].length,
}))

fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2), 'utf-8')
console.log(`Saved ${categories.length} categories to ${categoriesPath}`)

// Save products by category
const byCategoryPath = path.join(__dirname, '..', 'lib', 'data', 'products-by-category.json')
fs.writeFileSync(byCategoryPath, JSON.stringify(productsByCategory, null, 2), 'utf-8')
console.log(`Saved products by category to ${byCategoryPath}`)

console.log('\nDone!')
console.log(`\nSummary:`)
console.log(`- Total products: ${products.length}`)
console.log(`- Total categories: ${categories.length}`)
console.log(`- Products with images: ${products.filter(p => p.images.length > 0).length}`)
console.log(`- Products in stock: ${products.filter(p => p.stock_status === 'instock').length}`)
