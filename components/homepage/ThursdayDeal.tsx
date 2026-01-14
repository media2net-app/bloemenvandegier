'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, ShoppingCart, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils/format'
import type { Product } from '@/lib/data/products'

interface ThursdayDealProps {
  product: Product | null
}

export default function ThursdayDeal({ product }: ThursdayDealProps) {
  if (!product) {
    return null
  }

  const totalAvailable = 40
  const sold = 30
  const remaining = totalAvailable - sold
  const percentageSold = (sold / totalAvailable) * 100

  // Check if today is Thursday
  const today = new Date()
  const isThursday = today.getDay() === 4 // 0 = Sunday, 4 = Thursday

  return (
    <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-primary-100">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium uppercase tracking-wide">
                  {isThursday ? 'Vandaag: Donderdag Deal!' : 'Elke donderdag'}
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-serif font-bold">
                Bloemenpakket Deal
              </h2>
              
              <p className="text-lg text-primary-100 leading-relaxed">
                Elke donderdag hebben we een speciale bloemenpakket deal! 
                Beperkte voorraad, dus wees er snel bij.
              </p>

              {/* Stock indicator */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-primary-100">
                    Nog beschikbaar
                  </span>
                  <span className="text-2xl font-bold">
                    {remaining} / {totalAvailable}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-white/20 rounded-full h-3 mb-3">
                  <div
                    className="bg-white rounded-full h-3 transition-all duration-500"
                    style={{ width: `${percentageSold}%` }}
                  />
                </div>
                
                <p className="text-sm text-primary-100">
                  {sold} van de {totalAvailable} boeketten al verkocht
                </p>
              </div>

              {/* Product info */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                  <p className="text-2xl font-bold text-primary-100">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <Link href={`/product/${product.slug}`}>
                  <Button
                    size="lg"
                    className="bg-white text-primary-600 hover:bg-primary-50 flex items-center gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Bestel nu
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Product image */}
            <div className="relative">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                <Image
                  src={product.images[0]?.src || '/placeholder-flower.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Overlay badge */}
                <div className="absolute top-4 right-4 bg-white text-primary-600 px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  Deal van de week
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
