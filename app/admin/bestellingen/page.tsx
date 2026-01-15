'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  ShoppingCart,
  Filter,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Package,
  PackageSearch,
  CheckSquare,
  Square,
  ChevronDown,
  Mail,
  Printer
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

const ORDERS_PER_PAGE = 100

interface Order {
  id: string
  orderNumber: string
  date: string
  customer: {
    name: string
    email: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  shippingAddress: string
}

// Mock orders data
const mockOrders: Order[] = Array.from({ length: 250 }, (_, i) => {
  const statuses: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  const paymentStatuses: Order['paymentStatus'][] = ['pending', 'paid', 'refunded']
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)]
  
  return {
    id: `ORD${1000 + i}`,
    orderNumber: `#${1000 + i}`,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    customer: {
      name: `Klant ${i + 1}`,
      email: `klant${i + 1}@example.com`,
    },
    items: [
      { name: 'Boeket Rode Rozen', quantity: 1, price: 39.95 },
      { name: 'Glazen Vaas', quantity: 1, price: 10.00 },
    ],
    total: 49.95 + Math.random() * 100,
    status,
    paymentStatus,
    shippingAddress: `Straat ${i + 1}, Amsterdam`,
  }
})

// Pagination Controls Component
function PaginationControls({ 
  startIndex, 
  endIndex, 
  totalPages, 
  currentPage, 
  filteredOrdersLength,
  onPageChange 
}: {
  startIndex: number
  endIndex: number
  totalPages: number
  currentPage: number
  filteredOrdersLength: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Toont <span className="font-medium">{startIndex + 1}</span> tot{' '}
          <span className="font-medium">
            {Math.min(endIndex, filteredOrdersLength)}
          </span> van{' '}
          <span className="font-medium">{filteredOrdersLength}</span> bestellingen
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Vorige
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-primary-600 text-white font-semibold'
                        : 'bg-white text-gray-700 hover:bg-primary-50 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Volgende
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminBestellingenPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }

    // Load orders
    loadOrders()
  }, [router])

  const loadOrders = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setOrders(mockOrders)
      setFilteredOrders(mockOrders)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading orders:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let filtered = orders

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.email.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
    setCurrentPage(1)
  }, [searchQuery, statusFilter, orders])

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE)
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE
  const endIndex = startIndex + ORDERS_PER_PAGE
  const currentOrders = filteredOrders.slice(startIndex, endIndex)

  const handleDelete = (orderId: string) => {
    if (confirm('Weet je zeker dat je deze bestelling wilt verwijderen?')) {
      setOrders(orders.filter(o => o.id !== orderId))
      setFilteredOrders(filteredOrders.filter(o => o.id !== orderId))
      setSelectedOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const handleSelectAll = () => {
    if (selectedOrders.size === currentOrders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(currentOrders.map(o => o.id)))
    }
  }

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const handleBulkAction = async (action: string) => {
    if (selectedOrders.size === 0) return

    const selected = Array.from(selectedOrders)
    const selectedOrdersData = orders.filter(o => selected.includes(o.id))

    switch (action) {
      case 'delete':
        if (confirm(`Weet je zeker dat je ${selectedOrders.size} bestelling(en) wilt verwijderen?`)) {
          setOrders(orders.filter(o => !selected.includes(o.id)))
          setFilteredOrders(filteredOrders.filter(o => !selected.includes(o.id)))
          setSelectedOrders(new Set())
          alert(`${selectedOrders.size} bestelling(en) verwijderd`)
        }
        break
      case 'status_processing':
        setOrders(orders.map(o => 
          selected.includes(o.id) ? { ...o, status: 'processing' as const } : o
        ))
        setFilteredOrders(filteredOrders.map(o => 
          selected.includes(o.id) ? { ...o, status: 'processing' as const } : o
        ))
        alert(`${selectedOrders.size} bestelling(en) op "Wordt verwerkt" gezet`)
        setSelectedOrders(new Set())
        break
      case 'status_shipped':
        setOrders(orders.map(o => 
          selected.includes(o.id) ? { ...o, status: 'shipped' as const } : o
        ))
        setFilteredOrders(filteredOrders.map(o => 
          selected.includes(o.id) ? { ...o, status: 'shipped' as const } : o
        ))
        alert(`${selectedOrders.size} bestelling(en) op "Verzonden" gezet`)
        setSelectedOrders(new Set())
        break
      case 'status_delivered':
        setOrders(orders.map(o => 
          selected.includes(o.id) ? { ...o, status: 'delivered' as const } : o
        ))
        setFilteredOrders(filteredOrders.map(o => 
          selected.includes(o.id) ? { ...o, status: 'delivered' as const } : o
        ))
        alert(`${selectedOrders.size} bestelling(en) op "Bezorgd" gezet`)
        setSelectedOrders(new Set())
        break
      case 'payment_paid':
        setOrders(orders.map(o => 
          selected.includes(o.id) ? { ...o, paymentStatus: 'paid' as const } : o
        ))
        setFilteredOrders(filteredOrders.map(o => 
          selected.includes(o.id) ? { ...o, paymentStatus: 'paid' as const } : o
        ))
        alert(`${selectedOrders.size} bestelling(en) op "Betaald" gezet`)
        setSelectedOrders(new Set())
        break
      case 'export':
        const csv = [
          ['Ordernummer', 'Datum', 'Klant', 'Email', 'Items', 'Totaal', 'Status', 'Betaling'].join(','),
          ...selectedOrdersData.map(o => [
            `"${o.orderNumber}"`,
            new Date(o.date).toLocaleDateString('nl-NL'),
            `"${o.customer.name}"`,
            o.customer.email,
            o.items.length,
            o.total.toFixed(2),
            o.status,
            o.paymentStatus
          ].join(','))
        ].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bestellingen-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        alert(`${selectedOrders.size} bestelling(en) geëxporteerd`)
        break
      case 'email':
        alert(`Email wordt verzonden naar ${selectedOrders.size} klant(en)`)
        setSelectedOrders(new Set())
        break
      case 'print':
        alert(`Print functionaliteit voor ${selectedOrders.size} bestelling(en)`)
        // In real app, this would open print dialog
        break
    }
    setShowBulkActions(false)
  }

  const getStatusBadge = (status: Order['status']) => {
    const badges = {
      pending: (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
          <Clock className="h-3 w-3" />
          In behandeling
        </span>
      ),
      processing: (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          <Package className="h-3 w-3" />
          Wordt verwerkt
        </span>
      ),
      shipped: (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
          <Truck className="h-3 w-3" />
          Verzonden
        </span>
      ),
      delivered: (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          <CheckCircle className="h-3 w-3" />
          Bezorgd
        </span>
      ),
      cancelled: (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          <XCircle className="h-3 w-3" />
          Geannuleerd
        </span>
      ),
    }
    return badges[status]
  }

  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    const badges = {
      pending: (
        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
          Openstaand
        </span>
      ),
      paid: (
        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          Betaald
        </span>
      ),
      refunded: (
        <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
          Terugbetaald
        </span>
      ),
    }
    return badges[status]
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
                <ShoppingCart className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">Bestellingen Beheer</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bestellingen</h1>
              <p className="text-gray-600">
                Beheer alle bestellingen ({filteredOrders.length} bestellingen)
                {totalPages > 1 && ` • Pagina ${currentPage} van ${totalPages}`}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const csv = [
                  ['Ordernummer', 'Datum', 'Klant', 'Email', 'Items', 'Totaal', 'Status', 'Betaling'].join(','),
                  ...filteredOrders.map(o => [
                    `"${o.orderNumber}"`,
                    new Date(o.date).toLocaleDateString('nl-NL'),
                    `"${o.customer.name}"`,
                    o.customer.email,
                    o.items.length,
                    o.total.toFixed(2),
                    o.status,
                    o.paymentStatus
                  ].join(','))
                ].join('\n')
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `alle-bestellingen-${new Date().toISOString().split('T')[0]}.csv`
                a.click()
                window.URL.revokeObjectURL(url)
              }}
              className="border-gray-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporteer Alles
            </Button>
          </div>

          {/* Bulk Actions Bar */}
          {selectedOrders.size > 0 && (
            <Card className="p-4 mb-6 bg-primary-50 border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedOrders.size} bestelling(en) geselecteerd
                  </span>
                  <button
                    onClick={() => setSelectedOrders(new Set())}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Deselecteer alles
                  </button>
                </div>
                <div className="relative">
                  <Button
                    variant="primary"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="flex items-center gap-2"
                  >
                    Bulk Acties
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {showBulkActions && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Status Wijzigen</div>
                        <button
                          onClick={() => handleBulkAction('status_processing')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Wordt verwerkt
                        </button>
                        <button
                          onClick={() => handleBulkAction('status_shipped')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Verzonden
                        </button>
                        <button
                          onClick={() => handleBulkAction('status_delivered')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Bezorgd
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Betaling</div>
                        <button
                          onClick={() => handleBulkAction('payment_paid')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Als betaald markeren
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => handleBulkAction('export')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Download className="h-4 w-4 inline mr-2" />
                          Export geselecteerde
                        </button>
                        <button
                          onClick={() => handleBulkAction('email')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Mail className="h-4 w-4 inline mr-2" />
                          Email naar klanten
                        </button>
                        <button
                          onClick={() => handleBulkAction('print')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Printer className="h-4 w-4 inline mr-2" />
                          Print facturen
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => handleBulkAction('delete')}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 inline mr-2" />
                          Verwijderen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Search and Filters */}
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Zoek op ordernummer, klantnaam of e-mail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="all">Alle statussen</option>
                <option value="pending">In behandeling</option>
                <option value="processing">Wordt verwerkt</option>
                <option value="shipped">Verzonden</option>
                <option value="delivered">Bezorgd</option>
                <option value="cancelled">Geannuleerd</option>
              </select>
              <Button variant="outline" className="border-gray-300">
                <Filter className="h-4 w-4 mr-2" />
                Meer Filters
              </Button>
            </div>
          </Card>

          {/* Orders Table */}
          {isLoading ? (
            <Card className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Bestellingen laden...</p>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Geen bestellingen gevonden</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all' ? 'Probeer andere filters' : 'Er zijn nog geen bestellingen'}
              </p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              {/* Top Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Toont <span className="font-medium">{startIndex + 1}</span> tot{' '}
                      <span className="font-medium">
                        {Math.min(endIndex, filteredOrders.length)}
                      </span> van{' '}
                      <span className="font-medium">{filteredOrders.length}</span> bestellingen
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Vorige
                      </Button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-primary-600 text-white font-semibold'
                                  : 'bg-white text-gray-700 hover:bg-primary-50 border border-gray-300'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>

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
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        <button
                          onClick={handleSelectAll}
                          className="flex items-center"
                          title={selectedOrders.size === currentOrders.length ? 'Deselecteer alles' : 'Selecteer alles'}
                        >
                          {selectedOrders.size === currentOrders.length && currentOrders.length > 0 ? (
                            <CheckSquare className="h-5 w-5 text-primary-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bestelnummer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Datum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Klant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Totaal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Betaling
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acties
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(order.date).toLocaleDateString('nl-NL')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.date).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.customer.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1">
                            {order.items[0]?.name}
                            {order.items.length > 1 && ` +${order.items.length - 1} meer`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(order.total.toFixed(2))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/order-picker?order=${order.id}`} target="_blank">
                              <button
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Order Picker"
                              >
                                <PackageSearch className="h-4 w-4" />
                              </button>
                            </Link>
                            <Link href={`/admin/bestellingen/${order.id}`}>
                              <button
                                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Bekijk bestelling"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </Link>
                            <Link href={`/admin/bestellingen/bewerken/${order.id}`}>
                              <button
                                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Bewerk bestelling"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Verwijder bestelling"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Pagination */}
              <PaginationControls
                startIndex={startIndex}
                endIndex={endIndex}
                totalPages={totalPages}
                currentPage={currentPage}
                filteredOrdersLength={filteredOrders.length}
                onPageChange={setCurrentPage}
              />
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
