'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth/store'
import { Package, Truck, User, LogOut, MapPin, Phone, Mail, Calendar } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

// Dummy order data
const dummyOrders = [
  {
    id: 'ORD-2024-001',
    date: '2024-01-15',
    status: 'bezorgd',
    statusText: 'Bezorgd',
    statusColor: 'bg-green-100 text-green-800',
    items: [
      { name: 'Rode Rozen Boeket', quantity: 1, price: 29.95 },
      { name: 'Persoonlijk kaartje', quantity: 1, price: 2.50 },
    ],
    total: 32.45,
    tracking: 'TRACK-123456789',
    deliveryDate: '2024-01-16',
    deliveryAddress: 'Hoofdstraat 123, 1234 AB Amsterdam',
  },
  {
    id: 'ORD-2024-002',
    date: '2024-01-20',
    status: 'onderweg',
    statusText: 'Onderweg',
    statusColor: 'bg-blue-100 text-blue-800',
    items: [
      { name: 'Gemengd Boeket', quantity: 1, price: 24.95 },
    ],
    total: 24.95,
    tracking: 'TRACK-987654321',
    deliveryDate: '2024-01-22',
    deliveryAddress: 'Kerkstraat 45, 5678 CD Rotterdam',
  },
  {
    id: 'ORD-2024-003',
    date: '2024-01-18',
    status: 'verwerkt',
    statusText: 'In verwerking',
    statusColor: 'bg-yellow-100 text-yellow-800',
    items: [
      { name: 'Witte Rozen', quantity: 2, price: 19.95 },
      { name: 'Feestelijke verpakking', quantity: 1, price: 5.00 },
    ],
    total: 44.90,
    tracking: 'TRACK-456789123',
    deliveryDate: '2024-01-25',
    deliveryAddress: 'Parkweg 78, 9012 EF Utrecht',
  },
]

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mijn Account</h1>
          <p className="text-gray-600">Welkom terug, {user.name}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary-600" />
                  Persoonlijke gegevens
                </h2>
                <Button variant="outline" size="sm">
                  Bewerken
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">E-mailadres</p>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Telefoonnummer</p>
                      <p className="text-gray-900 font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Standaard bezorgadres</p>
                    <p className="text-gray-900 font-medium">Hoofdstraat 123, 1234 AB Amsterdam</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Orders */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary-600" />
                Mijn bestellingen
              </h2>
              <div className="space-y-4">
                {dummyOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Bestelling {order.id}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Calendar className="h-4 w-4" />
                          Geplaatst op {new Date(order.date).toLocaleDateString('nl-NL')}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}
                      >
                        {order.statusText}
                      </span>
                    </div>

                    <div className="mb-4 space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-gray-900 font-medium">
                            €{item.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600">Totaalbedrag</p>
                        <p className="text-lg font-bold text-gray-900">€{order.total.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'onderweg' && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/account/track/${order.tracking}`}>
                              <Truck className="h-4 w-4 mr-2" />
                              Track & Trace
                            </Link>
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Snelle acties</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/boeketten">
                    <Package className="h-4 w-4 mr-2" />
                    Nieuwe bestelling
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/abonnementen">
                    Abonnement beheren
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Favorieten bekijken
                </Button>
              </div>
            </Card>

            {/* Logout */}
            <Card className="p-6">
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Uitloggen
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
