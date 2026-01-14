'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Search, 
  Filter,
  Calendar,
  Truck,
  MapPin,
  Clock,
  Package,
  Printer,
  Download,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Route
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils/format'

const DELIVERIES_PER_PAGE = 50

interface Delivery {
  id: string
  orderNumber: string
  orderId: string
  customerName: string
  address: {
    street: string
    houseNumber: string
    postalCode: string
    city: string
  }
  deliveryDate: string
  deliveryTime: 'day' | 'evening'
  status: 'pending' | 'scheduled' | 'in_transit' | 'delivered' | 'failed' | 'cancelled'
  trackingNumber?: string
  items: number
  total: number
  notes?: string
  route?: string
}

interface DeliveryStats {
  today: {
    day: number
    evening: number
    total: number
  }
  thisWeek: number
  pending: number
  inTransit: number
  delivered: number
  failed: number
}

export default function AdminVerzendingPage() {
  const router = useRouter()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDate, setFilterDate] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterTime, setFilterTime] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState<DeliveryStats>({
    today: { day: 0, evening: 0, total: 0 },
    thisWeek: 0,
    pending: 0,
    inTransit: 0,
    delivered: 0,
    failed: 0,
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

    loadDeliveries()
  }, [router])

  const loadDeliveries = async () => {
    try {
      // In a real app, this would be an API call
      // For now, we'll generate mock data
      const mockDeliveries: Delivery[] = []
      
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      // Generate mock deliveries for today and next few days
      for (let i = 0; i < 100; i++) {
        const deliveryDate = new Date(today)
        deliveryDate.setDate(today.getDate() + Math.floor(i / 20))
        const dateStr = deliveryDate.toISOString().split('T')[0]
        
        const statuses: Delivery['status'][] = ['pending', 'scheduled', 'in_transit', 'delivered', 'failed']
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        
        mockDeliveries.push({
          id: `DEL${1000 + i}`,
          orderNumber: `#${1000 + i}`,
          orderId: `ORD${1000 + i}`,
          customerName: `Klant ${i + 1}`,
          address: {
            street: `Straat ${i + 1}`,
            houseNumber: `${10 + (i % 50)}`,
            postalCode: `${1000 + (i % 1000)} AB`,
            city: ['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven'][i % 5],
          },
          deliveryDate: dateStr,
          deliveryTime: i % 2 === 0 ? 'day' : 'evening',
          status,
          trackingNumber: status !== 'pending' ? `TRK${1000000 + i}` : undefined,
          items: Math.floor(Math.random() * 5) + 1,
          total: Math.floor(Math.random() * 100) + 20,
          notes: i % 10 === 0 ? 'Bel aan bij buren' : undefined,
          route: i % 5 === 0 ? `Route ${Math.floor(i / 5) + 1}` : undefined,
        })
      }

      setDeliveries(mockDeliveries)
      calculateStats(mockDeliveries, todayStr)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading deliveries:', error)
      setIsLoading(false)
    }
  }

  const calculateStats = (deliveriesList: Delivery[], todayStr: string) => {
    const stats: DeliveryStats = {
      today: { day: 0, evening: 0, total: 0 },
      thisWeek: 0,
      pending: 0,
      inTransit: 0,
      delivered: 0,
      failed: 0,
    }

    const today = new Date(todayStr)
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())

    deliveriesList.forEach(delivery => {
      // Today's deliveries
      if (delivery.deliveryDate === todayStr) {
        stats.today.total++
        if (delivery.deliveryTime === 'day') {
          stats.today.day++
        } else {
          stats.today.evening++
        }
      }

      // This week's deliveries
      const deliveryDate = new Date(delivery.deliveryDate)
      if (deliveryDate >= weekStart) {
        stats.thisWeek++
      }

      // Status counts
      switch (delivery.status) {
        case 'pending':
          stats.pending++
          break
        case 'in_transit':
          stats.inTransit++
          break
        case 'delivered':
          stats.delivered++
          break
        case 'failed':
          stats.failed++
          break
      }
    })

    setStats(stats)
  }

  useEffect(() => {
    let filtered = [...deliveries]

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(delivery =>
        delivery.orderNumber.toLowerCase().includes(query) ||
        delivery.customerName.toLowerCase().includes(query) ||
        delivery.address.city.toLowerCase().includes(query) ||
        delivery.address.postalCode.toLowerCase().includes(query) ||
        delivery.trackingNumber?.toLowerCase().includes(query)
      )
    }

    // Apply date filter
    if (filterDate) {
      filtered = filtered.filter(d => d.deliveryDate === filterDate)
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(d => d.status === filterStatus)
    }

    // Apply time filter
    if (filterTime !== 'all') {
      filtered = filtered.filter(d => d.deliveryTime === filterTime)
    }

    // Sort by delivery date and time
    filtered.sort((a, b) => {
      if (a.deliveryDate !== b.deliveryDate) {
        return a.deliveryDate.localeCompare(b.deliveryDate)
      }
      if (a.deliveryTime !== b.deliveryTime) {
        return a.deliveryTime === 'day' ? -1 : 1
      }
      return 0
    })

    setFilteredDeliveries(filtered)
    setCurrentPage(1)
  }, [searchQuery, filterDate, filterStatus, filterTime, deliveries])

  // Calculate pagination
  const totalPages = Math.ceil(filteredDeliveries.length / DELIVERIES_PER_PAGE)
  const startIndex = (currentPage - 1) * DELIVERIES_PER_PAGE
  const endIndex = startIndex + DELIVERIES_PER_PAGE
  const currentDeliveries = filteredDeliveries.slice(startIndex, endIndex)

  const getStatusBadge = (status: Delivery['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="default" className="bg-gray-100 text-gray-800">In afwachting</Badge>
      case 'scheduled':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Gepland</Badge>
      case 'in_transit':
        return <Badge variant="warning">Onderweg</Badge>
      case 'delivered':
        return <Badge variant="success">Bezorgd</Badge>
      case 'failed':
        return <Badge variant="default" className="bg-red-100 text-red-800">Mislukt</Badge>
      case 'cancelled':
        return <Badge variant="default" className="bg-gray-100 text-gray-800">Geannuleerd</Badge>
      default:
        return <Badge variant="default">Onbekend</Badge>
    }
  }

  const handlePrintLabels = () => {
    alert('Verzendlabels worden gegenereerd...\n\nIn productie zou hier een PDF worden gegenereerd met alle verzendlabels.')
  }

  const handlePrintRoute = (route: string) => {
    alert(`Route ${route} wordt gegenereerd...\n\nIn productie zou hier een routekaart worden gegenereerd.`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('nl-NL', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verzendingen laden...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="ml-64">
        {/* Top Bar */}
        <div className="bg-primary-600 text-white px-8 py-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Verzending Beheer</h1>
              <p className="text-primary-100 text-sm mt-1">
                Beheer alle bezorgingen en verzendroutes
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="bg-white text-primary-600 hover:bg-primary-50"
                onClick={handlePrintLabels}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Labels
              </Button>
              <Button className="bg-white text-primary-600 hover:bg-primary-50">
                <Route className="h-4 w-4 mr-2" />
                Route Planning
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Vandaag (Dag)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.today.day}</p>
                </div>
                <Clock className="h-8 w-8 text-primary-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Vandaag (Avond)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.today.evening}</p>
                </div>
                <Clock className="h-8 w-8 text-primary-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Deze Week</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Onderweg</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inTransit}</p>
                </div>
                <Truck className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Zoek op ordernummer, klant, stad of tracking..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="all">Alle statussen</option>
                  <option value="pending">In afwachting</option>
                  <option value="scheduled">Gepland</option>
                  <option value="in_transit">Onderweg</option>
                  <option value="delivered">Bezorgd</option>
                  <option value="failed">Mislukt</option>
                </select>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Bezorgtijd:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterTime('all')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      filterTime === 'all'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Alle
                  </button>
                  <button
                    onClick={() => setFilterTime('day')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      filterTime === 'day'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Overdag
                  </button>
                  <button
                    onClick={() => setFilterTime('evening')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      filterTime === 'evening'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Avond
                  </button>
                </div>
                <div className="ml-auto text-sm text-gray-600">
                  <strong className="text-gray-900">{filteredDeliveries.length}</strong> verzendingen gevonden
                </div>
              </div>
            </div>
          </Card>

          {/* Pagination Top */}
          {totalPages > 1 && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Pagina {currentPage} van {totalPages} ({filteredDeliveries.length} verzendingen)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Vorige
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Volgende
                </Button>
              </div>
            </div>
          )}

          {/* Deliveries Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klant & Adres
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bezorging
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentDeliveries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        Geen verzendingen gevonden voor je zoekopdracht.
                      </td>
                    </tr>
                  ) : (
                    currentDeliveries.map((delivery) => (
                      <tr key={delivery.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {delivery.orderNumber}
                            </div>
                            <div className="text-xs text-gray-500">
                              {delivery.items} {delivery.items === 1 ? 'item' : 'items'} • {formatPrice(delivery.total.toFixed(2))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {delivery.customerName}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {delivery.address.street} {delivery.address.houseNumber}
                            </div>
                            <div className="text-xs text-gray-500">
                              {delivery.address.postalCode} {delivery.address.city}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900 flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {formatDate(delivery.deliveryDate)}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {delivery.deliveryTime === 'day' ? 'Overdag' : 'Avond'}
                            </div>
                            {delivery.trackingNumber && (
                              <div className="text-xs text-gray-500 mt-1">
                                <code className="bg-gray-100 px-1 rounded">
                                  {delivery.trackingNumber}
                                </code>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(delivery.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {delivery.route ? (
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                              {delivery.route}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/bestellingen/${delivery.orderId}`}>
                              <button
                                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                title="Bekijk bestelling"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </Link>
                            <Link href={`/admin/bestellingen/bewerken/${delivery.orderId}`}>
                              <button
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Bewerk bestelling"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </Link>
                            {delivery.route && (
                              <button
                                onClick={() => handlePrintRoute(delivery.route!)}
                                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                title="Print route"
                              >
                                <Route className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination Bottom */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Pagina {currentPage} van {totalPages} ({filteredDeliveries.length} verzendingen)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Vorige
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Volgende
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
