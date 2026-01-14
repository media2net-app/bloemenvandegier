'use client'

import { Building2, Calendar, UtensilsCrossed, Gift, Sprout, Users } from 'lucide-react'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'

interface BusinessService {
  id: string
  title: string
  description: string
  icon: typeof Building2
  features: string[]
  popular?: boolean
}

const businessServices: BusinessService[] = [
  {
    id: 'kantoor',
    title: 'Kantoorplanten & Groen',
    description: 'Frisse kantoorplanten die uw werkruimte tot leven brengen',
    icon: Building2,
    features: [
      'Wekelijkse of maandelijkse levering',
      'Onderhoud en verzorging inbegrepen',
      'Verschillende planten per seizoen',
      'Maatwerk oplossingen',
    ],
    popular: true,
  },
  {
    id: 'evenementen',
    title: 'Evenementen Bloemen',
    description: 'Prachtige bloemdecoraties voor uw bedrijfsevenementen',
    icon: Calendar,
    features: [
      'Conferenties en seminars',
      'Productlanceringen',
      'Bedrijfsfeesten',
      'Maatwerk arrangementen',
    ],
  },
  {
    id: 'horeca',
    title: 'Horeca Bloemen',
    description: 'Verse bloemen voor restaurants, hotels en cafés',
    icon: UtensilsCrossed,
    features: [
      'Wekelijkse verse bloemen',
      'Tafelarrangementen',
      'Receptie decoraties',
      'Seizoensgebonden bloemen',
    ],
  },
  {
    id: 'cadeaus',
    title: 'Zakelijke Cadeaus',
    description: 'Bloemen als bedankje voor klanten en medewerkers',
    icon: Gift,
    features: [
      'Klantwaardering',
      'Medewerker erkenning',
      'Jubilea en verjaardagen',
      'Bulk kortingen',
    ],
  },
  {
    id: 'abonnement',
    title: 'Zakelijk Bloemenabonnement',
    description: 'Wekelijks verse bloemen voor uw kantoor of bedrijf',
    icon: Sprout,
    features: [
      'Flexibele bezorging',
      'Kies zelf de frequentie',
      'Geen verplichtingen',
      'Bulk kortingen vanaf 5 boeketten',
    ],
  },
  {
    id: 'advies',
    title: 'Advies & Consultancy',
    description: 'Professioneel advies voor uw bloemendecoratie',
    icon: Users,
    features: [
      'Gratis adviesgesprek',
      'Interieur advies',
      'Seizoensplanning',
      'Budget optimalisatie',
    ],
  },
]

export default function BusinessServices() {
  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
          Onze Zakelijke Diensten
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Van kantoorplanten tot evenementen, wij bieden complete bloemendiensten voor uw bedrijf
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businessServices.map((service) => {
          const Icon = service.icon
          return (
            <Card
              key={service.id}
              className={cn(
                'p-6 hover:shadow-lg transition-shadow relative',
                service.popular && 'ring-2 ring-primary-500'
              )}
            >
              {service.popular && (
                <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Populair
                </div>
              )}
              <div className="mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>
              </div>
              <ul className="space-y-2">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-primary-600 mt-1">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
