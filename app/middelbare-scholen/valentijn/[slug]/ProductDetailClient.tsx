'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth/store'
import Link from 'next/link'
import Image from 'next/image'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import ProductGallery from '@/components/product/ProductGallery'
import ProductInfoValentijn from '@/components/product/ProductInfoValentijn'
import ProductReviews from '@/components/product/ProductReviews'
import ProductRecommendations from '@/components/product/ProductRecommendations'
import ProductBundles from '@/components/product/ProductBundles'
import ProductVideo from '@/components/product/ProductVideo'
import ProductQA from '@/components/product/ProductQA'
import StickyAddToCart from '@/components/product/StickyAddToCart'
import Button from '@/components/ui/Button'
import { Product } from '@/lib/data/products'
import { getRelatedProducts } from '@/lib/data/products'
import { LogOut, ShoppingCart, Heart } from 'lucide-react'
import { useCartStore } from '@/lib/cart/store'

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

export default function MiddelbareScholenProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter()
  const reviewsRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated, userType, logout } = useAuthStore()
  const { getItemCount } = useCartStore()
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

  useEffect(() => {
    // Redirect if not authenticated as middelbare school
    const timer = setTimeout(() => {
      if (!isAuthenticated || userType !== 'middelbare-school') {
        router.push('/middelbare-scholen/login')
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [isAuthenticated, userType, router])

  const handleLogout = () => {
    logout()
    router.push('/middelbare-scholen/login')
  }

  // Get related products (filter for valentijn products)
  const allRelated = getRelatedProducts(product, 10)
  const valentijnProductSlugs = [
    'onbewerkte-rode-roos-per-stuk-te-bestellen',
    'onbewerkte-rode-roos-142',
    'per-stuk-verpakte-rode-roos-245'
  ]
  const relatedProducts = allRelated.filter(p => valentijnProductSlugs.includes(p.slug)).slice(0, 4)

  // Build breadcrumbs
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Valentijn Assortiment', href: '/middelbare-scholen/valentijn' },
    { label: product.name, href: '#' },
  ]

  if (!isAuthenticated || userType !== 'middelbare-school') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-red-50">
      {/* Valentijn Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/middelbare-scholen/valentijn" className="flex items-center">
                <Image
                  src="/images/logo.svg"
                  alt="Bloemen van De Gier"
                  width={200}
                  height={50}
                  className="h-10 w-auto brightness-0 invert"
                />
              </Link>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold">Valentijn Assortiment</h1>
                <p className="text-sm text-red-100">{user?.schoolName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/afrekenen" className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-white text-white hover:bg-white hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Product Header & Info */}
      <section className="bg-red-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbItems} />

          {/* Product section - Gallery sticky until reviews */}
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Product Gallery - Sticky until reviews section (40%) */}
              <div className="lg:col-span-2 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
                <ProductGallery
                  images={product.images}
                  productName={product.name}
                />
              </div>

              {/* Product Info (60%) */}
              <div className="lg:col-span-3">
                <ProductInfoValentijn
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
        </div>
      </section>

      {/* Section 2: Reviews */}
      <section ref={reviewsRef} className="bg-red-100 py-16 scroll-mt-20">
        <div className="container mx-auto px-4">
          <ProductReviews
            reviews={mockReviews}
            averageRating={product.average_rating}
            ratingCount={product.rating_count}
          />
        </div>
      </section>

      {/* Section 3: Product Bundles */}
      <section className="bg-red-50 py-16">
        <div className="container mx-auto px-4">
          <ProductBundles
            currentProduct={product}
            relatedProducts={relatedProducts}
          />
        </div>
      </section>

      {/* Section 4: Video & Verzorging */}
      <section className="bg-red-100 py-16">
        <div className="container mx-auto px-4">
          <ProductVideo productName={product.name} />
        </div>
      </section>

      {/* Section 5: Q&A */}
      <section className="bg-red-50 py-16">
        <div className="container mx-auto px-4">
          <ProductQA productId={product.id} productName={product.name} />
        </div>
      </section>

      {/* Section 6: Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-red-100 py-16">
          <div className="container mx-auto px-4">
            <ProductRecommendations
              products={relatedProducts}
              title="Andere Valentijn producten"
            />
          </div>
        </section>
      )}

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
