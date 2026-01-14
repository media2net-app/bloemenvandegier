'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Search, 
  Filter,
  Plus,
  Edit,
  Eye,
  Pause,
  Play,
  X,
  Calendar,
  User,
  Package,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils/format'

const SUBSCRIPTIONS_PER_PAGE = 50

interface Subscription {
  id: string
  subscriptionNumber: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  size: 'klein' | 'medium' | 'groot'
  type: 'rozen' | 'gemengd' | 'seizoensbloemen' | 'veldbloemen'
  frequency: 'weekly' | 'biweekly'
  price: number
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  startDate: string
  nextDelivery: string
  totalDeliveries: number
  completedDeliveries: number
  paymentMethod: string
  address: {
    street: string
    houseNumber: string
    postalCode: string
    city: string
  }
  notes?: string
}

interface SubscriptionStats {
  total: number
  active: number
  paused: number
  cancelled: number
  revenue: number
}

export default function AdminAbonnementenPage() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState<SubscriptionStats>({
    total: 0,
    active: 0,
    paused: 0,
    cancelled: 0,
    revenue: 0,
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

    loadSubscriptions()
  }, [router])

  const loadSubscriptions = async () => {
    try {
      // In a real app, this would be an API call
      // Generate mock data
      const mockSubscriptions: Subscription[] = []
      
      const sizes: Subscription['size'][] = ['klein', 'medium', 'groot']
      const types: Subscription['type'][] = ['rozen', 'gemengd', 'seizoensbloemen', 'veldbloemen']
      const statuses: Subscription['status'][] = ['active', 'paused', 'cancelled', 'expired']
      const frequencies: Subscription['frequency'][] = ['weekly', 'biweekly']
      
      for (let i = 0; i < 150; i++) {
        const size = sizes[Math.floor(Math.random() * sizes.length)]
        const type = types[Math.floor(Math.random() * types.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const frequency = frequencies[Math.floor(Math.random() * frequencies.length)]
        
        const basePrice = size === 'klein' ? 19.50 : size === 'medium' ? 29.50 : 39.50
        const price = frequency === 'weekly' ? basePrice : basePrice * 1.5
        
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 365))
        
        const nextDelivery = new Date()
        nextDelivery.setDate(nextDelivery.getDate() + Math.floor(Math.random() * 14))
        
        mockSubscriptions.push({
          id: `SUB${1000 + i}`,
          subscriptionNumber: `#${1000 + i}`,
          customer: {
            id: `CUST${100 + i}`,
            name: `Klant ${i + 1}`,
            email: `klant${i + 1}@example.com`,
            phone: `+31 6 ${Math.floor(Math.random() * 9000000) + 1000000}`,
          },
          size,
          type,
          frequency,
          price,
          status,
          startDate: startDate.toISOString().split('T')[0],
          nextDelivery: nextDelivery.toISOString().split('T')[0],
          totalDeliveries: Math.floor(Math.random() * 50) + 1,
          completedDeliveries: Math.floor(Math.random() * 50),
          paymentMethod: ['iDEAL', 'Creditcard', 'Bankoverschrijving'][Math.floor(Math.random() * 3)],
          address: {
            street: `Straat ${i + 1}`,
            houseNumber: `${10 + (i % 50)}`,
            postalCode: `${1000 + (i % 1000)} AB`,
            city: ['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven'][i % 5],
          },
          notes: i % 10 === 0 ? 'Speciale instructies' : undefined,
        })
      }

      setSubscriptions(mockSubscriptions)
      calculateStats(mockSubscriptions)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading subscriptions:', error)
      setIsLoading(false)
    }
  }

  const calculateStats = (subscriptionsList: Subscription[]) => {
    const stats: SubscriptionStats = {
      total: subscriptionsList.length,
      active: 0,
      paused: 0,
      cancelled: 0,
      revenue: 0,
    }

    subscriptionsList.forEach(sub => {
      switch (sub.status) {
        case 'active':
          stats.active++
          stats.revenue += sub.price
          break
        case 'paused':
          stats.paused++
          break
        case 'cancelled':
          stats.cancelled++
          break
      }
    })

    setStats(stats)
  }

  useEffect(() => {
    let filtered = [...subscriptions]

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(sub =>
        sub.subscriptionNumber.toLowerCase().includes(query) ||
        sub.customer.name.toLowerCase().includes(query) ||
        sub.customer.email.toLowerCase().includes(query) ||
        sub.customer.phone.includes(query)
      )
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(sub => sub.status === filterStatus)
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(sub => sub.type === filterType)
    }

    // Sort by next delivery date
    filtered.sort((a, b) => {
      return a.nextDelivery.localeCompare(b.nextDelivery)
    })

    setFilteredSubscriptions(filtered)
    setCurrentPage(1)
  }, [searchQuery, filterStatus, filterType, subscriptions])

  // Calculate pagination
  const totalPages = Math.ceil(filteredSubscriptions.length / SUBSCRIPTIONS_PER_PAGE)
  const startIndex = (currentPage - 1) * SUBSCRIPTIONS_PER_PAGE
  const endIndex = startIndex + SUBSCRIPTIONS_PER_PAGE
  const currentSubscriptions = filteredSubscriptions.slice(startIndex, endIndex)

  const getStatusBadge = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Actief</Badge>
      case 'paused':
        return <Badge variant="warning">Gepauzeerd</Badge>
      case 'cancelled':
        return <Badge variant="default" className="bg-gray-100 text-gray-800">Geannuleerd</Badge>
      case 'expired':
        return <Badge variant="default" className="bg-red-100 text-red-800">Verlopen</Badge>
      default:
        return <Badge variant="default">Onbekend</Badge>
    }
  }

  const getSizeLabel = (size: Subscription['size']) => {
    switch (size) {
      case 'klein':
        return 'Klein'
      case 'medium':
        return 'Medium'
      case 'groot':
        return 'Groot'
      default:
        return size
    }
  }

  const getTypeLabel = (type: Subscription['type']) => {
    switch (type) {
      case 'rozen':
        return 'Rozen'
      case 'gemengd':
        return 'Gemengd'
      case 'seizoensbloemen':
        return 'Seizoensbloemen'
      case 'veldbloemen':
        return 'Veldbloemen'
      default:
        return type
    }
  }

  const handlePause = (subscriptionId: string) => {
    if (confirm('Weet je zeker dat je dit abonnement wilt pauzeren?')) {
      setSubscriptions(subscriptions.map(sub => 
        sub.id === subscriptionId ? { ...sub, status: 'paused' as const } : sub
      ))
    }
  }

  const handleResume = (subscriptionId: string) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === subscriptionId ? { ...sub, status: 'active' as const } : sub
    ))
  }

  const handleCancel = (subscriptionId: string) => {
    if (confirm('Weet je zeker dat je dit abonnement wilt annuleren? Dit kan niet ongedaan worden gemaakt.')) {
      setSubscriptions(subscriptions.map(sub => 
        sub.id === subscriptionId ? { ...sub, status: 'cancelled' as const } : sub
      ))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Abonnementen laden...</p>
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
              <h1 className="text-2xl font-bold">Abonnementen</h1>
              <p className="text-primary-100 text-sm mt-1">
                Beheer alle bloemenabonnementen
              </p>
            </div>
            <Button className="bg-white text-primary-600 hover:bg-primary-50">
              <Plus className="h-4 w-4 mr-2" />
              Nieuw Abonnement
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Totaal</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Actief</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gepauzeerd</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.paused}</p>
                </div>
                <Pause className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Geannuleerd</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Maand Omzet</p>
                  <p className="text-2xl font-bold text-primary-600">{formatPrice(stats.revenue.toFixed(2))}</p>
                </div>
                <CreditCard className="h-8 w-8 text-primary-500" />
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
                    placeholder="Zoek op nummer, klant, email of telefoon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="all">Alle statussen</option>
                  <option value="active">Actief</option>
                  <option value="paused">Gepauzeerd</option>
                  <option value="cancelled">Geannuleerd</option>
                  <option value="expired">Verlopen</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="all">Alle types</option>
                  <option value="rozen">Rozen</option>
                  <option value="gemengd">Gemengd</option>
                  <option value="seizoensbloemen">Seizoensbloemen</option>
                  <option value="veldbloemen">Veldbloemen</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <strong className="text-gray-900">{filteredSubscriptions.length}</strong> abonnementen gevonden
              </div>
            </div>
          </Card>

          {/* Pagination Top */}
          {totalPages > 1 && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Pagina {currentPage} van {totalPages} ({filteredSubscriptions.length} abonnementen)
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

          {/* Subscriptions Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Abonnement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Grootte
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volgende Bezorging
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prijs
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentSubscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        Geen abonnementen gevonden voor je zoekopdracht.
                      </td>
                    </tr>
                  ) : (
                    currentSubscriptions.map((subscription) => (
                      <tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {subscription.subscriptionNumber}
                            </div>
                            <div className="text-xs text-gray-500">
                              Start: {formatDate(subscription.startDate)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {subscription.completedDeliveries} / {subscription.totalDeliveries} bezorgingen
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {subscription.customer.name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {subscription.customer.email}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {subscription.customer.phone}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {subscription.address.city}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">
                              {getTypeLabel(subscription.type)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getSizeLabel(subscription.size)} • {subscription.frequency === 'weekly' ? 'Wekelijks' : '2-wekelijks'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {formatDate(subscription.nextDelivery)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {subscription.paymentMethod}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(subscription.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(subscription.price.toFixed(2))}
                          </div>
                          <div className="text-xs text-gray-500">
                            per {subscription.frequency === 'weekly' ? 'week' : '2 weken'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/klanten/${subscription.customer.id}`}>
                              <button
                                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                title="Bekijk klant"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => {}}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Bewerk abonnement"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {subscription.status === 'active' ? (
                              <button
                                onClick={() => handlePause(subscription.id)}
                                className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                                title="Pauzeer abonnement"
                              >
                                <Pause className="h-4 w-4" />
                              </button>
                            ) : subscription.status === 'paused' ? (
                              <button
                                onClick={() => handleResume(subscription.id)}
                                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                title="Hervat abonnement"
                              >
                                <Play className="h-4 w-4" />
                              </button>
                            ) : null}
                            {subscription.status !== 'cancelled' && (
                              <button
                                onClick={() => handleCancel(subscription.id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Annuleer abonnement"
                              >
                                <X className="h-4 w-4" />
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
                Pagina {currentPage} van {totalPages} ({filteredSubscriptions.length} abonnementen)
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
