import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import Card from '@/components/ui/Card'

const categories = [
  {
    name: 'Rozen',
    href: '/rozen',
    description: 'Rechtstreeks vanaf de kweker',
    image: 'https://images.unsplash.com/photo-1518621012428-6d6d0c0e0e0e?w=800&h=600&fit=crop&q=80',
    color: 'from-red-100 to-red-200',
  },
  {
    name: 'Boeketten',
    href: '/boeketten',
    description: 'Speciaal voor jou geselecteerd',
    image: 'https://images.unsplash.com/photo-1563241521-5b91b7b85942?w=800&h=600&fit=crop&q=80',
    color: 'from-pink-100 to-pink-200',
  },
  {
    name: 'Voorjaarsbloemen',
    href: '/categorie/voorjaarsbloemen',
    description: 'Verse lente bloemen',
    image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&h=600&fit=crop&q=80',
    color: 'from-yellow-100 to-yellow-200',
  },
  {
    name: 'Groen & Decoratief',
    href: '/groen-decoratief',
    description: 'Verse takken en decoratie',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
    color: 'from-green-100 to-green-200',
  },
]

export default function CategoryGrid() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
            Ontdek onze collectie
          </h2>
          <p className="text-gray-600">
            Kies uit een breed assortiment aan prachtige bloemen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.name} href={category.href}>
              <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center text-primary-600 font-medium text-sm group-hover:gap-2 transition-all">
                    Bekijk collectie
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
