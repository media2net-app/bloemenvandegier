'use client'

import { useRef, useState } from 'react'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import ProductGallery from '@/components/product/ProductGallery'
import ProductInfo from '@/components/product/ProductInfo'
import ProductReviews from '@/components/product/ProductReviews'
import ProductRecommendations from '@/components/product/ProductRecommendations'
import StickyAddToCart from '@/components/product/StickyAddToCart'
import { Product } from '@/lib/data/products'
import { getRelatedProducts } from '@/lib/data/products'

// Mock reviews - will be replaced with real reviews later
const mockReviews = [
  {
    id: 1,
    reviewer: 'Jan Jansen',
    rating: 5,
    review: 'Prachtige bloemen! Ze zijn al een week mooi en geuren heerlijk. Zeer tevreden!',
    date: '2024-01-10',
  },
  {
    id: 2,
    reviewer: 'Maria de Vries',
    rating: 4,
    review: 'Mooie bloemen, goede kwaliteit. Levering was snel en de bloemen waren goed verpakt.',
    date: '2024-01-08',
  },
  {
    id: 3,
    reviewer: 'Pieter Bakker',
    rating: 5,
    review: 'Geweldige bloemen! Mijn vriendin was er super blij mee. Zeker een aanrader!',
    date: '2024-01-05',
  },
]

interface ProductDetailClientProps {
  product: Product
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const reviewsRef = useRef<HTMLDivElement>(null)
  const [cartData, setCartData] = useState<{
    quantity: number
    price: string
    totalAddonPrice: number
    selectedVariant: { id: number; name: string; price: string; quantity: number } | null
    onAddToCart: () => void
  }>({
    quantity: 1,
    price: product.price,
    totalAddonPrice: 0,
    selectedVariant: null,
    onAddToCart: () => {},
  })

  // Get related products
  const relatedProducts = getRelatedProducts(product, 4)

  // Build breadcrumbs based on product categories
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
  ]
  
  if (product.categories && product.categories.length > 0) {
    const mainCategory = product.categories[0]
    // Map category names to routes
    const categoryRoutes: Record<string, string> = {
      'Rozen': '/rozen',
      'Boeketten': '/boeketten',
      'BloemenBundels': '/boeketten',
      'Emmer Bloemen': '/boeketten',
      'Groen & Decoratief': '/groen-decoratief',
    }
    
    const categoryRoute = categoryRoutes[mainCategory.name] || `/categorie/${mainCategory.slug}`
    breadcrumbItems.push({
      label: mainCategory.name,
      href: categoryRoute,
    })
  }
  
  breadcrumbItems.push({ label: product.name, href: '#' })

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Product section - Gallery sticky until reviews */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
            {/* Product Gallery - Sticky until reviews section (40%) */}
            <div className="lg:col-span-2 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
              <ProductGallery
                images={product.images}
                productName={product.name}
              />
            </div>

            {/* Product Info (60%) */}
            <div className="lg:col-span-3">
              <ProductInfo
                id={product.id}
                name={product.name}
                price={product.price}
                regularPrice={product.regular_price}
                description={product.description}
                shortDescription={product.short_description}
                stockStatus={product.stock_status}
                stockQuantity={product.stock_quantity}
                averageRating={product.average_rating}
                ratingCount={product.rating_count}
                sku={product.sku}
                permalink={product.permalink}
                slug={product.slug}
                image={product.images[0]?.src || ''}
                onAddToCartDataChange={setCartData}
              />
            </div>
          </div>
        </div>

        {/* Reviews - Stops sticky behavior */}
        <div ref={reviewsRef} className="scroll-mt-20">
          <ProductReviews
            reviews={mockReviews}
            averageRating={product.average_rating}
            ratingCount={product.rating_count}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <ProductRecommendations
            products={relatedProducts}
            title="Gerelateerde producten"
          />
        )}
      </div>

      {/* Sticky Add to Cart */}
      <StickyAddToCart
        productName={product.name}
        price={cartData.price}
        regularPrice={product.regular_price}
        stockStatus={product.stock_status}
        quantity={cartData.quantity}
        totalAddonPrice={cartData.totalAddonPrice}
        onAddToCart={cartData.onAddToCart}
      />
    </div>
  )
}
