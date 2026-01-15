'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Edit, 
  Printer,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  Truck,
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Eye
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils/format'

interface OrderItem {
  name: string
  quantity: number
  price: number
  image?: string
  sku?: string
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

// Mock order data - in real app this would come from API
const mockOrder: Order = {
  id: 'ORD1001',
  orderNumber: '#1001',
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
      image: '/images/rozen.jpg',
      sku: 'ROS-001',
    },
    {
      name: 'Glazen Vaas',
      quantity: 1,
      price: 10.00,
      image: '/images/vaas.jpg',
      sku: 'VAAS-001',
    },
    {
      name: 'Persoonlijk Kaartje',
      quantity: 1,
      price: 2.50,
    },
  ],
  subtotal: 52.45,
  shipping: 4.95,
  insurance: 7.50,
  total: 64.90,
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

export default function AdminBestellingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params?.id as string

  const [order, setOrder] = useState<Order | null>(null)
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

    // Load order
    loadOrder()
  }, [orderId, router])

  const loadOrder = async () => {
    try {
      // In a real app, this would be an API call
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Simulate finding order by ID
      if (orderId) {
        setOrder({
          ...mockOrder,
          id: orderId,
          orderNumber: `#${orderId.replace('ORD', '')}`,
        })
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading order:', error)
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: Order['status']) => {
    const badges = {
      pending: (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          <Clock className="h-4 w-4" />
          In behandeling
        </span>
      ),
      processing: (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          <Package className="h-4 w-4" />
          Wordt verwerkt
        </span>
      ),
      shipped: (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
          <Truck className="h-4 w-4" />
          Verzonden
        </span>
      ),
      delivered: (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          Bezorgd
        </span>
      ),
      cancelled: (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          <XCircle className="h-4 w-4" />
          Geannuleerd
        </span>
      ),
    }
    return badges[status]
  }

  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    const badges = {
      pending: (
        <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
          Openstaand
        </span>
      ),
      paid: (
        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          Betaald
        </span>
      ),
      refunded: (
        <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
          Terugbetaald
        </span>
      ),
    }
    return badges[status]
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
                <span className="font-semibold text-white">Bestelling Details</span>
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
                <span className="font-semibold text-white">Bestelling Details</span>
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
                <span className="font-semibold text-white">Bestelling {order.orderNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                  onClick={() => {
                    // Print order invoice
                    const printWindow = window.open('', '_blank')
                    if (printWindow) {
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>Factuur ${order.orderNumber}</title>
                            <style>
                              body { font-family: Arial, sans-serif; padding: 40px; }
                              .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
                              .company { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                              .order-info { margin-top: 20px; }
                              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                              th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                              th { background-color: #f5f5f5; font-weight: bold; }
                              .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
                              .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <div class="company">Bloemen van De Gier</div>
                              <div>Industrieweg 8, 7921 JP Zuidwolde</div>
                              <div>Tel: +31 528 123456 | Email: info@bloemenvandegier.nl</div>
                            </div>
                            <h1>Factuur ${order.orderNumber}</h1>
                            <div class="order-info">
                              <p><strong>Datum:</strong> ${new Date(order.date).toLocaleDateString('nl-NL')}</p>
                              <p><strong>Klant:</strong> ${order.customer.name}</p>
                              <p><strong>Email:</strong> ${order.customer.email}</p>
                              <p><strong>Telefoon:</strong> ${order.customer.phone}</p>
                            </div>
                            <table>
                              <thead>
                                <tr>
                                  <th>Product</th>
                                  <th>Aantal</th>
                                  <th>Prijs</th>
                                  <th>Totaal</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${order.items.map(item => `
                                  <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>€${item.price.toFixed(2)}</td>
                                    <td>€${(item.price * item.quantity).toFixed(2)}</td>
                                  </tr>
                                `).join('')}
                              </tbody>
                            </table>
                            <div style="text-align: right;">
                              <p>Subtotaal: €${order.subtotal.toFixed(2)}</p>
                              <p>Verzending: €${order.shipping.toFixed(2)}</p>
                              ${order.insurance ? `<p>Verzekerde bezorging: €${order.insurance.toFixed(2)}</p>` : ''}
                              <p class="total">Totaal: €${order.total.toFixed(2)}</p>
                            </div>
                            <div class="footer">
                              <p>Bedankt voor uw bestelling!</p>
                            </div>
                          </body>
                        </html>
                      `)
                      printWindow.document.close()
                      printWindow.focus()
                      setTimeout(() => {
                        printWindow.print()
                      }, 250)
                    }
                  }}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Factuur
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                  onClick={() => {
                    // Email to customer
                    const emailSubject = encodeURIComponent(`Bestelling ${order.orderNumber} - Bloemen van De Gier`)
                    const emailBody = encodeURIComponent(`Beste ${order.customer.name},\n\nBedankt voor uw bestelling ${order.orderNumber}.\n\nBestelde items:\n${order.items.map(item => `- ${item.name} (${item.quantity}x) - €${item.price.toFixed(2)}`).join('\n')}\n\nSubtotaal: €${order.subtotal.toFixed(2)}\nVerzending: €${order.shipping.toFixed(2)}\n${order.insurance ? `Verzekerde bezorging: €${order.insurance.toFixed(2)}\n` : ''}Totaal: €${order.total.toFixed(2)}\n\nBezorgdatum: ${new Date(order.deliveryDate).toLocaleDateString('nl-NL')}\nBezorgtijd: ${order.deliveryTime === 'day' ? 'Overdag' : 'Avond'}\n\nMet vriendelijke groet,\nBloemen van De Gier`)
                    window.location.href = `mailto:${order.customer.email}?subject=${emailSubject}&body=${emailBody}`
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Klant
                </Button>
                <Link href="/admin/bestellingen">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Terug
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Order Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bestelling {order.orderNumber}</h1>
              <p className="text-gray-600">
                Geplaatst op {new Date(order.date).toLocaleDateString('nl-NL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(order.status)}
              {getPaymentStatusBadge(order.paymentStatus)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary-600" />
                  Bestelde Items
                </h2>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      {item.image && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        {item.sku && (
                          <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Aantal: {item.quantity}</p>
                        <p className="font-medium text-gray-900">{formatPrice((item.price * item.quantity).toFixed(2))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Delivery Information */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary-600" />
                  Levering
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Bezorgadres</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">
                        {order.shippingAddress.street} {order.shippingAddress.houseNumber}
                      </p>
                      <p className="text-gray-900">
                        {order.shippingAddress.postalCode} {order.shippingAddress.city}
                      </p>
                      <p className="text-gray-900">{order.shippingAddress.country}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Bezorgdatum</h3>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.deliveryDate).toLocaleDateString('nl-NL', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Bezorgtijd</h3>
                      <p className="text-gray-900">
                        {order.deliveryTime === 'day' ? 'Overdag' : 'Avond'}
                      </p>
                    </div>
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Trackingnummer</h3>
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-2 bg-gray-100 rounded-lg font-mono text-sm">
                          {order.trackingNumber}
                        </code>
                        <Link href={`/account/track/${order.trackingNumber}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Track & Trace
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                  {order.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Opmerkingen</h3>
                      <p className="text-gray-900 p-4 bg-gray-50 rounded-lg">{order.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Customer Information */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  Klantgegevens
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Naam</p>
                    <p className="font-medium text-gray-900">{order.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">E-mail</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a
                        href={`mailto:${order.customer.email}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {order.customer.email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Telefoon</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {order.customer.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Order Summary */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Bestellingsoverzicht</h2>
                <div className="space-y-3">
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
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">Totaal</span>
                      <span className="font-bold text-primary-600 text-lg">
                        {formatPrice(order.total.toFixed(2))}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                  Betaling
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Betaalmethode</p>
                    <p className="font-medium text-gray-900">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Acties</h2>
                <div className="space-y-3">
                  <Link href={`/admin/bestellingen/bewerken/${order.id}`} className="block">
                    <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                      <Edit className="h-4 w-4 mr-2" />
                      Bestelling Bewerken
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    E-mail Versturen
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Factuur Downloaden
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
