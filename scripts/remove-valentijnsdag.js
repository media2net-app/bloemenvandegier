const fs = require('fs')
const path = require('path')

// Data paths
const productsPath = path.join(__dirname, '../lib/data/products.json')
const categoriesPath = path.join(__dirname, '../lib/data/categories.json')
const productsByCategoryPath = path.join(__dirname, '../lib/data/products-by-category.json')

// Load data
let products = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
let categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'))
let productsByCategory = JSON.parse(fs.readFileSync(productsByCategoryPath, 'utf8'))

// Find Valentijnsdag category
const valentijnsdagCategory = categories.find(c => 
  c.name.toLowerCase().includes('valentijnsdag') || 
  c.slug === 'valentijnsdag'
)

if (!valentijnsdagCategory) {
  console.log('Valentijnsdag categorie niet gevonden')
  process.exit(0)
}

console.log(`Verwijderen van Valentijnsdag categorie en producten...`)
console.log(`Categorie: ${valentijnsdagCategory.name} (ID: ${valentijnsdagCategory.id})`)

// Find all products with Valentijnsdag category
const productsToRemove = products.filter(p => 
  p.categories && p.categories.some(c => 
    c.name.toLowerCase().includes('valentijnsdag') || 
    c.slug === 'valentijnsdag' ||
    c.id === valentijnsdagCategory.id
  )
)

console.log(`  ${productsToRemove.length} producten gevonden om te verwijderen`)

// Remove products from main array
const productIdsToRemove = productsToRemove.map(p => p.id)
const initialCount = products.length
products = products.filter(p => !productIdsToRemove.includes(p.id))
const removedCount = initialCount - products.length

console.log(`  ✓ ${removedCount} producten verwijderd`)

// Remove category from categories array
categories = categories.filter(c => c.id !== valentijnsdagCategory.id)
console.log(`  ✓ Categorie verwijderd`)

// Remove from productsByCategory
if (productsByCategory[valentijnsdagCategory.name]) {
  delete productsByCategory[valentijnsdagCategory.name]
  console.log(`  ✓ Categorie verwijderd uit products-by-category.json`)
}

// Save updated data
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8')
fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2), 'utf8')
fs.writeFileSync(productsByCategoryPath, JSON.stringify(productsByCategory, null, 2), 'utf8')

console.log(`\n============================================================`)
console.log('VERWIJDERING RAPPORTAGE')
console.log(`============================================================`)
console.log(`✓ Producten verwijderd:    ${removedCount}`)
console.log(`✓ Categorie verwijderd:    ${valentijnsdagCategory.name}`)
console.log(`============================================================`)
console.log(`\n✓ Data opgeslagen in:`)
console.log(`  - ${productsPath}`)
console.log(`  - ${categoriesPath}`)
console.log(`  - ${productsByCategoryPath}`)
