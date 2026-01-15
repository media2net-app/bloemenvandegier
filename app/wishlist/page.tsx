'use client'

import { useWishlistStore } from '@/lib/wishlist/store'
import ProductGrid from '@/components/product/ProductGrid'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import Button from '@/components/ui/Button'
import { Heart, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function WishlistPage() {
  const { items, clearWishlist, getItemCount } = useWishlistStore()
  const itemCount = getItemCount()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Favorieten', href: '#' },
            ]}
          />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                Mijn Favorieten
              </h1>
              <p className="text-lg text-gray-600">
                {itemCount} {itemCount === 1 ? 'product' : 'producten'} opgeslagen
              </p>
            </div>
            {itemCount > 0 && (
              <Button
                variant="outline"
                onClick={clearWishlist}
                className="hidden md:flex"
              >
                Lijst legen
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {itemCount > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Bewaar je favoriete producten voor later
              </p>
              <Button
                variant="outline"
                onClick={clearWishlist}
                className="md:hidden"
                size="sm"
              >
                Lijst legen
              </Button>
            </div>
            <ProductGrid products={items} columns={4} />
          </>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Je favorietenlijst is leeg
              </h2>
              <p className="text-gray-600 mb-8">
                Voeg producten toe aan je favorieten door op het hartje te klikken bij producten die je leuk vindt.
              </p>
              <Button asChild>
                <Link href="/boeketten">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Verder winkelen
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
