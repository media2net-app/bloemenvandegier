const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

// Base URL van de live website
const BASE_URL = 'https://www.bloemenvandegier.nl'

// Lees producten data
const productsPath = path.join(__dirname, '../lib/data/products.json')
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'))

  // Vind alle producten zonder afbeeldingen (maar skip test/dummy producten)
const productsWithoutImages = products.filter(p => {
  // Skip test producten en producten zonder permalink
  if (!p.permalink || p.permalink.includes('test') || p.slug.includes('test')) {
    return false
  }
  
  return !p.images || 
         p.images.length === 0 || 
         !p.images[0].src || 
         p.images[0].src.trim() === '' ||
         p.images[0].src.includes('placeholder') ||
         p.images[0].src.includes('data:image')
})

console.log(`Gevonden ${productsWithoutImages.length} producten zonder afbeeldingen`)

// Functie om HTML op te halen
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    
    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
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
    
    req.setTimeout(15000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

// Functie om afbeeldingen uit HTML te extraheren
function extractImages(html, productName) {
  const images = []
  
  // Patroon 1: WooCommerce product images in gallery
  const galleryRegex = /<img[^>]+(?:class="[^"]*(?:wp-post-image|attachment-woocommerce_single|woocommerce-product-gallery__image|attachment-shop_single)[^"]*")[^>]+src="([^"]+)"/gi
  let match
  
  while ((match = galleryRegex.exec(html)) !== null) {
    const src = match[1]
    if (src && !src.includes('placeholder') && !src.includes('data:image') && !src.includes('1x1')) {
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
  
  // Patroon 2: data-product-image attributen
  const dataImageRegex = /data-product-image="([^"]+)"/gi
  while ((match = dataImageRegex.exec(html)) !== null) {
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
  
  // Patroon 3: WooCommerce product gallery data
  const galleryDataRegex = /data-large_image="([^"]+)"/gi
  while ((match = galleryDataRegex.exec(html)) !== null) {
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
  
  // Patroon 4: Direct img tags in product content
  const imgTagRegex = /<img[^>]+src="(https?:\/\/[^"]*\.(jpg|jpeg|png|webp|gif))"[^>]*>/gi
  while ((match = imgTagRegex.exec(html)) !== null) {
    const src = match[1]
    if (src && src.includes('bloemenvandegier.nl') && !src.includes('placeholder') && !src.includes('logo')) {
      if (!images.some(img => img.src === src)) {
        images.push({
          id: images.length + 1,
          src: src,
          alt: productName,
          name: productName
        })
      }
    }
  }
  
  // Sorteer en neem de eerste 5 afbeeldingen
  return images.slice(0, 5)
}

// Functie om product afbeeldingen te scrapen
async function scrapeProductImages(product) {
  const url = `${BASE_URL}${product.permalink}`
  console.log(`[${product.id}] Scrapen: ${product.name}`)
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
  console.log('Start scraping alle missende product afbeeldingen...\n')
  console.log(`Totaal te scrapen: ${productsWithoutImages.length} producten\n`)
  
  const updatedProducts = []
  const stats = {
    success: 0,
    notFound: 0,
    noImages: 0,
    errors: 0
  }
  
  // Verwerk producten in batches om niet te veel requests tegelijk te doen
  const batchSize = 3
  for (let i = 0; i < productsWithoutImages.length; i += batchSize) {
    const batch = productsWithoutImages.slice(i, i + batchSize)
    
    const promises = batch.map(product => scrapeProductImages(product))
    const results = await Promise.all(promises)
    
    for (const result of results) {
      if (result.success) {
        updatedProducts.push(result.product)
        stats.success++
      } else {
        switch (result.reason) {
          case '404':
            stats.notFound++
            break
          case 'no_images':
            stats.noImages++
            break
          default:
            stats.errors++
        }
      }
    }
    
    // Wacht even tussen batches om de server niet te overbelasten
    if (i + batchSize < productsWithoutImages.length) {
      const progress = ((i + batchSize) / productsWithoutImages.length * 100).toFixed(1)
      console.log(`\n--- Batch ${Math.floor(i / batchSize) + 1} voltooid (${progress}%), wachten 3 seconden... ---\n`)
      await new Promise(resolve => setTimeout(resolve, 3000))
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
    console.log(`\n✓ ${updatedProducts.length} producten bijgewerkt in ${productsPath}`)
  } else {
    console.log(`\nGeen producten bijgewerkt`)
  }
  
  // Rapportage
  console.log(`\n${'='.repeat(60)}`)
  console.log('SCRAPING RAPPORTAGE')
  console.log(`${'='.repeat(60)}`)
  console.log(`✓ Succesvol gescraped:     ${stats.success}`)
  console.log(`✗ Niet gevonden (404):     ${stats.notFound}`)
  console.log(`✗ Geen afbeeldingen:       ${stats.noImages}`)
  console.log(`✗ Fouten:                  ${stats.errors}`)
  console.log(`${'='.repeat(60)}`)
  console.log(`Totaal verwerkt:          ${productsWithoutImages.length}`)
}

// Run script
main().catch(console.error)
