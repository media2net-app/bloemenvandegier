'use client'

import Link from 'next/link'
import { Heart, Gift, Cake, Sparkles, Flower2, Users } from 'lucide-react'
import Card from '@/components/ui/Card'
import { useI18n } from '@/lib/i18n/context'

interface Occasion {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  gradient: string
  description: string
}

const occasions: Occasion[] = [
  {
    name: 'Verjaardag',
    href: '/categorie/verjaardag',
    icon: Cake,
    color: 'text-pink-600',
    gradient: 'from-pink-100 to-pink-200',
    description: 'Vrolijke bloemen voor een speciale dag',
  },
  {
    name: 'Verliefd / Valentijnsdag',
    href: '/rozen',
    icon: Heart,
    color: 'text-red-600',
    gradient: 'from-red-100 to-red-200',
    description: 'Rozen en romantische boeketten',
  },
  {
    name: 'Bruiloft',
    href: '/categorie/bruiloft-bundels',
    icon: Sparkles,
    color: 'text-purple-600',
    gradient: 'from-purple-100 to-purple-200',
    description: 'Elegante bloemen voor uw trouwdag',
  },
  {
    name: 'Condoleance',
    href: '/categorie/condoleance',
    icon: Flower2,
    color: 'text-gray-600',
    gradient: 'from-gray-100 to-gray-200',
    description: 'Betrokkenheid en respect',
  },
  {
    name: 'Bedankje',
    href: '/boeketten',
    icon: Gift,
    color: 'text-yellow-600',
    gradient: 'from-yellow-100 to-yellow-200',
    description: 'Laat zien dat je het waardeert',
  },
  {
    name: 'Moederdag / Vaderdag',
    href: '/categorie/verjaardag',
    icon: Users,
    color: 'text-primary-600',
    gradient: 'from-primary-100 to-primary-200',
    description: 'Speciale bloemen voor je ouders',
  },
]

export default function OccasionSelector() {
  const { t } = useI18n()
  
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
            Bloemen voor elke gelegenheid
          </h2>
          <p className="text-gray-600 text-lg">
            Kies de perfecte bloemen voor jouw speciale moment
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {occasions.map((occasion) => {
            const Icon = occasion.icon
            return (
              <Link
                key={occasion.name}
                href={occasion.href}
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-300">
                  <div className={`relative h-32 bg-gradient-to-br ${occasion.gradient} overflow-hidden rounded-t-lg`}>
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className={`h-12 w-12 ${occasion.color} group-hover:scale-110 transition-transform`} />
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {occasion.name}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {occasion.description}
                    </p>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
