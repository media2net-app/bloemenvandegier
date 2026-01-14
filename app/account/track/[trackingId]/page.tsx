'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/lib/auth/store'
import { Truck, MapPin, Clock, CheckCircle, Package } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

// Dummy tracking data
const trackingSteps = [
  {
    id: 1,
    status: 'completed',
    title: 'Bestelling ontvangen',
    description: 'Je bestelling is ontvangen en wordt verwerkt',
    date: '2024-01-20 10:30',
    location: 'Distributiecentrum Amsterdam',
  },
  {
    id: 2,
    status: 'completed',
    title: 'In verwerking',
    description: 'Je bestelling wordt voorbereid',
    date: '2024-01-20 14:15',
    location: 'Distributiecentrum Amsterdam',
  },
  {
    id: 3,
    status: 'completed',
    title: 'Verzonden',
    description: 'Je bestelling is onderweg',
    date: '2024-01-21 08:00',
    location: 'Distributiecentrum Amsterdam',
  },
  {
    id: 4,
    status: 'active',
    title: 'Onderweg naar bezorgadres',
    description: 'Je bestelling wordt vandaag bezorgd',
    date: '2024-01-22 09:30',
    location: 'Onderweg naar Rotterdam',
  },
  {
    id: 5,
    status: 'pending',
    title: 'Bezorgd',
    description: 'Je bestelling is bezorgd',
    date: null,
    location: 'Kerkstraat 45, 5678 CD Rotterdam',
  },
]

export default function TrackOrderPage() {
  const params = useParams()
  const router = useRouter()
  const trackingId = params.trackingId as string
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Terug
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track & Trace</h1>
          <p className="text-gray-600">Volg je bestelling in real-time</p>
        </div>

        {/* Tracking Info Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Truck className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Trackingnummer</p>
              <p className="text-xl font-bold text-gray-900">{trackingId}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Verwachte bezorgdatum</p>
              <p className="font-semibold text-gray-900">22 januari 2024</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Bezorgadres</p>
              <p className="font-semibold text-gray-900">Kerkstraat 45, 5678 CD Rotterdam</p>
            </div>
          </div>
        </Card>

        {/* Tracking Timeline */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Bezorgstatus</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Steps */}
            <div className="space-y-6">
              {trackingSteps.map((step, index) => {
                const isCompleted = step.status === 'completed'
                const isActive = step.status === 'active'
                const isPending = step.status === 'pending'

                return (
                  <div key={step.id} className="relative flex gap-4">
                    {/* Icon */}
                    <div
                      className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                        isCompleted
                          ? 'bg-primary-600 border-primary-600'
                          : isActive
                          ? 'bg-primary-100 border-primary-600'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : isActive ? (
                        <Package className="h-6 w-6 text-primary-600" />
                      ) : (
                        <Clock className="h-6 w-6 text-gray-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div
                        className={`${
                          isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        <h3
                          className={`font-semibold mb-1 ${
                            isActive ? 'text-primary-600' : ''
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p className="text-sm mb-2">{step.description}</p>
                        {step.date && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(step.date).toLocaleString('nl-NL')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{step.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Help Section */}
        <Card className="p-6 mt-6 bg-primary-50">
          <h3 className="font-semibold text-gray-900 mb-2">Hulp nodig?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Heb je vragen over je bestelling of bezorging? Neem contact met ons op.
          </p>
          <Button variant="outline" asChild>
            <a href="/contact">Contact opnemen</a>
          </Button>
        </Card>
      </div>
    </div>
  )
}
