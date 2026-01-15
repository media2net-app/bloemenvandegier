'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Plus, Minus, ShoppingCart, Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { Product } from '@/lib/data/products'
import { getProductImage } from '@/lib/utils/getProductImage'
import { formatPrice } from '@/lib/utils/format'
import Price from '@/components/shared/Price'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useCartStore } from '@/lib/cart/store'
import { useCart } from '@/components/cart/CartProvider'
import { cn } from '@/lib/utils/cn'

interface ProductQuickViewProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export default function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const addItem = useCartStore((state) => state.addItem)
  const { openCart } = useCart()

  const images = product.images || []
  const currentImage = images[currentImageIndex] || images[0]
  const hasMultipleImages = images.length > 1
  const isInStock = product.stock_status === 'instock'
  const isOnSale = product.on_sale || (product.regular_price && parseFloat(product.regular_price) > parseFloat(product.price))

  // Reset quantity and image when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setCurrentImageIndex(0)
    }
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: getProductImage(product.images),
      quantity: quantity,
      permalink: product.permalink,
    })
    openCart()
    onClose()
  }

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[80] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Snel bekijken</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Sluiten"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              {/* Image Gallery */}
              <div className="relative">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {currentImage && (
                    <Image
                      src={getProductImage([{ src: currentImage.src, alt: currentImage.alt || product.name }])}
                      alt={currentImage.alt || product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                  
                  {/* Image Navigation */}
                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={handlePreviousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                        aria-label="Vorige afbeelding"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                        aria-label="Volgende afbeelding"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-700" />
                      </button>
                      
                      {/* Image Indicators */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={cn(
                              "w-2 h-2 rounded-full transition-all",
                              index === currentImageIndex
                                ? "bg-white w-6"
                                : "bg-white/50 hover:bg-white/75"
                            )}
                            aria-label={`Afbeelding ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {isOnSale && (
                      <Badge variant="error">Aanbieding</Badge>
                    )}
                    {!isInStock && (
                      <Badge variant="warning" className="bg-white">Uitverkocht</Badge>
                    )}
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {hasMultipleImages && images.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          "relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all",
                          index === currentImageIndex
                            ? "border-primary-500"
                            : "border-gray-200 hover:border-primary-300"
                        )}
                      >
                        <Image
                          src={getProductImage([{ src: img.src, alt: img.alt || `${product.name} ${index + 1}` }])}
                          alt={img.alt || `${product.name} ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col">
                <div className="flex-1">
                  <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  {product.average_rating && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-5 w-5',
                              i < Math.floor(parseFloat(product.average_rating || '0'))
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.average_rating} {product.rating_count && `(${product.rating_count} reviews)`}
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-6">
                    <Price 
                      price={product.price} 
                      regularPrice={product.regular_price}
                      size="lg"
                    />
                  </div>

                  {/* Stock Status */}
                  <div className="mb-6">
                    {isInStock ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="font-medium">
                          {product.stock_quantity !== null && product.stock_quantity !== undefined
                            ? `${product.stock_quantity} op voorraad`
                            : 'Op voorraad'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="font-medium">Niet op voorraad</span>
                      </div>
                    )}
                  </div>

                  {/* Short Description */}
                  {product.short_description && (
                    <div 
                      className="text-gray-700 mb-6 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: product.short_description }}
                    />
                  )}

                  {/* Quantity Selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aantal
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="p-2 border-2 border-gray-300 rounded-lg hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-lg font-bold text-gray-900 w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 border-2 border-gray-300 rounded-lg hover:border-primary-500 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!isInStock}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {isInStock ? 'Toevoegen aan winkelwagen' : 'Niet op voorraad'}
                  </Button>
                  
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      Bekijk volledige details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
