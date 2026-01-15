'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Plus, Check, Sparkles } from 'lucide-react'
import { Product } from '@/lib/data/products'
import { getProductImage } from '@/lib/utils/getProductImage'
import { formatPrice } from '@/lib/utils/format'
import { useCartStore } from '@/lib/cart/store'
import { useCart } from '@/components/cart/CartProvider'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Price from '@/components/shared/Price'

interface Bundle {
  id: string
  name: string
  products: Product[]
  discount: number // Percentage discount
  originalPrice: number
  bundlePrice: number
  description?: string
}

interface ProductBundlesProps {
  currentProduct: Product
  relatedProducts: Product[]
}

export default function ProductBundles({ currentProduct, relatedProducts }: ProductBundlesProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { openCart } = useCart()
  const [addedBundles, setAddedBundles] = useState<Set<string>>(new Set())

  // Create bundles based on current product and related products
  const createBundles = (): Bundle[] => {
    const bundles: Bundle[] = []
    
    // Bundle 1: Product + Vaas (if available)
    const vaseProduct = relatedProducts.find(p => 
      p.name.toLowerCase().includes('vaas') || 
      p.name.toLowerCase().includes('glas')
    )
    if (vaseProduct) {
      const originalPrice = parseFloat(currentProduct.price) + parseFloat(vaseProduct.price)
      const discount = 10
      const bundlePrice = originalPrice * (1 - discount / 100)
      
      bundles.push({
        id: 'bundle-1',
        name: `${currentProduct.name} + Vaas`,
        products: [currentProduct, vaseProduct],
        discount,
        originalPrice,
        bundlePrice,
        description: 'Perfecte combinatie voor thuis',
      })
    }

    // Bundle 2: Product + Kaartje (always available as addon, but we can show it)
    const cardProduct = relatedProducts.find(p => 
      p.name.toLowerCase().includes('kaart') || 
      p.name.toLowerCase().includes('card')
    )
    if (cardProduct) {
      const originalPrice = parseFloat(currentProduct.price) + parseFloat(cardProduct.price)
      const discount = 5
      const bundlePrice = originalPrice * (1 - discount / 100)
      
      bundles.push({
        id: 'bundle-2',
        name: `${currentProduct.name} + Persoonlijk Kaartje`,
        products: [currentProduct, cardProduct],
        discount,
        originalPrice,
        bundlePrice,
        description: 'Maak het extra persoonlijk',
      })
    }

    // Bundle 3: Product + 2 gerelateerde producten (if available)
    if (relatedProducts.length >= 2) {
      const bundleProducts = [currentProduct, relatedProducts[0], relatedProducts[1]]
      const originalPrice = bundleProducts.reduce((sum, p) => sum + parseFloat(p.price), 0)
      const discount = 15
      const bundlePrice = originalPrice * (1 - discount / 100)
      
      bundles.push({
        id: 'bundle-3',
        name: 'Complete Bloemen Set',
        products: bundleProducts,
        discount,
        originalPrice,
        bundlePrice,
        description: 'Alles wat je nodig hebt in één pakket',
      })
    }

    return bundles
  }

  const bundles = createBundles()

  if (bundles.length === 0) {
    return null
  }

  const handleAddBundle = (bundle: Bundle) => {
      bundle.products.forEach((product, index) => {
        // First product uses normal price, others use discounted price
        const price = index === 0 
          ? parseFloat(product.price)
          : parseFloat(product.price) * (1 - bundle.discount / 100)
        
        addItem({
          id: product.id,
          name: product.name,
          price: price,
          image: getProductImage(product.images),
          quantity: 1,
          permalink: product.permalink,
        })
      })
    
    setAddedBundles(prev => new Set(prev).add(bundle.id))
    setTimeout(() => {
      openCart()
    }, 300)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-6 w-6 text-primary-600" />
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
          Vaak Samen Gekocht
        </h2>
      </div>
      <p className="text-gray-600 mb-8">
        Bespaar tot 15% met deze voordelige combinaties
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((bundle) => {
          const isAdded = addedBundles.has(bundle.id)
          
          return (
            <Card key={bundle.id} className="p-6 border-2 border-primary-200 hover:border-primary-400 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {bundle.name}
                  </h3>
                  {bundle.description && (
                    <p className="text-sm text-gray-600">{bundle.description}</p>
                  )}
                </div>
                <Badge variant="default" className="bg-red-500 text-white whitespace-nowrap">
                  -{bundle.discount}%
                </Badge>
              </div>

              {/* Bundle Products */}
              <div className="space-y-3 mb-4">
                {bundle.products.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={getProductImage(product.images)}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {product.name}
                      </p>
                      <Price 
                        price={index === 0 ? product.price : (parseFloat(product.price) * (1 - bundle.discount / 100)).toFixed(2)} 
                        regularPrice={index > 0 ? product.price : undefined}
                        size="sm"
                      />
                    </div>
                    {index < bundle.products.length - 1 && (
                      <Plus className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Price and CTA */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Totaal prijs</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary-600">
                        €{bundle.bundlePrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        €{bundle.originalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleAddBundle(bundle)}
                  disabled={isAdded}
                  className="w-full"
                  variant={isAdded ? "outline" : "primary"}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Toegevoegd
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Voeg bundle toe (Bespaar €{(bundle.originalPrice - bundle.bundlePrice).toFixed(2)})
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
