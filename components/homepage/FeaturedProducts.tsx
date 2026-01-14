'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductGrid from '@/components/product/ProductGrid'
import Button from '@/components/ui/Button'
import { getFeaturedProducts } from '@/lib/data/products'
import { useI18n } from '@/lib/i18n/context'

const featuredProducts = getFeaturedProducts(8)

export default function FeaturedProducts() {
  const { t } = useI18n()
  
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
              {t('homepage.featured.title')}
            </h2>
            <p className="text-gray-600">
              {t('homepage.featured.subtitle')}
            </p>
          </div>
          <Link href="/producten" className="hidden md:block">
            <Button variant="ghost">
              {t('homepage.featured.viewAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <ProductGrid products={featuredProducts} columns={4} />

        <div className="mt-12 text-center md:hidden">
          <Link href="/producten">
            <Button variant="outline" className="w-full sm:w-auto">
              {t('homepage.featured.viewAllProducts')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
