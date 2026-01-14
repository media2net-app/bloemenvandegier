'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Star } from 'lucide-react'
import Card from '@/components/ui/Card'
import Price from '@/components/shared/Price'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils/format'
import { getProductImage } from '@/lib/utils/getProductImage'
import { cn } from '@/lib/utils/cn'
import { useCart } from '@/components/cart/CartProvider'
import { useCartStore } from '@/lib/cart/store'

interface ProductCardProps {
  id: number
  name: string
  slug: string
  price: string
  regularPrice?: string
  image: string
  onSale?: boolean
  stockStatus?: string
  averageRating?: string
  ratingCount?: number
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  regularPrice,
  image,
  onSale,
  stockStatus,
  averageRating,
  ratingCount,
}: ProductCardProps) {
  const { openCart } = useCart()
  const addItem = useCartStore((state) => state.addItem)
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/product/${slug}`} className="block" prefetch>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={getProductImage([{ src: image }])}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {onSale && (
            <Badge
              variant="error"
              className="absolute top-2 right-2"
            >
              Aanbieding
            </Badge>
          )}
          <button
            className="absolute top-2 left-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
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

        {averageRating && parseFloat(averageRating) > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3.5 w-3.5',
                    i < Math.floor(parseFloat(averageRating))
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {averageRating}
              {ratingCount && ratingCount > 0 && ` (${ratingCount})`}
            </span>
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
          In winkelwagen
        </Button>
      </div>
    </Card>
  )
}
