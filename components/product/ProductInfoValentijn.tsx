'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Star, Truck, Shield, Heart, Minus, Plus, Calendar, CheckCircle, Package } from 'lucide-react'
import Price from '@/components/shared/Price'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useCartStore } from '@/lib/cart/store'
import { useCart } from '@/components/cart/CartProvider'
import { formatPrice } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { cleanDescription as cleanDesc, getDescriptionPreview as getPreview } from '@/lib/utils/cleanDescription'

interface ProductInfoValentijnProps {
  id: number
  name: string
  price: string
  regularPrice?: string
  description: string
  shortDescription?: string
  stockStatus: string
  stockQuantity?: number | null
  averageRating?: string
  ratingCount?: number
  sku?: string
  permalink: string
  slug?: string
  image: string
  onAddToCartDataChange?: (data: {
    quantity: number
    price: string
    totalAddonPrice: number
    selectedVariant: { id: number; name: string; price: string; quantity: number } | null
    onAddToCart: () => void
  }) => void
}

// Staffelkorting voor valentijn rozen
const getBulkPrice = (quantity: number, basePrice: number): number => {
  if (quantity >= 51) {
    return basePrice * 0.85 // 15% korting vanaf 51 stuks
  } else if (quantity >= 11) {
    return basePrice * 0.92 // 8% korting vanaf 11 stuks
  }
  return basePrice // Geen korting onder 11 stuks
}

// Get Valentijnsdag date (February 14th of current year)
const getValentijnsdag = (): Date => {
  const now = new Date()
  const year = now.getFullYear()
  const valentijnsdag = new Date(year, 1, 14) // February is month 1 (0-indexed)
  
  // If Valentine's Day has passed this year, use next year
  if (valentijnsdag < now) {
    return new Date(year + 1, 1, 14)
  }
  
  return valentijnsdag
}

export default function ProductInfoValentijn({
  id,
  name,
  price,
  regularPrice,
  description,
  shortDescription,
  stockStatus,
  stockQuantity,
  averageRating,
  ratingCount,
  sku,
  permalink,
  slug,
  image,
  onAddToCartDataChange,
}: ProductInfoValentijnProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedDelivery, setSelectedDelivery] = useState<'valentijnsdag' | 'dag-ervoor' | 'afhalen' | null>(null)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const { openCart } = useCart()

  const basePrice = parseFloat(price)
  const bulkPrice = getBulkPrice(quantity, basePrice)
  const totalPrice = bulkPrice * quantity
  const savings = quantity >= 11 ? (basePrice * quantity) - totalPrice : 0

  const valentijnsdag = getValentijnsdag()
  const dagErvoor = new Date(valentijnsdag)
  dagErvoor.setDate(dagErvoor.getDate() - 1)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleAddToCart = useCallback(() => {
    if (stockStatus !== 'instock') return

    const deliveryOption = selectedDelivery || 'valentijnsdag' // Default to valentijnsdag

    addItem({
      id: id,
      name,
      price: bulkPrice,
      quantity,
      image,
      permalink,
    })

    openCart()
  }, [id, name, bulkPrice, quantity, image, permalink, slug, stockStatus, selectedDelivery, valentijnsdag, dagErvoor, addItem, openCart])

  useEffect(() => {
    if (onAddToCartDataChange) {
      onAddToCartDataChange({
        quantity,
        price: bulkPrice.toString(),
        totalAddonPrice: 0,
        selectedVariant: null,
        onAddToCart: handleAddToCart,
      })
    }
  }, [quantity, bulkPrice, handleAddToCart, onAddToCartDataChange])

  const descriptionText = cleanDesc(description)
  const descriptionPreview = getPreview(descriptionText)

  return (
    <div className="space-y-6">
      {/* Product Name */}
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">{name}</h1>
        {shortDescription && (
          <p className="text-lg text-gray-600">{shortDescription}</p>
        )}
      </div>

      {/* Rating */}
      {averageRating && parseFloat(averageRating) > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => {
              const rating = parseFloat(averageRating)
              const filled = i < Math.floor(rating)
              const halfFilled = i < rating && i >= Math.floor(rating)
              return (
                <Star
                  key={i}
                  className={cn(
                    'h-5 w-5',
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
          <span className="text-sm text-gray-600">
            {averageRating} ({ratingCount} {ratingCount === 1 ? 'beoordeling' : 'beoordelingen'})
          </span>
        </div>
      )}

      {/* Price with Staffelkorting */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(bulkPrice)}
          </span>
          {quantity >= 11 && (
            <span className="text-xl text-gray-500 line-through">
              {formatPrice(basePrice)}
            </span>
          )}
          <span className="text-sm text-gray-600">per stuk</span>
        </div>
        
        {quantity >= 11 && savings > 0 && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Je bespaart {formatPrice(savings)} met staffelkorting!
            </span>
          </div>
        )}

        {/* Staffelkorting tabel */}
        <Card className="p-4 bg-red-50 border-red-200">
          <h3 className="font-semibold text-gray-900 mb-3">Staffelkorting</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">1-10 stuks:</span>
              <span className="font-medium text-gray-900">{formatPrice(basePrice)} per stuk</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">11-50 stuks:</span>
              <span className="font-medium text-green-600">{formatPrice(basePrice * 0.92)} per stuk <span className="text-xs">(8% korting)</span></span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">51+ stuks:</span>
              <span className="font-medium text-green-600">{formatPrice(basePrice * 0.85)} per stuk <span className="text-xs">(15% korting)</span></span>
            </div>
          </div>
        </Card>
      </div>

      {/* Total Price */}
      <div className="p-4 bg-red-100 rounded-lg border-2 border-red-300">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">Totaal ({quantity} {quantity === 1 ? 'stuk' : 'stuks'}):</span>
          <span className="text-2xl font-bold text-red-600">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Aantal rozen:</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className={cn(
              'p-2 border-2 rounded-lg transition-colors',
              quantity <= 1
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-600'
            )}
          >
            <Minus className="h-5 w-5" />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1
              setQuantity(Math.max(1, Math.min(1000, value)))
            }}
            min="1"
            max="1000"
            className="w-20 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            onClick={() => setQuantity(Math.min(1000, quantity + 1))}
            disabled={quantity >= 1000}
            className={cn(
              'p-2 border-2 rounded-lg transition-colors',
              quantity >= 1000
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-600'
            )}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Delivery Options */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-bold text-gray-900">Bezorgoptie</h3>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => setSelectedDelivery('valentijnsdag')}
            className={cn(
              'w-full p-4 border-2 rounded-lg text-left transition-all',
              selectedDelivery === 'valentijnsdag'
                ? 'border-red-500 bg-red-50 shadow-md'
                : 'border-gray-300 hover:border-red-300'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900 mb-1">Valentijnsdag</div>
                <div className="text-sm text-gray-600">{formatDate(valentijnsdag)}</div>
              </div>
              {selectedDelivery === 'valentijnsdag' && (
                <CheckCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
          </button>

          <button
            onClick={() => setSelectedDelivery('dag-ervoor')}
            className={cn(
              'w-full p-4 border-2 rounded-lg text-left transition-all',
              selectedDelivery === 'dag-ervoor'
                ? 'border-red-500 bg-red-50 shadow-md'
                : 'border-gray-300 hover:border-red-300'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900 mb-1">Dag ervoor</div>
                <div className="text-sm text-gray-600">{formatDate(dagErvoor)}</div>
              </div>
              {selectedDelivery === 'dag-ervoor' && (
                <CheckCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
          </button>

          <button
            onClick={() => setSelectedDelivery('afhalen')}
            className={cn(
              'w-full p-4 border-2 rounded-lg text-left transition-all',
              selectedDelivery === 'afhalen'
                ? 'border-red-500 bg-red-50 shadow-md'
                : 'border-gray-300 hover:border-red-300'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Afhalen
                </div>
                <div className="text-sm text-gray-600">Haal je bestelling op bij ons</div>
              </div>
              {selectedDelivery === 'afhalen' && (
                <CheckCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
          </button>
        </div>
      </Card>

      {/* Stock Status */}
      <div>
        {stockStatus === 'instock' ? (
          stockQuantity !== null && stockQuantity !== undefined ? (
            <div className="space-y-2">
              {stockQuantity > 10 ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                  <CheckCircle className="h-4 w-4" />
                  <span>Ruime voorraad beschikbaar</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  <span>Nog {stockQuantity} {stockQuantity === 1 ? 'stuk' : 'stuks'} op voorraad</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium">Op voorraad</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border-2 border-red-200 rounded-lg p-3">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="font-medium">Niet op voorraad</span>
          </div>
        )}
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={stockStatus !== 'instock' || !selectedDelivery}
        className="w-full py-4 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white"
        size="lg"
      >
        {stockStatus !== 'instock' 
          ? 'Niet op voorraad'
          : !selectedDelivery
          ? 'Kies eerst een bezorgoptie'
          : `Toevoegen aan winkelwagen - ${formatPrice(totalPrice)}`
        }
      </Button>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <Truck className="h-6 w-6 text-red-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Snelle levering</p>
        </div>
        <div className="text-center">
          <Shield className="h-6 w-6 text-red-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600">7 dagen garantie</p>
        </div>
        <div className="text-center">
          <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Verse bloemen</p>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-900">Beschrijving</h3>
        <div className="text-gray-700 prose prose-sm max-w-none">
          {showFullDescription ? (
            <div dangerouslySetInnerHTML={{ __html: descriptionText }} />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: descriptionPreview }} />
          )}
        </div>
        {descriptionText.length > descriptionPreview.length && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            {showFullDescription ? 'Minder weergeven' : 'Meer weergeven'}
          </button>
        )}
      </div>
    </div>
  )
}
