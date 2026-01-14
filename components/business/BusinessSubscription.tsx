'use client'

import { useState } from 'react'
import { Check, ArrowRight, Calendar, Truck, Shield, Users } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

interface SubscriptionOption {
  id: string
  name: string
  price: number
  pricePerMonth: number
  description: string
  features: string[]
  popular?: boolean
}

const subscriptionOptions: SubscriptionOption[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 75,
    pricePerMonth: 300,
    description: 'Perfect voor kleine kantoren',
    features: [
      '5 boeketten per maand',
      'Wekelijkse bezorging',
      'Gratis bezorging',
      'Flexibel opzeggen',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 140,
    pricePerMonth: 560,
    description: 'Ideaal voor middelgrote bedrijven',
    features: [
      '10 boeketten per maand',
      'Wekelijkse bezorging',
      'Gratis bezorging',
      'Korting van 10%',
      'Prioriteit support',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 250,
    pricePerMonth: 1000,
    description: 'Voor grote organisaties',
    features: [
      '20+ boeketten per maand',
      'Wekelijkse bezorging',
      'Gratis bezorging',
      'Korting van 15%',
      'Dedicated account manager',
      'Maatwerk oplossingen',
    ],
  },
]

export default function BusinessSubscription() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly')

  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
          Zakelijk Bloemenabonnement
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Kies het abonnement dat past bij uw bedrijf en ontvang wekelijks verse bloemen
        </p>
      </div>

      {/* Frequency Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          <button
            onClick={() => setFrequency('weekly')}
            className={cn(
              'px-6 py-2 rounded-md text-sm font-medium transition-all',
              frequency === 'weekly'
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:text-gray-900'
            )}
          >
            Per week
          </button>
          <button
            onClick={() => setFrequency('monthly')}
            className={cn(
              'px-6 py-2 rounded-md text-sm font-medium transition-all',
              frequency === 'monthly'
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:text-gray-900'
            )}
          >
            Per maand
          </button>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {subscriptionOptions.map((plan) => {
          const displayPrice = frequency === 'weekly' ? plan.price : plan.pricePerMonth
          const isSelected = selectedPlan === plan.id

          return (
            <Card
              key={plan.id}
              className={cn(
                'p-6 relative transition-all cursor-pointer',
                isSelected
                  ? 'ring-2 ring-primary-500 shadow-lg'
                  : 'hover:shadow-md',
                plan.popular && 'border-2 border-primary-200'
              )}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  Meest Populair
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-primary-600">
                    {formatPrice(displayPrice)}
                  </span>
                  <span className="text-gray-600 ml-2">
                    /{frequency === 'weekly' ? 'week' : 'maand'}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {isSelected && (
                <div className="mt-4 pt-4 border-t border-primary-200">
                  <div className="flex items-center justify-center text-primary-600 text-sm font-medium">
                    <Check className="h-4 w-4 mr-2" />
                    Geselecteerd
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Benefits */}
      <Card className="p-6 bg-primary-50 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Voordelen van een zakelijk abonnement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Truck className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Gratis bezorging</h4>
              <p className="text-sm text-gray-600">
                Altijd gratis bezorging bij elke levering
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Geen verplichtingen</h4>
              <p className="text-sm text-gray-600">
                Op elk moment opzeggen zonder boete
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Dedicated support</h4>
              <p className="text-sm text-gray-600">
                Persoonlijke account manager voor Enterprise
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* CTA Button */}
      {selectedPlan && (
        <div className="text-center">
          <Button
            size="lg"
            className="flex items-center gap-2 mx-auto"
            onClick={() => {
              // TODO: Implement business subscription checkout
              alert('Zakelijk abonnement afsluiten functionaliteit komt binnenkort!')
            }}
          >
            Abonnement afsluiten
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </section>
  )
}
