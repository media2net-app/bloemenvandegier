'use client'

import { useState } from 'react'
import { Check, ArrowRight, ArrowLeft, Calendar, Truck, Heart } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

interface SubscriptionSize {
  id: string
  name: string
  description: string
  price: number
  flowers: string
  icon: string
}

interface SubscriptionType {
  id: string
  name: string
  description: string
  image: string
  popular?: boolean
}

const subscriptionSizes: SubscriptionSize[] = [
  {
    id: 'klein',
    name: 'Klein boeket',
    description: 'Perfect voor op tafel of als cadeau',
    price: 19.50,
    flowers: '5-7 bloemen',
    icon: '🌷',
  },
  {
    id: 'medium',
    name: 'Medium boeket',
    description: 'Ideaal voor in de woonkamer',
    price: 29.50,
    flowers: '10-12 bloemen',
    icon: '🌹',
  },
  {
    id: 'groot',
    name: 'Groot boeket',
    description: 'Een prachtige eyecatcher voor elke ruimte',
    price: 39.50,
    flowers: '15-20 bloemen',
    icon: '🌸',
  },
]

const subscriptionTypes: SubscriptionType[] = [
  {
    id: 'rozen',
    name: 'Rozen',
    description: 'Klassieke rozen in verschillende kleuren',
    image: 'https://www.bloemenvandegier.nl/wp-content/uploads/2024/01/rozen-abonnement.jpg',
    popular: true,
  },
  {
    id: 'gemengd',
    name: 'Gemengd boeket',
    description: 'Een gevarieerd boeket met seizoensbloemen',
    image: 'https://www.bloemenvandegier.nl/wp-content/uploads/2024/01/gemengd-boeket.jpg',
  },
  {
    id: 'seizoensbloemen',
    name: 'Seizoensbloemen',
    description: 'Bloemen die passen bij het seizoen',
    image: 'https://www.bloemenvandegier.nl/wp-content/uploads/2024/01/seizoensbloemen.jpg',
  },
  {
    id: 'veldbloemen',
    name: 'Veldbloemen',
    description: 'Natuurlijke en kleurrijke veldbloemen',
    image: 'https://www.bloemenvandegier.nl/wp-content/uploads/2024/01/veldbloemen.jpg',
  },
]

export default function SubscriptionWizard() {
  const [step, setStep] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly'>('weekly')

  const handleNext = () => {
    if (step === 1 && selectedSize) {
      setStep(2)
    } else if (step === 2 && selectedType) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const selectedSizeData = subscriptionSizes.find(s => s.id === selectedSize)
  const selectedTypeData = subscriptionTypes.find(t => t.id === selectedType)

  const totalPrice = selectedSizeData
    ? frequency === 'weekly'
      ? selectedSizeData.price
      : selectedSizeData.price * 1.5 // Bi-weekly is 1.5x de prijs
    : 0

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all',
                    step >= stepNumber
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {step > stepNumber ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span className="mt-2 text-sm font-medium text-gray-600">
                  {stepNumber === 1 && 'Grootte'}
                  {stepNumber === 2 && 'Type'}
                  {stepNumber === 3 && 'Overzicht'}
                </span>
              </div>
              {stepNumber < 3 && (
                <div
                  className={cn(
                    'h-1 flex-1 mx-2 transition-all',
                    step > stepNumber ? 'bg-primary-600' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-6 md:p-8">
        {/* Step 1: Select Size */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Kies de grootte van je boeket
            </h2>
            <p className="text-gray-600 mb-6">
              Selecteer de grootte die het beste bij jou past
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subscriptionSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.id)}
                  className={cn(
                    'p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg',
                    selectedSize === size.id
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-primary-300 bg-white'
                  )}
                >
                  <div className="text-4xl mb-3">{size.icon}</div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {size.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {size.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{size.flowers}</span>
                    <span className="font-bold text-primary-600">
                      {formatPrice(size.price)}/week
                    </span>
                  </div>
                  {selectedSize === size.id && (
                    <div className="mt-4 pt-4 border-t border-primary-200">
                      <div className="flex items-center text-primary-600 text-sm font-medium">
                        <Check className="h-4 w-4 mr-2" />
                        Geselecteerd
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Type */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Kies het type boeket
            </h2>
            <p className="text-gray-600 mb-6">
              Welk type bloemen wil je wekelijks ontvangen?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptionTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    'relative p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg overflow-hidden',
                    selectedType === type.id
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-primary-300 bg-white'
                  )}
                >
                  {type.popular && (
                    <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Populair
                    </div>
                  )}
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={type.image}
                      alt={type.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-flower.svg'
                      }}
                    />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {type.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {type.description}
                  </p>
                  {selectedType === type.id && (
                    <div className="mt-4 pt-4 border-t border-primary-200">
                      <div className="flex items-center text-primary-600 text-sm font-medium">
                        <Check className="h-4 w-4 mr-2" />
                        Geselecteerd
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Frequency Selection */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Bezorgfrequentie:
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setFrequency('weekly')}
                  className={cn(
                    'flex-1 p-4 border-2 rounded-lg text-left transition-all',
                    frequency === 'weekly'
                      ? 'border-primary-500 bg-white shadow-sm'
                      : 'border-gray-200 hover:border-primary-300'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-5 w-5 text-primary-600" />
                    <span className="font-semibold text-gray-900">Wekelijks</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Elke week verse bloemen
                  </p>
                </button>
                <button
                  onClick={() => setFrequency('biweekly')}
                  className={cn(
                    'flex-1 p-4 border-2 rounded-lg text-left transition-all',
                    frequency === 'biweekly'
                      ? 'border-primary-500 bg-white shadow-sm'
                      : 'border-gray-200 hover:border-primary-300'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-5 w-5 text-primary-600" />
                    <span className="font-semibold text-gray-900">Om de week</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Elke 2 weken verse bloemen
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Overview */}
        {step === 3 && selectedSizeData && selectedTypeData && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Jouw abonnement overzicht
            </h2>
            <p className="text-gray-600 mb-6">
              Controleer je keuzes en sluit je abonnement af
            </p>

            <div className="space-y-6">
              {/* Selected Options */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Grootte boeket
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedSizeData.name} - {selectedSizeData.flowers}
                    </p>
                  </div>
                  <span className="text-2xl">{selectedSizeData.icon}</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Type boeket
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedTypeData.name}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Bezorgfrequentie
                  </h3>
                  <p className="text-sm text-gray-600">
                    {frequency === 'weekly' ? 'Wekelijks' : 'Om de week'}
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-primary-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Wat krijg je met je abonnement?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Gratis bezorging bij elke levering
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Verse bloemen van topkwaliteit
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Flexibel opzeggen, geen verplichtingen
                    </span>
                  </li>
                </ul>
              </div>

              {/* Price Summary */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">
                    Prijs per {frequency === 'weekly' ? 'week' : '2 weken'}:
                  </span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Je kunt je abonnement op elk moment opzeggen
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </Button>

          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={
                (step === 1 && !selectedSize) ||
                (step === 2 && !selectedType)
              }
              className="flex items-center gap-2"
            >
              Volgende
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="flex items-center gap-2"
              onClick={() => {
                // TODO: Implement subscription checkout
                alert('Abonnement afsluiten functionaliteit komt binnenkort!')
              }}
            >
              Abonnement afsluiten
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
