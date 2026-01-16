'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Star, ChevronLeft, ChevronRight, Eye, Scale } from 'lucide-react'
import Card from '@/components/ui/Card'
import Price from '@/components/shared/Price'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils/format'
import { getProductImage } from '@/lib/utils/getProductImage'
import { cn } from '@/lib/utils/cn'
import { useCart } from '@/components/cart/CartProvider'
import { useCartStore } from '@/lib/cart/store'
import { useWishlistStore } from '@/lib/wishlist/store'
import { useComparisonStore } from '@/lib/comparison/store'
import { Product } from '@/lib/data/products'

type ProductLabel = 'meest-verkocht' | 'nieuw' | 'dagtopper' | null

interface ProductCardProps {
  product?: Product // Full product object for quick view
  // Legacy props for backward compatibility
  id?: number
  name?: string
  slug?: string
  price?: string
  regularPrice?: string
  image?: string
  images?: Array<{ src: string; alt?: string }>
  onSale?: boolean
  stockStatus?: string
  averageRating?: string
  ratingCount?: number
  label?: ProductLabel
  onQuickView?: () => void
  basePath?: string // Custom base path for product links (e.g., '/middelbare-scholen/valentijn')
}

export default function ProductCard({
  product,
  id,
  name,
  slug,
  price,
  regularPrice,
  image,
  images,
  onSale,
  stockStatus,
  averageRating,
  ratingCount,
  label,
  onQuickView,
  basePath,
}: ProductCardProps) {
  const { openCart } = useCart()
  const addItem = useCartStore((state) => state.addItem)
  const { toggleItem, isInWishlist } = useWishlistStore()
  const { toggleProduct, isInComparison, getProductCount } = useComparisonStore()
  
  const isWishlisted = product ? isInWishlist(product.id) : false
  const isCompared = product ? isInComparison(product.id) : false
  const comparisonCount = getProductCount()

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product) {
      toggleItem(product)
    }
  }

  const handleComparisonToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product) {
      toggleProduct(product)
    }
  }
  
  // Use product object if provided, otherwise use individual props
  const productId = product?.id || id!
  const productName = product?.name || name!
  const productSlug = product?.slug || slug || ''
  const productPath = basePath ? `${basePath}/${productSlug}` : `/product/${productSlug}`
  const productPrice = product?.sale_price || product?.price || price || '0'
  const productRegularPrice = product?.regular_price || regularPrice
  const productImages = product?.images || images || []
  const productImage = productImages[0]?.src || image || ''
  const productOnSale = product?.on_sale || onSale || false
  const productStockStatus = product?.stock_status || stockStatus
  const productAverageRating = product?.average_rating || averageRating
  const productRatingCount = product?.rating_count || ratingCount

  // Validate that we have required data
  if (!productSlug) {
    console.error('ProductCard: Missing slug for product', { product, id, name, slug })
    return null
  }
  
  // Prepare images array - use provided images or fallback to single image
  const cardImages = productImages.length > 0 
    ? productImages.map(img => ({ src: img.src, alt: img.alt || productName }))
    : [{ src: productImage, alt: productName }]
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const currentImage = cardImages[currentImageIndex] || cardImages[0]
  const hasMultipleImages = cardImages.length > 1

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onQuickView && product) {
      onQuickView()
    }
  }
  
  const handlePreviousImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))
  }
  
  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))
  }
  
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={productPath} className="block" prefetch>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={getProductImage([currentImage])}
            alt={currentImage.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Navigation arrows - only show if multiple images */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePreviousImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg z-20"
                aria-label="Vorige afbeelding"
              >
                <ChevronLeft className="h-4 w-4 text-gray-700" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg z-20"
                aria-label="Volgende afbeelding"
              >
                <ChevronRight className="h-4 w-4 text-gray-700" />
              </button>
              
              {/* Image indicator dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {cardImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setCurrentImageIndex(index)
                    }}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      index === currentImageIndex
                        ? 'w-6 bg-white'
                        : 'w-1.5 bg-white/50 hover:bg-white/75'
                    )}
                    aria-label={`Ga naar afbeelding ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          {/* Product Labels */}
          {label && (
            <span
              className={cn(
                "absolute top-2 right-2 z-10 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white shadow-md",
                label === 'meest-verkocht' && "bg-orange-500",
                label === 'nieuw' && "bg-blue-500",
                label === 'dagtopper' && "bg-purple-500"
              )}
            >
              {label === 'meest-verkocht' && 'Meest verkocht'}
              {label === 'nieuw' && 'Nieuw'}
              {label === 'dagtopper' && 'Dagtopper'}
            </span>
          )}
          {onSale && (
            <Badge
              variant="error"
              className={cn(
                "absolute top-2 z-10",
                label ? "right-2 top-12" : "right-2"
              )}
            >
              Aanbieding
            </Badge>
          )}
          {/* Quick View Button */}
          {onQuickView && product && (
            <button
              onClick={handleQuickView}
              className="absolute top-2 left-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
              aria-label="Snel bekijken"
            >
              <Eye className="h-4 w-4 text-gray-600" />
            </button>
          )}
          {/* Comparison Button */}
          {product && (
            <button
              onClick={handleComparisonToggle}
              className={cn(
                "absolute top-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10",
                onQuickView ? "left-12" : "left-2",
                isCompared && "opacity-100"
              )}
              aria-label={isCompared ? "Verwijderen uit vergelijking" : "Toevoegen aan vergelijking"}
              title={isCompared ? "Verwijderen uit vergelijking" : "Vergelijken"}
            >
              <Scale className={cn(
                "h-4 w-4 transition-colors",
                isCompared ? "text-primary-600" : "text-gray-600"
              )} />
            </button>
          )}
          {/* Wishlist Button */}
          {product && (
            <button
              onClick={handleWishlistToggle}
              className={cn(
                "absolute top-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10",
                onQuickView && product ? "left-12" : "left-2",
                !product && onQuickView ? "left-12" : "left-2",
                isWishlisted && "opacity-100"
              )}
              style={product && onQuickView ? { left: '3rem' } : undefined}
              aria-label={isWishlisted ? "Verwijderen uit favorieten" : "Toevoegen aan favorieten"}
            >
              <Heart className={cn(
                "h-4 w-4 transition-colors",
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              )} />
            </button>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={productPath} prefetch>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {productName}
          </h3>
        </Link>

        {(productAverageRating || productRatingCount) && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => {
                const rating = productAverageRating ? parseFloat(productAverageRating) : 0
                const filled = i < Math.floor(rating)
                const halfFilled = i < rating && i >= Math.floor(rating)
                return (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      filled
                        ? 'fill-yellow-400 text-yellow-400'
                        : halfFilled
                        ? 'fill-yellow-200 text-yellow-400'
                        : 'text-gray-300'
                    )}
                  />
                )
              })}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              {productAverageRating && parseFloat(productAverageRating) > 0 && (
                <span className="font-semibold text-gray-900">{productAverageRating}</span>
              )}
              {productRatingCount && productRatingCount > 0 && (
                <span>({productRatingCount})</span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <Price price={productPrice} regularPrice={productRegularPrice} />
          {productStockStatus === 'instock' && (
            <Badge variant="success" className="text-xs">
              Op voorraad
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {onQuickView && product && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleQuickView}
            >
              <Eye className="h-4 w-4 mr-1" />
              Snel bekijken
            </Button>
          )}
          <Button
            className={onQuickView && product ? "flex-1" : "w-full"}
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              addItem({
                id: productId,
                name: productName,
                price: parseFloat(productPrice),
                quantity: 1,
                image: productImage,
                permalink: `/product/${productSlug}`,
              })
              openCart()
            }}
          >
            In bloemenmand
          </Button>
        </div>
      </div>
    </Card>
  )
}
