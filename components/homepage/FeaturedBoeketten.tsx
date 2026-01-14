import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductGrid from '@/components/product/ProductGrid'
import Button from '@/components/ui/Button'

// Mock data - will be replaced with real WooCommerce data
const boeketten = [
  {
    id: 1,
    name: 'Kort Boeket Lekker Zacht',
    slug: 'kort-boeket-lekker-zacht',
    price: '17.50',
    images: [{ src: '/placeholder-flower.jpg', alt: 'Kort Boeket' }],
    stock_status: 'instock',
    average_rating: '4.7',
  },
  {
    id: 2,
    name: 'De Gier Boeket',
    slug: 'de-gier-boeket',
    price: '20.00',
    images: [{ src: '/placeholder-flower.jpg', alt: 'De Gier Boeket' }],
    stock_status: 'instock',
    average_rating: '4.8',
  },
  {
    id: 3,
    name: 'Plukboeket XL',
    slug: 'plukboeket-xl',
    price: '25.00',
    images: [{ src: '/placeholder-flower.jpg', alt: 'Plukboeket XL' }],
    stock_status: 'instock',
    average_rating: '4.9',
  },
  {
    id: 4,
    name: 'Grote De Gier',
    slug: 'grote-de-gier',
    price: '25.00',
    images: [{ src: '/placeholder-flower.jpg', alt: 'Grote De Gier' }],
    stock_status: 'instock',
    average_rating: '4.8',
  },
  {
    id: 5,
    name: 'Klassiek Wit Boeket',
    slug: 'klassiek-wit-boeket',
    price: '27.50',
    images: [{ src: '/placeholder-flower.jpg', alt: 'Klassiek Wit' }],
    stock_status: 'instock',
    average_rating: '4.7',
  },
  {
    id: 6,
    name: 'Groot Gekleurd Boeket',
    slug: 'groot-gekleurd-boeket',
    price: '35.00',
    images: [{ src: '/placeholder-flower.jpg', alt: 'Groot Gekleurd' }],
    stock_status: 'instock',
    average_rating: '4.9',
  },
  {
    id: 7,
    name: 'Veldboeket XXL',
    slug: 'veldboeket-xxl',
    price: '35.00',
    images: [{ src: '/placeholder-flower.jpg', alt: 'Veldboeket XXL' }],
    stock_status: 'instock',
    average_rating: '4.8',
  },
  {
    id: 8,
    name: 'Mamma Mia',
    slug: 'mamma-mia',
    price: '50.00',
    images: [{ src: '/placeholder-flower.jpg', alt: 'Mamma Mia' }],
    stock_status: 'instock',
    average_rating: '5.0',
  },
]

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
