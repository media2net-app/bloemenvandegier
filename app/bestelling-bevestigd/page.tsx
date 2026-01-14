'use client'

import Link from 'next/link'
import { CheckCircle, Package, Mail, Home } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bestelling geplaatst!
            </h1>
            <p className="text-gray-600">
              Bedankt voor je bestelling. Je ontvangt binnenkort een bevestigingsmail.
            </p>
          </div>

          <div className="bg-primary-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="font-semibold text-gray-900 mb-4">Wat gebeurt er nu?</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Bevestigingsmail</p>
                  <p className="text-sm text-gray-600">
                    Je ontvangt binnen enkele minuten een e-mail met alle details van je bestelling.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Voorbereiding</p>
                  <p className="text-sm text-gray-600">
                    We bereiden je bestelling met zorg voor en sturen je een trackingnummer zodra het verzonden is.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Home className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Bezorging</p>
                  <p className="text-sm text-gray-600">
                    Je bestelling wordt op de gekozen datum en tijd bezorgd.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href="/account">Bekijk mijn bestellingen</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">Verder winkelen</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
