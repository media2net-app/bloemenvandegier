const fs = require('fs')
const path = require('path')
const https = require('https')

// URLs
const FLOWER_CHIMP_URL = 'https://www.flowerchimp.com/collections/valentines-day-flower-delivery'

// Data paths
const productsPath = path.join(__dirname, '../lib/data/products.json')
const categoriesPath = path.join(__dirname, '../lib/data/categories.json')
const productsByCategoryPath = path.join(__dirname, '../lib/data/products-by-category.json')

// Load data
let products = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
let categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'))
let productsByCategory = JSON.parse(fs.readFileSync(productsByCategoryPath, 'utf8'))

// Find or create Valentijnsdag category
let valentijnsdagCategory = categories.find(c => c.name.toLowerCase().includes('valentijnsdag') || c.slug === 'valentijnsdag')
if (!valentijnsdagCategory) {
  // Create new category
  const maxId = Math.max(...categories.map(c => c.id))
  valentijnsdagCategory = {
    id: maxId + 1,
    name: 'Valentijnsdag',
    slug: 'valentijnsdag',
    productCount: 0
  }
  categories.push(valentijnsdagCategory)
  console.log(`Nieuwe categorie aangemaakt: ${valentijnsdagCategory.name} (ID: ${valentijnsdagCategory.id})`)
}

// Remove all existing Valentijnsdag products
console.log(`\nVerwijderen van bestaande Valentijnsdag producten...`)
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
products = products.filter(p => !productIdsToRemove.includes(p.id))

// Remove from productsByCategory
if (productsByCategory[valentijnsdagCategory.name]) {
  delete productsByCategory[valentijnsdagCategory.name]
}
console.log(`✓ Bestaande Valentijnsdag producten verwijderd\n`)

// Function to fetch HTML
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
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
    
    req.setTimeout(30000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

// Function to extract products from HTML
function extractProducts(html) {
  const products = []
  
  // Shopify stores often have product data in JSON-LD or JavaScript variables
  // Try to find product JSON data
  let productData = null
  
  // Method 1: Look for JSON-LD structured data
  const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  let jsonMatch
  while ((jsonMatch = jsonLdRegex.exec(html)) !== null) {
    try {
      const jsonData = JSON.parse(jsonMatch[1])
      if (jsonData['@type'] === 'ItemList' || Array.isArray(jsonData)) {
        const itemList = Array.isArray(jsonData) ? jsonData : (jsonData.itemListElement || [])
        for (const item of itemList) {
          if (item.item || item) {
            const product = item.item || item
            if (product.name && product.image) {
              const imageSrc = Array.isArray(product.image) ? product.image[0] : product.image
              const price = product.offers?.price || product.price || '29.99'
              
              products.push({
                name: product.name,
                slug: (product.url || product['@id'] || '').split('/').pop() || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                imageSrc: imageSrc.startsWith('http') ? imageSrc : `https:${imageSrc}`,
                price: price.toString()
              })
            }
          }
        }
      }
    } catch (e) {
      // Not valid JSON, continue
    }
  }
  
  // Method 2: Extract product URLs and their associated images
  const productUrls = new Set()
  const productLinkRegex = /href="(\/products\/[^"]+)"[^>]*/gi
  let match
  while ((match = productLinkRegex.exec(html)) !== null) {
    productUrls.add(match[1])
  }
  
  console.log(`  ${productUrls.size} product URLs gevonden`)
  
  // For each product URL, find the product card/container and extract data
  for (const productUrl of productUrls) {
    if (products.find(p => p.slug === productUrl.split('/').pop())) continue // Already added
    
    const urlSlug = productUrl.split('/').pop()
    const escapedUrl = productUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    
    // Find product container (look for parent div/li with product class)
    const productContainerRegex = new RegExp(`(?:<div|<li)[^>]*class="[^"]*product[^"]*"[^>]*>.*?${escapedUrl}.*?</(?:div|li)>`, 'i')
    const containerMatch = html.match(productContainerRegex)
    
    if (containerMatch) {
      const containerHtml = containerMatch[0]
      
      // Extract image
      const imgRegex = /<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]+)")?[^>]*>/i
      const imgMatch = containerHtml.match(imgRegex)
      
      if (imgMatch) {
        let imageSrc = imgMatch[1]
        const alt = imgMatch[2] || ''
        
        // Convert to absolute URL
        if (imageSrc.startsWith('//')) imageSrc = `https:${imageSrc}`
        else if (imageSrc.startsWith('/')) imageSrc = `https://www.flowerchimp.com${imageSrc}`
        else if (!imageSrc.startsWith('http')) imageSrc = `https://www.flowerchimp.com/${imageSrc}`
        
        // Extract product name - try multiple patterns
        let productName = null
        
        // Pattern 1: Product title in class
        const titleMatch1 = containerHtml.match(/<[^>]*class="[^"]*product[^"]*title[^"]*"[^>]*>([^<]+)<\/[^>]*>/i)
        if (titleMatch1) productName = titleMatch1[1].trim()
        
        // Pattern 2: Heading tags
        if (!productName) {
          const titleMatch2 = containerHtml.match(/<h[234][^>]*>([^<]+)<\/h[234]>/i)
          if (titleMatch2) productName = titleMatch2[1].trim()
        }
        
        // Pattern 3: Alt text
        if (!productName && alt) {
          productName = alt.trim()
        }
        
        // Pattern 4: Title attribute
        if (!productName) {
          const titleMatch3 = containerHtml.match(/title="([^"]+)"/i)
          if (titleMatch3) productName = titleMatch3[1].trim()
        }
        
        // Pattern 5: Clean URL slug as fallback
        if (!productName) {
          productName = urlSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }
        
        // Clean product name - remove HTML entities and clean up
        productName = productName
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/flowers_[a-z_]+/gi, '') // Remove flower type prefixes
          .replace(/\s+/g, ' ')
          .trim()
        
        // If name still contains weird patterns, try to extract meaningful part
        if (productName.includes('_') || productName.match(/^[a-z_]+$/i)) {
          // Try to find better name from surrounding context
          const contextBefore = html.substring(html.indexOf(containerHtml) - 200, html.indexOf(containerHtml))
          const contextAfter = html.substring(html.indexOf(containerHtml) + containerHtml.length, html.indexOf(containerHtml) + containerHtml.length + 200)
          const fullContext = contextBefore + containerHtml + contextAfter
          
          const betterNameMatch = fullContext.match(/<h[23][^>]*class="[^"]*"[^>]*>([^<]+)<\/h[23]>/i) ||
                                 fullContext.match(/<p[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/p>/i)
          if (betterNameMatch) {
            productName = betterNameMatch[1].trim()
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .trim()
          }
        }
        
        // Final fallback: clean slug
        if (!productName || productName.length < 3) {
          productName = urlSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }
        
        // Extract price
        const priceRegex = /(?:RM|€|EUR|MYR)\s*(\d+(?:\.\d+)?)/i
        const priceMatch = containerHtml.match(priceRegex)
        const price = priceMatch ? priceMatch[1] : '29.99'
        
        if (imageSrc && !imageSrc.includes('placeholder') && !imageSrc.includes('data:image') && 
            !imageSrc.includes('logo') && !imageSrc.includes('icon')) {
          products.push({
            name: productName,
            slug: urlSlug.toLowerCase(),
            imageSrc: imageSrc,
            price: price
          })
        }
      }
    }
  }
  
  // Remove duplicates based on slug
  const uniqueProducts = []
  const seenSlugs = new Set()
  for (const product of products) {
    if (!seenSlugs.has(product.slug)) {
      seenSlugs.add(product.slug)
      uniqueProducts.push(product)
    }
  }
  
  return uniqueProducts
}

// Main function
async function main() {
  console.log('Start scrapen van Flower Chimp Valentijnsdag producten...\n')
  console.log(`URL: ${FLOWER_CHIMP_URL}\n`)
  
  try {
    // Fetch the collection page
    console.log('Ophalen van pagina...')
    const html = await fetchHTML(FLOWER_CHIMP_URL)
    console.log(`✓ Pagina opgehaald (${html.length} bytes)\n`)
    
    // Extract products
    console.log('Extraheren van producten...')
    const scrapedProducts = extractProducts(html)
    console.log(`✓ ${scrapedProducts.length} producten gevonden met afbeeldingen\n`)
    
    if (scrapedProducts.length === 0) {
      console.log('Geen producten gevonden. Mogelijk is de HTML structuur anders.')
      console.log('Laat me proberen met een andere methode...\n')
      
      // Alternative: Try to find all images in product cards
      const imgRegex = /<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]+)")?[^>]*>/gi
      const allImages = []
      let imgMatch
      while ((imgMatch = imgRegex.exec(html)) !== null) {
        const src = imgMatch[1]
        const alt = imgMatch[2] || ''
        if (src && !src.includes('placeholder') && !src.includes('data:image') && 
            (src.includes('product') || src.includes('flower') || alt.toLowerCase().includes('bouquet') || alt.toLowerCase().includes('rose'))) {
          allImages.push({ src, alt })
        }
      }
      
      console.log(`  ${allImages.length} relevante afbeeldingen gevonden`)
      
      // Try to match images with product names nearby
      for (const img of allImages.slice(0, 30)) { // Limit to 30 products
        const imgHtml = img.src
        const escapedImg = imgHtml.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const contextRegex = new RegExp(`.{0,500}<img[^>]+src="${escapedImg}"[^>]*>.{0,500}`, 'i')
        const contextMatch = html.match(contextRegex)
        
        if (contextMatch) {
          const context = contextMatch[0]
          const nameMatch = context.match(/<[^>]*class="[^"]*product[^"]*title[^"]*"[^>]*>([^<]+)<\/[^>]*>/i) ||
                           context.match(/<h[23][^>]*>([^<]+)<\/h[23]>/i) ||
                           context.match(/alt="([^"]+)"/i)
          const productName = nameMatch ? nameMatch[1].trim() : img.alt || 'Valentijnsdag Boeket'
          
          const absoluteImageSrc = img.src.startsWith('http') ? img.src : 
            img.src.startsWith('//') ? `https:${img.src}` :
            img.src.startsWith('/') ? `https://www.flowerchimp.com${img.src}` :
            `https://www.flowerchimp.com/${img.src}`
          
          scrapedProducts.push({
            name: productName,
            slug: productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            imageSrc: absoluteImageSrc,
            price: '29.99'
          })
        }
      }
      
      console.log(`✓ ${scrapedProducts.length} producten geëxtraheerd\n`)
    }
    
    // Create new products
    const newProducts = []
    const maxProductId = Math.max(...products.map(p => p.id))
    
    for (let i = 0; i < scrapedProducts.length; i++) {
      const scraped = scrapedProducts[i]
      const productId = maxProductId + i + 1
      
      const newProduct = {
        id: productId,
        name: scraped.name,
        slug: scraped.slug,
        sku: `FC-VD-${productId}`,
        permalink: `/product/${scraped.slug}`,
        price: scraped.price,
        regular_price: scraped.price,
        sale_price: '',
        on_sale: false,
        images: [
          {
            id: 1,
            src: scraped.imageSrc,
            alt: scraped.name,
            name: scraped.name
          }
        ],
        description: `Prachtig Valentijnsdag boeket: ${scraped.name}`,
        short_description: `Prachtig Valentijnsdag boeket`,
        stock_status: 'instock',
        stock_quantity: null,
        categories: [
          {
            id: valentijnsdagCategory.id,
            name: valentijnsdagCategory.name,
            slug: valentijnsdagCategory.slug
          }
        ],
        featured: i < 8, // First 8 are featured
        average_rating: (4.5 + Math.random() * 0.5).toFixed(1),
        rating_count: Math.floor(5 + Math.random() * 50)
      }
      
      newProducts.push(newProduct)
    }
    
    // Add new products to products array
    products.push(...newProducts)
    
    // Update productsByCategory
    productsByCategory[valentijnsdagCategory.name] = newProducts
    
    // Update category productCount
    valentijnsdagCategory.productCount = newProducts.length
    
    // Save all data
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8')
    fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2), 'utf8')
    fs.writeFileSync(productsByCategoryPath, JSON.stringify(productsByCategory, null, 2), 'utf8')
    
    console.log('============================================================')
    console.log('SCRAPING RAPPORTAGE')
    console.log('============================================================')
    console.log(`✓ Producten verwijderd:    ${productsToRemove.length}`)
    console.log(`✓ Nieuwe producten toegevoegd: ${newProducts.length}`)
    console.log(`✓ Totaal Valentijnsdag producten: ${valentijnsdagCategory.productCount}`)
    console.log('============================================================')
    console.log(`\n✓ Data opgeslagen in:`)
    console.log(`  - ${productsPath}`)
    console.log(`  - ${categoriesPath}`)
    console.log(`  - ${productsByCategoryPath}`)
    
  } catch (error) {
    console.error('Fout:', error.message)
    process.exit(1)
  }
}

// Run script
main().catch(console.error)
