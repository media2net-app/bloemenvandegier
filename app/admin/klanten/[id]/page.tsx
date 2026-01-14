'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShoppingCart,
  DollarSign,
  MapPin,
  User,
  Edit,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils/format'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  registrationDate: string
  totalOrders: number
  totalOrderValue: number
  lastOrderDate?: string
  status: 'active' | 'inactive'
  address?: {
    street: string
    houseNumber: string
    postalCode: string
    city: string
    country: string
  }
}

interface Order {
  id: string
  orderNumber: string
  date: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
}

// Mock customer data
const mockCustomers: Customer[] = Array.from({ length: 150 }, (_, i) => {
  const totalOrders = Math.floor(Math.random() * 20) + 1
  const avgOrderValue = 30 + Math.random() * 70
  const totalOrderValue = totalOrders * avgOrderValue
  
  return {
    id: `CUST${1000 + i}`,
    name: `Klant ${i + 1}`,
    email: `klant${i + 1}@example.com`,
    phone: `+31 6 ${Math.floor(Math.random() * 9000000 + 1000000)}`,
    registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    totalOrders,
    totalOrderValue,
    lastOrderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: Math.random() > 0.2 ? 'active' : 'inactive',
    address: {
      street: `Straatnaam ${i + 1}`,
      houseNumber: `${Math.floor(Math.random() * 200) + 1}`,
      postalCode: `${1000 + Math.floor(Math.random() * 9000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      city: ['Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven', 'Groningen', 'Tilburg', 'Almere'][Math.floor(Math.random() * 8)],
      country: 'Nederland'
    }
  }
})

// Mock orders for customer
const mockOrders: Order[] = Array.from({ length: 15 }, (_, i) => {
  const statuses: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  return {
    id: `ORD${1000 + i}`,
    orderNumber: `#${1000 + i}`,
    date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    total: 30 + Math.random() * 100,
    items: [
      {
        name: `Product ${i + 1}`,
        quantity: Math.floor(Math.random() * 3) + 1,
        price: 20 + Math.random() * 50
      }
    ]
  }
})

export default function AdminKlantDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params?.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }

    if (customerId) {
      loadCustomer()
    }
  }, [router, customerId])

  const loadCustomer = async () => {
    if (!customerId) return
    
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const foundCustomer = mockCustomers.find(c => c.id === customerId)
      if (foundCustomer) {
        setCustomer(foundCustomer)
        // Load orders for this customer
        setOrders(mockOrders)
      } else {
        // Customer not found
        setCustomer(null)
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading customer:', error)
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="success" className="text-xs">Bezorgd</Badge>
      case 'shipped':
        return <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">Verzonden</Badge>
      case 'processing':
        return <Badge variant="warning" className="text-xs">In verwerking</Badge>
      case 'pending':
        return <Badge variant="default" className="text-xs">In behandeling</Badge>
      case 'cancelled':
        return <Badge variant="error" className="text-xs">Geannuleerd</Badge>
      default:
        return <Badge variant="default" className="text-xs">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <header className="bg-primary-600 text-white border-b border-primary-500 shadow-sm sticky top-0 z-30">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-white" />
                  <span className="font-semibold text-white">Klant Details</span>
                </div>
              </div>
            </div>
          </header>
          <main className="p-6">
            <Card className="p-12 text-center">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Klant niet gevonden</h2>
              <p className="text-gray-600 mb-6">De klant met ID {customerId} bestaat niet.</p>
              <Link href="/admin/klanten">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Terug naar klanten
                </Button>
              </Link>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <header className="bg-primary-600 text-white border-b border-primary-500 shadow-sm sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">Klant Details</span>
              </div>
              <Link href="/admin/klanten">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Terug
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Customer Header */}
            <Card className="p-6 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                    {customer.status === 'active' ? (
                      <Badge variant="success" className="text-xs">Actief</Badge>
                    ) : (
                      <Badge variant="default" className="text-xs">Inactief</Badge>
                    )}
                  </div>
                  <p className="text-gray-600">Klant ID: {customer.id}</p>
                </div>
                <Link href={`/admin/klanten/bewerken/${customer.id}`}>
                  <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                    <Edit className="h-4 w-4 mr-2" />
                    Bewerk klant
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Totaal bestellingen</p>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary-600" />
                    <p className="text-2xl font-bold text-gray-900">{customer.totalOrders}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Totale waarde</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary-600" />
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(customer.totalOrderValue.toFixed(2))}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gemiddelde bestelling</p>
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary-600" />
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice((customer.totalOrderValue / customer.totalOrders).toFixed(2))}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary-600" />
                    Contactgegevens
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">E-mailadres</p>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a
                          href={`mailto:${customer.email}`}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {customer.email}
                        </a>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Telefoonnummer</p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a
                          href={`tel:${customer.phone}`}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {customer.phone}
                        </a>
                      </div>
                    </div>
                    {customer.address && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Adres</p>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                          <div className="text-gray-900">
                            <p>{customer.address.street} {customer.address.houseNumber}</p>
                            <p>{customer.address.postalCode} {customer.address.city}</p>
                            <p>{customer.address.country}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Account Information */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary-600" />
                    Account informatie
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Registratiedatum</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">
                          {new Date(customer.registrationDate).toLocaleDateString('nl-NL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    {customer.lastOrderDate && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Laatste bestelling</p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <p className="text-gray-900">
                            {new Date(customer.lastOrderDate).toLocaleDateString('nl-NL', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        {customer.status === 'active' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <Badge variant="success" className="text-xs">Actief</Badge>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-gray-400" />
                            <Badge variant="default" className="text-xs">Inactief</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Order History */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary-600" />
                    Bestelgeschiedenis
                  </h2>
                  {orders.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">Geen bestellingen gevonden</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Bestelnummer
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Datum
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Totaal
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acties
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <Link
                                  href={`/admin/bestellingen/${order.id}`}
                                  className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                  {order.orderNumber}
                                </Link>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                {new Date(order.date).toLocaleDateString('nl-NL')}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {getStatusBadge(order.status)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                {formatPrice(order.total.toFixed(2))}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link href={`/admin/bestellingen/${order.id}`}>
                                  <Button variant="ghost" size="sm">
                                    Bekijk
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Quick Actions */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Snelle acties</h2>
                  <div className="space-y-2">
                    <Link href={`/admin/berichten?customer=${customer.id}`}>
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Bekijk berichten
                      </Button>
                    </Link>
                    <Link href={`/admin/bestellingen?customer=${customer.id}`}>
                      <Button variant="outline" className="w-full justify-start">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Alle bestellingen
                      </Button>
                    </Link>
                    <a href={`mailto:${customer.email}`}>
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Stuur e-mail
                      </Button>
                    </a>
                    <a href={`tel:${customer.phone}`}>
                      <Button variant="outline" className="w-full justify-start">
                        <Phone className="h-4 w-4 mr-2" />
                        Bel klant
                      </Button>
                    </a>
                  </div>
                </Card>

                {/* Customer Summary */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Samenvatting</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Klant sinds</span>
                      <span className="font-medium text-gray-900">
                        {new Date(customer.registrationDate).toLocaleDateString('nl-NL', {
                          year: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Totaal bestellingen</span>
                      <span className="font-medium text-gray-900">{customer.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Totale waarde</span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(customer.totalOrderValue.toFixed(2))}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Gemiddelde bestelling</span>
                      <span className="font-medium text-primary-600">
                        {formatPrice((customer.totalOrderValue / customer.totalOrders).toFixed(2))}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
