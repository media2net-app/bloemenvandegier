import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductGrid from '@/components/product/ProductGrid'
import Button from '@/components/ui/Button'
import { getProductsByCategorySlug } from '@/lib/data/products'

// Get real rozen products (only with images)
const rozen = getProductsByCategorySlug('rozen').slice(0, 8)

export default function RozenSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
              Rozen rechtstreeks vanaf de kweker, geleverd bij jou thuis!
            </h2>
            <p className="text-gray-600">
              Verse rozen van topkwaliteit, direct van de kweker naar jouw deur
            </p>
          </div>
          <Link href="/rozen" className="hidden md:block">
            <Button variant="ghost">
              Bekijk alle rozen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <ProductGrid products={rozen} columns={4} />

        <div className="mt-12 text-center md:hidden">
          <Link href="/rozen">
            <Button variant="outline" className="w-full sm:w-auto">
              Bekijk alle rozen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
