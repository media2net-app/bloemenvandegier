import productsData from './products.json'
import categoriesData from './categories.json'
import productsByCategoryData from './products-by-category.json'

export interface Product {
  id: number
  name: string
  slug: string
  sku: string
  permalink: string
  price: string
  regular_price: string
  sale_price: string
  on_sale: boolean
  images: Array<{
    id: number
    src: string
    alt: string
    name: string
  }>
  description: string
  short_description: string
  stock_status: 'instock' | 'outofstock'
  stock_quantity: number | null
  categories: Array<{
    id: number
    name: string
    slug: string
  }>
  featured: boolean
  average_rating: string
  rating_count: number
}

export interface Category {
  id: number
  name: string
  slug: string
  productCount: number
}

const products = productsData as Product[]
const categories = categoriesData as Category[]
const productsByCategory = productsByCategoryData as Record<string, Product[]>

// Get all products
export function getAllProducts(): Product[] {
  return products
}

// Get product by ID
export function getProductById(id: number): Product | undefined {
  return products.find(p => p.id === id)
}

// Get product by slug
export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug)
}

// Helper function to check if product has valid images
function hasValidImage(product: Product): boolean {
  return !!(
    product.images && 
    product.images.length > 0 && 
    product.images[0].src && 
    product.images[0].src.trim() !== '' &&
    !product.images[0].src.includes('placeholder') &&
    !product.images[0].src.includes('data:image')
  )
}

// Get products by category (only with valid images)
export function getProductsByCategory(categoryName: string): Product[] {
  const categoryProducts = productsByCategory[categoryName] || []
  return categoryProducts.filter(p => hasValidImage(p))
}

// Get products by category slug
export function getProductsByCategorySlug(categorySlug: string): Product[] {
  const category = categories.find(c => c.slug === categorySlug)
  if (!category) return []
  return getProductsByCategory(category.name)
}

// Get featured products (only with valid images)
export function getFeaturedProducts(limit: number = 8): Product[] {
  return products
    .filter(p => hasValidImage(p))
    .filter(p => p.featured || p.average_rating)
    .slice(0, limit)
}

// Get products by search term (only with valid images)
export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase()
  return products
    .filter(p => hasValidImage(p))
    .filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.short_description.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    )
}

// Get all categories
export function getAllCategories(): Category[] {
  return categories.sort((a, b) => b.productCount - a.productCount)
}

// Get category by slug
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug)
}

// Get related products (same category, different product, only with valid images)
export function getRelatedProducts(product: Product, limit: number = 4): Product[] {
  if (!product.categories || product.categories.length === 0) {
    return getFeaturedProducts(limit)
  }

  const categoryName = product.categories[0].name
  const categoryProducts = getProductsByCategory(categoryName)
  
  return categoryProducts
    .filter(p => p.id !== product.id)
    .filter(p => hasValidImage(p))
    .slice(0, limit)
}

// Get product variants (same product with different quantities, only with valid images)
export function getProductVariants(product: Product | { id: number; name: string; slug: string }): Product[] {
  // Extract base product name (remove quantity info)
  const baseName = product.name
    .replace(/\d+\s*(rozen|roos|stuks|stelen)/gi, '')
    .replace(/\|\s*\d+.*$/i, '')
    .replace(/\s*-\s*\d+.*$/i, '')
    .replace(/\s*–\s*\d+.*$/i, '')
    .trim()
  
  // Find all products with similar base name
  const variants = products
    .filter(p => hasValidImage(p))
    .filter(p => {
      if (p.id === product.id) return true
      
      const pBaseName = p.name
        .replace(/\d+\s*(rozen|roos|stuks|stelen)/gi, '')
        .replace(/\|\s*\d+.*$/i, '')
        .replace(/\s*-\s*\d+.*$/i, '')
        .replace(/\s*–\s*\d+.*$/i, '')
        .trim()
      
      return pBaseName === baseName
    })
  
  // Sort by quantity (extract number from name)
  return variants.sort((a, b) => {
    const aNum = parseInt(a.name.match(/(\d+)/)?.[1] || '0')
    const bNum = parseInt(b.name.match(/(\d+)/)?.[1] || '0')
    return aNum - bNum
  })
}

export { products, categories, productsByCategory }
