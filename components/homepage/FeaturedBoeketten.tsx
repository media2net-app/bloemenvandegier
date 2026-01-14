import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductGrid from '@/components/product/ProductGrid'
import Button from '@/components/ui/Button'
import { getProductsByCategorySlug } from '@/lib/data/products'

// Get real boeketten products (only with images)
const boeketCategories = ['alle-boeketten', 'klassieke-boeketten', 'rozen-boeketten', 'plukboeketten', 'plukboeket']
const allBoeketten = boeketCategories.flatMap(slug => getProductsByCategorySlug(slug))
// Remove duplicates by ID and take first 8
const boeketten = Array.from(new Map(allBoeketten.map(p => [p.id, p])).values()).slice(0, 8)

export default function FeaturedBoeketten() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
              De mooiste boeketten speciaal voor jou geselecteerd
            </h2>
            <p className="text-gray-600">
              Met passie voor het vak worden kennis en ervaring met elkaar gedeeld
            </p>
          </div>
          <Link href="/boeketten" className="hidden md:block">
            <Button variant="ghost">
              Bekijk alle boeketten
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <ProductGrid products={boeketten} columns={4} />

        <div className="mt-12 text-center md:hidden">
          <Link href="/boeketten">
            <Button variant="outline" className="w-full sm:w-auto">
              Bekijk alle boeketten
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
