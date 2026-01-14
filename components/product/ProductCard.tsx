'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import Price from '@/components/shared/Price'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils/format'
import { getProductImage } from '@/lib/utils/getProductImage'
import { cn } from '@/lib/utils/cn'
import { useCart } from '@/components/cart/CartProvider'
import { useCartStore } from '@/lib/cart/store'

type ProductLabel = 'meest-verkocht' | 'nieuw' | 'dagtopper' | null

interface ProductCardProps {
  id: number
  name: string
  slug: string
  price: string
  regularPrice?: string
  image: string
  images?: Array<{ src: string; alt?: string }>
  onSale?: boolean
  stockStatus?: string
  averageRating?: string
  ratingCount?: number
  label?: ProductLabel
}

export default function ProductCard({
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
}: ProductCardProps) {
  const { openCart } = useCart()
  const addItem = useCartStore((state) => state.addItem)
  
  // Prepare images array - use provided images or fallback to single image
  const productImages = images && images.length > 0 
    ? images.map(img => ({ src: img.src, alt: img.alt || name }))
    : [{ src: image, alt: name }]
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const currentImage = productImages[currentImageIndex] || productImages[0]
  const hasMultipleImages = productImages.length > 1
  
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
      <Link href={`/product/${slug}`} className="block" prefetch>
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
                {productImages.map((_, index) => (
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
          <button
            className="absolute top-2 left-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
            aria-label="Toevoegen aan favorieten"
          >
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/product/${slug}`} prefetch>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {name}
          </h3>
        </Link>

        {(averageRating || ratingCount) && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => {
                const rating = averageRating ? parseFloat(averageRating) : 0
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
              {averageRating && parseFloat(averageRating) > 0 && (
                <span className="font-semibold text-gray-900">{averageRating}</span>
              )}
              {ratingCount && ratingCount > 0 && (
                <span>({ratingCount})</span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <Price price={price} regularPrice={regularPrice} />
          {stockStatus === 'instock' && (
            <Badge variant="success" className="text-xs">
              Op voorraad
            </Badge>
          )}
        </div>

        <Button
          className="w-full"
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            addItem({
              id,
              name,
              price: parseFloat(price),
              quantity: 1,
              image,
              permalink: `/product/${slug}`,
            })
            openCart()
          }}
        >
          In bloemenmand
        </Button>
      </div>
    </Card>
  )
}
