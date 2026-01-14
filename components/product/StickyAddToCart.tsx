'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
import Button from '@/components/ui/Button'
import Price from '@/components/shared/Price'
import { formatPrice } from '@/lib/utils/format'
import { useCart } from '@/components/cart/CartProvider'

interface StickyAddToCartProps {
  productName: string
  price: string
  regularPrice?: string
  stockStatus: string
  onAddToCart: () => void
  quantity?: number
  totalAddonPrice?: number
}

export default function StickyAddToCart({
  productName,
  price,
  regularPrice,
  stockStatus,
  onAddToCart,
  quantity = 1,
  totalAddonPrice = 0,
}: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { openCart } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky button after scrolling past initial viewport
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      setIsVisible(scrollY > windowHeight * 0.5)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  const isInStock = stockStatus === 'instock'
  const totalPrice = parseFloat(price) * quantity + totalAddonPrice

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Product info */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate mb-1">
              {productName}
            </div>
            <div className="text-lg font-bold text-primary-600">
              {formatPrice(totalPrice.toFixed(2))}
            </div>
          </div>

          {/* Add to cart button */}
          <Button
            size="lg"
            onClick={() => {
              onAddToCart()
              openCart()
            }}
            disabled={!isInStock}
            className="flex-shrink-0"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isInStock ? 'In bloemenmand' : 'Niet op voorraad'}
          </Button>
        </div>
      </div>
    </div>
  )
}
