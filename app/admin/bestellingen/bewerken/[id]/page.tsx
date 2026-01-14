'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save,
  ShoppingCart,
  Package,
  User,
  MapPin,
  Calendar,
  Clock,
  Truck,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils/format'

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  orderNumber: string
  date: string
  customer: {
    name: string
    email: string
    phone: string
  }
  items: OrderItem[]
  subtotal: number
  shipping: number
  insurance?: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  paymentMethod: string
  shippingAddress: {
    street: string
    houseNumber: string
    postalCode: string
    city: string
    country: string
  }
  deliveryDate: string
  deliveryTime: 'day' | 'evening'
  notes?: string
  trackingNumber?: string
}

// Mock order data
const mockOrder: Order = {
  id: 'ORD1000',
  orderNumber: '#1000',
  date: new Date().toISOString(),
  customer: {
    name: 'Jan Jansen',
    email: 'jan.jansen@example.com',
    phone: '+31 6 12345678',
  },
  items: [
    {
      name: 'Boeket Rode Rozen',
      quantity: 1,
      price: 39.95,
    },
    {
      name: 'Glazen Vaas',
      quantity: 1,
      price: 10.00,
    },
  ],
  subtotal: 49.95,
  shipping: 4.95,
  insurance: 7.50,
  total: 62.40,
  status: 'processing',
  paymentStatus: 'paid',
  paymentMethod: 'iDEAL',
  shippingAddress: {
    street: 'Hoofdstraat',
    houseNumber: '123',
    postalCode: '1234 AB',
    city: 'Amsterdam',
    country: 'Nederland',
  },
  deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  deliveryTime: 'day',
  notes: 'Graag voor de deur plaatsen',
  trackingNumber: 'TRK123456789',
}

export default function AdminBestellingBewerkenPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params?.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form state
  const [formData, setFormData] = useState({
    status: 'processing' as Order['status'],
    paymentStatus: 'paid' as Order['paymentStatus'],
    deliveryDate: '',
    deliveryTime: 'day' as 'day' | 'evening',
    trackingNumber: '',
    notes: '',
  })

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }

    if (orderId) {
      loadOrder()
    }
  }, [orderId, router])

  const loadOrder = async () => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Simulate finding order by ID
      if (orderId) {
        const loadedOrder = {
          ...mockOrder,
          id: orderId,
          orderNumber: `#${orderId.replace('ORD', '')}`,
        }
        setOrder(loadedOrder)
        setFormData({
          status: loadedOrder.status,
          paymentStatus: loadedOrder.paymentStatus,
          deliveryDate: loadedOrder.deliveryDate.split('T')[0],
          deliveryTime: loadedOrder.deliveryTime,
          trackingNumber: loadedOrder.trackingNumber || '',
          notes: loadedOrder.notes || '',
        })
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading order:', error)
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Saving order:', { ...formData })
      
      // Redirect back to orders list
      router.push('/admin/bestellingen')
    } catch (error) {
      console.error('Error saving order:', error)
      alert('Er is een fout opgetreden bij het opslaan')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <header className="bg-primary-600 text-white border-b border-primary-500 shadow-sm sticky top-0 z-30">
            <div className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">Bestelling Bewerken</span>
              </div>
            </div>
          </header>
          <main className="p-6">
            <Card className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Bestelling laden...</p>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <header className="bg-primary-600 text-white border-b border-primary-500 shadow-sm sticky top-0 z-30">
            <div className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">Bestelling Bewerken</span>
              </div>
            </div>
          </header>
          <main className="p-6">
            <Card className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bestelling niet gevonden</h3>
              <p className="text-gray-600 mb-6">De bestelling die je zoekt bestaat niet.</p>
              <Link href="/admin/bestellingen">
                <Button>Terug naar bestellingen</Button>
              </Link>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-primary-600 text-white border-b border-primary-500 shadow-sm sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">Bestelling Bewerken: {order.orderNumber}</span>
              </div>
              <Link href="/admin/bestellingen">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Terug
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bestelling Bewerken</h1>
            <p className="text-gray-600">Bewerk de bestellinginformatie hieronder</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary-600" />
                  Bestelstatus
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="pending">In behandeling</option>
                      <option value="processing">Wordt verwerkt</option>
                      <option value="shipped">Verzonden</option>
                      <option value="delivered">Bezorgd</option>
                      <option value="cancelled">Geannuleerd</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Payment Status */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                  Betalingsstatus
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Betalingsstatus
                    </label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="pending">Openstaand</option>
                      <option value="paid">Betaald</option>
                      <option value="refunded">Terugbetaald</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Delivery Information */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary-600" />
                  Levering
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bezorgdatum
                      </label>
                      <input
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bezorgtijd
                      </label>
                      <select
                        value={formData.deliveryTime}
                        onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      >
                        <option value="day">Overdag</option>
                        <option value="evening">Avond</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trackingnummer
                    </label>
                    <input
                      type="text"
                      value={formData.trackingNumber}
                      onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="TRK123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opmerkingen
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="Interne opmerkingen over deze bestelling..."
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Order Summary */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Bestellingsoverzicht</h2>
                <div className="space-y-3 mb-4">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900 mb-2">Bestelnummer:</p>
                    <p>{order.orderNumber}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900 mb-2">Datum:</p>
                    <p>{new Date(order.date).toLocaleDateString('nl-NL')}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotaal</span>
                    <span className="text-gray-900">{formatPrice(order.subtotal.toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bezorgkosten</span>
                    <span className="text-gray-900">{formatPrice(order.shipping.toFixed(2))}</span>
                  </div>
                  {order.insurance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Verzekerde levering</span>
                      <span className="text-gray-900">{formatPrice(order.insurance.toFixed(2))}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">Totaal</span>
                      <span className="font-bold text-primary-600 text-lg">
                        {formatPrice(order.total.toFixed(2))}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Customer Info */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary-600" />
                  Klant
                </h2>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-gray-900">{order.customer.name}</p>
                  <p className="text-gray-600">{order.customer.email}</p>
                  <p className="text-gray-600">{order.customer.phone}</p>
                </div>
              </Card>

              {/* Shipping Address */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary-600" />
                  Bezorgadres
                </h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{order.shippingAddress.street} {order.shippingAddress.houseNumber}</p>
                  <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </Card>

              {/* Order Items */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Items</h2>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-gray-900 font-medium">
                        {formatPrice((item.price * item.quantity).toFixed(2))}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Actions */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Acties</h2>
                <div className="space-y-3">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Opslaan...' : 'Wijzigingen Opslaan'}
                  </Button>
                  <Link href="/admin/bestellingen">
                    <Button variant="outline" className="w-full">
                      Annuleren
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
