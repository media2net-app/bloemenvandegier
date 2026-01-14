import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductGrid from '@/components/product/ProductGrid'
import Button from '@/components/ui/Button'

// Mock data - will be replaced with real WooCommerce data
const rozen = [
  {
    id: 1,
    name: 'Gele Rozen – 30 of meer',
    slug: 'gele-rozen-30-of-meer',
    price: '29.50',
    images: [{ src: '/placeholder-flower.jpg', alt: 'Gele Rozen' }],
    stock_status: 'instock',
    average_rating: '4.8',
  },
  {
    id: 2,
    name: 'Witte Rozen – 30 of meer',
    slug: 'witte-rozen-30-of-meer',
    price: '29.50',
    images: [{ src: '/placeholder-flower.jpg', alt: 'Witte Rozen' }],
    stock_status: 'instock',
    average_rating: '4.9',
  },
  {
    id: 3,
    name: 'Regenboog Rozen – 10 t/m 100 stuks',
    slug: 'regenboog-rozen',
    price: '29.50',
    images: [{ src: '/placeholder-flower.jpg', alt: 'Regenboog Rozen' }],
    stock_status: 'instock',
    average_rating: '4.7',
  },
  {
    id: 4,
    name: 'Roze Rozen – 30 of meer',
    slug: 'roze-rozen-30-of-meer',
    price: '29.50',
    images: [{ src: '/placeholder-flower.jpg', alt: 'Roze Rozen' }],
    stock_status: 'instock',
    average_rating: '4.8',
  },
  {
    id: 5,
    name: 'Rode Rozen – 30 of meer',
    slug: 'rode-rozen-30-of-meer',
    price: '29.50',
    images: [{ src: '/placeholder-flower.jpg', alt: 'Rode Rozen' }],
    stock_status: 'instock',
    average_rating: '4.9',
  },
  {
    id: 6,
    name: 'Rode Rozen XXL – Red Naomi | 10 of meer',
    slug: 'rode-rozen-xxl-red-naomi',
    price: '22.50',
    images: [{ src: '/placeholder-flower.jpg', alt: 'Rode Rozen XXL' }],
    stock_status: 'instock',
    average_rating: '4.9',
  },
  {
    id: 7,
    name: 'Rozen Boeket Kort – 50 Stelen',
    slug: 'rozen-boeket-kort',
    price: '22.50',
    images: [{ src: '/placeholder-flower.jpg', alt: 'Rozen Boeket' }],
    stock_status: 'instock',
    average_rating: '4.8',
  },
  {
    id: 8,
    name: 'Roze Rozen XXL – Sweet Pink | 10 of meer',
    slug: 'roze-rozen-xxl-sweet-pink',
    price: '19.50',
    images: [{ src: '/placeholder-flower.jpg', alt: 'Roze Rozen XXL' }],
    stock_status: 'instock',
    average_rating: '4.7',
  },
]

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
