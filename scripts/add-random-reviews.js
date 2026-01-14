const fs = require('fs')
const products = require('../lib/data/products.json')

// Generate random rating (between 4.0 and 5.0, weighted towards higher ratings)
function getRandomRating() {
  const rand = Math.random()
  if (rand < 0.1) return (4.0 + Math.random() * 0.3).toFixed(1) // 4.0-4.3 (10%)
  if (rand < 0.3) return (4.3 + Math.random() * 0.2).toFixed(1) // 4.3-4.5 (20%)
  if (rand < 0.6) return (4.5 + Math.random() * 0.3).toFixed(1) // 4.5-4.8 (30%)
  return (4.8 + Math.random() * 0.2).toFixed(1) // 4.8-5.0 (40%)
}

// Generate random review count (between 5 and 200, weighted towards lower counts)
function getRandomReviewCount() {
  const rand = Math.random()
  if (rand < 0.3) return Math.floor(5 + Math.random() * 20) // 5-25 (30%)
  if (rand < 0.6) return Math.floor(25 + Math.random() * 50) // 25-75 (30%)
  if (rand < 0.85) return Math.floor(75 + Math.random() * 75) // 75-150 (25%)
  return Math.floor(150 + Math.random() * 50) // 150-200 (15%)
}

// Update all products with random reviews
const updatedProducts = products.map(product => {
  // Only update if rating is 0 or empty
  if (!product.average_rating || product.average_rating === '0' || parseFloat(product.average_rating) === 0) {
    return {
      ...product,
      average_rating: getRandomRating(),
      rating_count: getRandomReviewCount()
    }
  }
  return product
})

// Save updated products
fs.writeFileSync(
  './lib/data/products.json',
  JSON.stringify(updatedProducts, null, 2),
  'utf-8'
)

console.log(`Updated ${updatedProducts.length} products with random reviews`)
console.log('Sample of updated products:')
updatedProducts.slice(0, 5).forEach(p => {
  console.log(`- ${p.name}: ${p.average_rating} (${p.rating_count} reviews)`)
})
