'use client'

import { useState } from 'react'
import ProductCard from './ProductCard'
import ProductQuickView from './ProductQuickView'
import { Star, Truck, Shield, Heart } from 'lucide-react'
import { Product } from '@/lib/data/products'

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3 | 4
  showUSPBanners?: boolean // Only show USP banners on category pages, not homepage
}

type ProductLabel = 'meest-verkocht' | 'nieuw' | 'dagtopper' | null

// Function to assign random labels to products (deterministic based on product ID)
function getProductLabel(productId: number): ProductLabel {
  // Use product ID as seed for consistent labeling
  const seed = productId * 7 + 13
  const random = (seed % 100) / 100
  
  // 30% chance of having a label (70% no label)
  if (random > 0.7) {
    const labelType = seed % 3
    if (labelType === 0) return 'meest-verkocht'
    if (labelType === 1) return 'nieuw'
    if (labelType === 2) return 'dagtopper'
  }
  
  return null
}

// USP items from TrustBar
const uspItems = [
  {
    icon: Star,
    text: '9.1 uit 4700+ reviews',
    highlight: '9.1',
  },
  {
    icon: Truck,
    text: 'Bezorging in heel Nederland & België',
  },
  {
    icon: Shield,
    text: '7 dagen versgarantie',
  },
  {
    icon: Heart,
    text: 'Meer bloemen voor je geld',
  },
]

// USP Banner Component
function USPBanner({ columns }: { columns: 2 | 3 | 4 }) {
  // Calculate column span based on grid columns
  const colSpan = columns === 2 ? 'md:col-span-2' : columns === 3 ? 'lg:col-span-3' : 'xl:col-span-4'
  
  return (
    <div className={`hidden lg:block ${colSpan}`}>
      <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {uspItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1">
                  {item.highlight ? (
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-primary-600">{item.highlight}</span>{' '}
                      {item.text.replace(item.highlight, '')}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-700">{item.text}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function ProductGrid({ products, columns = 4, showUSPBanners = false }: ProductGridProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  // Insert USP banner every 6 products (only on category pages, not homepage)
  const itemsWithUSP: Array<{ type: 'product' | 'usp'; product?: Product; index?: number }> = []
  
  products.forEach((product, index) => {
    itemsWithUSP.push({ type: 'product', product, index })
    
    // Insert USP banner after every 6th product (only on category pages)
    if (showUSPBanners && (index + 1) % 6 === 0 && index < products.length - 1) {
      itemsWithUSP.push({ type: 'usp' })
    }
  })

  return (
    <>
      <div className={`grid ${gridCols[columns]} gap-6`}>
        {itemsWithUSP.map((item, idx) => {
          if (item.type === 'usp') {
            return <USPBanner key={`usp-${idx}`} columns={columns} />
          }
          
          const product = item.product!
          const label = getProductLabel(product.id)
          return (
            <ProductCard
              key={product.id}
              product={product}
              label={label}
              onQuickView={() => setQuickViewProduct(product)}
            />
          )
        })}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  )
}
