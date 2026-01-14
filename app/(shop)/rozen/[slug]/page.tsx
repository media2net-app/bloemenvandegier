'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import ProductGallery from '@/components/product/ProductGallery'
import ProductInfo from '@/components/product/ProductInfo'
import ProductReviews from '@/components/product/ProductReviews'
import ProductRecommendations from '@/components/product/ProductRecommendations'
import { getProductBySlug, getRelatedProducts } from '@/lib/data/products'

// Mock reviews - will be replaced with real reviews later
const mockReviews = [
  {
    id: 1,
    reviewer: 'Jan Jansen',
    rating: 5,
    review: 'Prachtige rozen! Ze zijn al een week mooi en geuren heerlijk. Zeer tevreden!',
    date: '2024-01-10',
  },
  {
    id: 2,
    reviewer: 'Maria de Vries',
    rating: 4,
    review: 'Mooie rozen, goede kwaliteit. Levering was snel en de rozen waren goed verpakt.',
    date: '2024-01-08',
  },
  {
    id: 3,
    reviewer: 'Pieter Bakker',
    rating: 5,
    review: 'Geweldige rozen! Mijn vriendin was er super blij mee. Zeker een aanrader!',
    date: '2024-01-05',
  },
]


interface PageProps {
  params: Promise<{ slug: string }>
}

export default function ProductDetailPage({ params }: PageProps) {
  const { slug } = use(params)

  // Get product from data
  const product = getProductBySlug(slug)
  
  if (!product) {
    notFound()
  }

  // Get related products
  const relatedProducts = getRelatedProducts(product, 4)

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Rozen', href: '/rozen' },
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Gallery */}
          <div>
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div>
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
              image={product.images[0]?.src || ''}
            />
          </div>
        </div>

        {/* Reviews */}
        <ProductReviews
          reviews={mockReviews}
          averageRating={product.average_rating}
          ratingCount={product.rating_count}
        />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <ProductRecommendations
            products={relatedProducts}
            title="Gerelateerde producten"
          />
        )}
      </div>
    </div>
  )
}
