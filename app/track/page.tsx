'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Truck, ArrowRight, Search } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useAuthStore } from '@/lib/auth/store'

export default function TrackPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [trackingId, setTrackingId] = useState('')
  const [error, setError] = useState('')

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!trackingId.trim()) {
      setError('Voer een trackingnummer in')
      return
    }

    // Redirect to tracking page
    router.push(`/account/track/${trackingId.trim()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Truck className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">
            Volg mijn bestelling
          </h1>
          <p className="text-lg text-gray-600">
            Voer je trackingnummer in om de status van je bestelling te bekijken
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleTrack} className="space-y-6">
            <div>
              <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-2">
                Trackingnummer
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="trackingId"
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  placeholder="Bijv. TRK123456"
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-lg"
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Truck className="h-5 w-5 mr-2" />
              Volg bestelling
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </form>

          {isAuthenticated && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4 text-center">
                Of bekijk al je bestellingen in je account
              </p>
              <Link href="/account">
                <Button variant="outline" className="w-full">
                  Naar mijn account
                </Button>
              </Link>
            </div>
          )}
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Geen trackingnummer?{' '}
            <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
              Neem contact met ons op
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
