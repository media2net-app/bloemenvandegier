'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Trash2, Scale } from 'lucide-react'
import { Product } from '@/lib/data/products'
import { getProductImage } from '@/lib/utils/getProductImage'
import Price from '@/components/shared/Price'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'
import { useCartStore } from '@/lib/cart/store'
import { useCart } from '@/components/cart/CartProvider'

interface ProductComparisonProps {
  products: Product[]
  onRemove: (productId: number) => void
  onClear: () => void
}

export default function ProductComparison({ products, onRemove, onClear }: ProductComparisonProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { openCart } = useCart()

  if (products.length === 0) {
    return null
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: getProductImage(product.images),
      quantity: 1,
      permalink: product.permalink,
    })
    openCart()
  }

  // Get all unique attributes to compare
  const getComparisonAttributes = () => {
    return [
      { label: 'Prijs', key: 'price' },
      { label: 'Voorraad', key: 'stock' },
      { label: 'Beoordeling', key: 'rating' },
      { label: 'Aantal reviews', key: 'reviews' },
    ]
  }

  const getAttributeValue = (product: Product, key: string) => {
    switch (key) {
      case 'price':
        return `€${parseFloat(product.price).toFixed(2)}`
      case 'stock':
        return product.stock_status === 'instock' 
          ? (product.stock_quantity !== null ? `${product.stock_quantity} op voorraad` : 'Op voorraad')
          : 'Uitverkocht'
      case 'rating':
        return product.average_rating || '0'
      case 'reviews':
        return product.rating_count || 0
      default:
        return '-'
    }
  }

  return (
    <div className="border-t border-gray-200 pt-12 mt-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Scale className="h-6 w-6 text-primary-600" />
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
            Product Vergelijking
          </h2>
          <Badge variant="default" className="ml-2">
            {products.length} {products.length === 1 ? 'product' : 'producten'}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Wis vergelijking
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${products.length + 1}, minmax(250px, 1fr))` }}>
            {/* Header row */}
            <div className="font-bold text-gray-900 p-4 border-b-2 border-gray-200">
              Eigenschap
            </div>
            {products.map((product) => (
              <div key={product.id} className="p-4 border-b-2 border-gray-200">
                <button
                  onClick={() => onRemove(product.id)}
                  className="float-right p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Verwijderen"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
                <div className="space-y-3">
                  <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden mb-2">
                    <Image
                      src={getProductImage(product.images)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 line-clamp-2 text-sm">
                    {product.name}
                  </h3>
                </div>
              </div>
            ))}

            {/* Comparison rows */}
            {getComparisonAttributes().map((attr) => (
              <>
                <div className="p-4 font-medium text-gray-700 border-b border-gray-100">
                  {attr.label}
                </div>
                {products.map((product) => (
                  <div key={`${product.id}-${attr.key}`} className="p-4 border-b border-gray-100">
                    <span className="text-gray-900">
                      {getAttributeValue(product, attr.key)}
                    </span>
                  </div>
                ))}
              </>
            ))}

            {/* Actions row */}
            <div className="p-4 font-medium text-gray-700 border-b border-gray-100">
              Acties
            </div>
            {products.map((product) => (
              <div key={`${product.id}-actions`} className="p-4 border-b border-gray-100 space-y-2">
                <Button
                  onClick={() => handleAddToCart(product)}
                  size="sm"
                  className="w-full"
                  disabled={product.stock_status !== 'instock'}
                >
                  In winkelwagen
                </Button>
                <Link href={`/product/${product.slug}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Bekijk details
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
