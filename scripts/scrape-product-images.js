const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

// Base URL van de live website
const BASE_URL = 'https://www.bloemenvandegier.nl'

// Lees producten data
const productsPath = path.join(__dirname, '../lib/data/products.json')
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'))

// Lees lijst van producten zonder afbeeldingen
const missingImagesPath = path.join(__dirname, '../producten-zonder-afbeeldingen.txt')
const missingImagesContent = fs.readFileSync(missingImagesPath, 'utf8')

// Parse product IDs zonder afbeeldingen
const missingIds = []
const lines = missingImagesContent.split('\n')
for (const line of lines) {
  const match = line.match(/ID: (\d+)/)
  if (match) {
    missingIds.push(parseInt(match[1]))
  }
}

console.log(`Gevonden ${missingIds.length} producten zonder afbeeldingen`)

// Functie om HTML op te halen
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    
    const req = protocol.get(url, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data)
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${url}`))
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

// Functie om afbeeldingen uit HTML te extraheren
function extractImages(html, productName) {
  const images = []
  
  // Zoek naar WooCommerce product images
  // Patroon 1: <img src="..." class="wp-post-image" of "attachment-woocommerce_single"
  const imgRegex = /<img[^>]+(?:class="[^"]*(?:wp-post-image|attachment-woocommerce_single|woocommerce-product-gallery__image)[^"]*")[^>]+src="([^"]+)"/gi
  let match
  
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1]
    if (src && !src.includes('placeholder') && !src.includes('data:image')) {
      // Converteer relative URLs naar absolute
      const absoluteUrl = src.startsWith('http') ? src : `${BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`
      images.push({
        id: images.length + 1,
        src: absoluteUrl,
        alt: productName,
        name: productName
      })
    }
  }
  
  // Patroon 2: Zoek in data-product-image attributen
  const dataImageRegex = /data-product-image="([^"]+)"/gi
  while ((match = dataImageRegex.exec(html)) !== null) {
    const src = match[1]
    if (src && !src.includes('placeholder') && !src.includes('data:image')) {
      const absoluteUrl = src.startsWith('http') ? src : `${BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`
      // Voeg alleen toe als niet al aanwezig
      if (!images.some(img => img.src === absoluteUrl)) {
        images.push({
          id: images.length + 1,
          src: absoluteUrl,
          alt: productName,
          name: productName
        })
      }
    }
  }
  
  // Patroon 3: Zoek in WooCommerce gallery
  const galleryRegex = /<div[^>]+class="[^"]*woocommerce-product-gallery[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/gi
  while ((match = galleryRegex.exec(html)) !== null) {
    const src = match[1]
    if (src && !src.includes('placeholder') && !src.includes('data:image')) {
      const absoluteUrl = src.startsWith('http') ? src : `${BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`
      if (!images.some(img => img.src === absoluteUrl)) {
        images.push({
          id: images.length + 1,
          src: absoluteUrl,
          alt: productName,
          name: productName
        })
      }
    }
  }
  
  return images
}

// Functie om product afbeeldingen te scrapen
async function scrapeProductImages(productId) {
  const product = products.find(p => p.id === productId)
  if (!product) {
    console.log(`Product ${productId} niet gevonden in data`)
    return { success: false, reason: 'not_found' }
  }
  
  // Skip als product al afbeeldingen heeft
  if (product.images && product.images.length > 0 && product.images[0].src && product.images[0].src.trim() !== '') {
    return { success: false, reason: 'already_has_images', product }
  }
  
  const url = `${BASE_URL}${product.permalink}`
  console.log(`[${productId}] Scrapen: ${product.name}`)
  console.log(`  URL: ${url}`)
  
  try {
    const html = await fetchHTML(url)
    const images = extractImages(html, product.name)
    
    if (images.length > 0) {
      product.images = images
      console.log(`  ✓ ${images.length} afbeelding(en) gevonden`)
      return { success: true, product }
    } else {
      console.log(`  ✗ Geen afbeeldingen gevonden in HTML`)
      return { success: false, reason: 'no_images', product }
    }
  } catch (error) {
    if (error.message.includes('404')) {
      console.log(`  ✗ Product niet gevonden op live site (404)`)
      return { success: false, reason: '404', product }
    } else {
      console.log(`  ✗ Fout: ${error.message}`)
      return { success: false, reason: 'error', product, error: error.message }
    }
  }
}

// Hoofdfunctie
async function main() {
  console.log('Start scraping product afbeeldingen...\n')
  console.log(`Totaal te scrapen: ${missingIds.length} producten\n`)
  
  const updatedProducts = []
  const stats = {
    success: 0,
    notFound: 0,
    noImages: 0,
    alreadyHasImages: 0,
    errors: 0,
    notInData: 0
  }
  
  // Verwerk producten in batches om niet te veel requests tegelijk te doen
  const batchSize = 5
  for (let i = 0; i < missingIds.length; i += batchSize) {
    const batch = missingIds.slice(i, i + batchSize)
    
    const promises = batch.map(id => scrapeProductImages(id))
    const results = await Promise.all(promises)
    
    for (const result of results) {
      if (result.success) {
        updatedProducts.push(result.product)
        stats.success++
      } else {
        switch (result.reason) {
          case 'not_found':
            stats.notInData++
            break
          case '404':
            stats.notFound++
            break
          case 'no_images':
            stats.noImages++
            break
          case 'already_has_images':
            stats.alreadyHasImages++
            break
          default:
            stats.errors++
        }
      }
    }
    
    // Wacht even tussen batches om de server niet te overbelasten
    if (i + batchSize < missingIds.length) {
      console.log(`\n--- Batch ${Math.floor(i / batchSize) + 1} voltooid, wachten 2 seconden... ---\n`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  // Update products array
  for (const updatedProduct of updatedProducts) {
    const index = products.findIndex(p => p.id === updatedProduct.id)
    if (index !== -1) {
      products[index] = updatedProduct
    }
  }
  
  // Schrijf bijgewerkte products terug naar JSON
  if (updatedProducts.length > 0) {
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8')
  }
  
  // Rapportage
  console.log(`\n${'='.repeat(60)}`)
  console.log('SCRAPING RAPPORTAGE')
  console.log(`${'='.repeat(60)}`)
  console.log(`✓ Succesvol gescraped:     ${stats.success}`)
  console.log(`✗ Niet gevonden (404):     ${stats.notFound}`)
  console.log(`✗ Geen afbeeldingen:       ${stats.noImages}`)
  console.log(`○ Al afbeeldingen:         ${stats.alreadyHasImages}`)
  console.log(`✗ Fouten:                  ${stats.errors}`)
  console.log(`✗ Niet in data:           ${stats.notInData}`)
  console.log(`${'='.repeat(60)}`)
  console.log(`Totaal verwerkt:          ${missingIds.length}`)
  
  if (updatedProducts.length > 0) {
    console.log(`\n✓ ${updatedProducts.length} producten bijgewerkt in ${productsPath}`)
  } else {
    console.log(`\nGeen producten bijgewerkt`)
  }
}

// Run script
main().catch(console.error)
