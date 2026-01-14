import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import Card from '@/components/ui/Card'

const categories = [
  {
    name: 'Rozen',
    href: '/rozen',
    description: 'Rechtstreeks vanaf de kweker',
    color: 'from-red-100 to-red-200',
  },
  {
    name: 'Boeketten',
    href: '/boeketten',
    description: 'Speciaal voor jou geselecteerd',
    color: 'from-pink-100 to-pink-200',
  },
  {
    name: 'Voorjaarsbloemen',
    href: '/categorie/voorjaarsbloemen',
    description: 'Verse lente bloemen',
    color: 'from-yellow-100 to-yellow-200',
  },
  {
    name: 'Groen & Decoratief',
    href: '/groen-decoratief',
    description: 'Verse takken en decoratie',
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
                <div className={`relative h-48 bg-gradient-to-br ${category.color} overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Image
                      src="/images/placeholder-flower.svg"
                      alt={category.name}
                      width={64}
                      height={64}
                      className="opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-3 font-medium">Geen afbeelding</p>
                  </div>
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
