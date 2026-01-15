'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Search, 
  Eye, 
  Edit, 
  Mail,
  Phone,
  Users,
  Filter,
  ShoppingCart,
  DollarSign,
  Calendar,
  CheckSquare,
  Square,
  ChevronDown,
  Download,
  Trash2,
  Tag
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils/format'

const CUSTOMERS_PER_PAGE = 100

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
}

// Mock customers data with order statistics
const mockCustomers: Customer[] = Array.from({ length: 150 }, (_, i) => {
  const totalOrders = Math.floor(Math.random() * 20) + 1 // 1-20 orders
  const avgOrderValue = 30 + Math.random() * 70 // €30-€100 average
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
  }
})

export default function AdminKlantenPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'value' | 'date'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
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

    // Load customers
    loadCustomers()
  }, [router])

  const loadCustomers = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setCustomers(mockCustomers)
      setFilteredCustomers(mockCustomers)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading customers:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let filtered = customers

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        customer.id.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter)
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'orders':
          comparison = a.totalOrders - b.totalOrders
          break
        case 'value':
          comparison = a.totalOrderValue - b.totalOrderValue
          break
        case 'date':
          comparison = new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime()
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredCustomers(filtered)
    setCurrentPage(1)
  }, [searchQuery, statusFilter, sortBy, sortOrder, customers])

  // Calculate pagination
  const totalPages = Math.ceil(filteredCustomers.length / CUSTOMERS_PER_PAGE)
  const startIndex = (currentPage - 1) * CUSTOMERS_PER_PAGE
  const endIndex = startIndex + CUSTOMERS_PER_PAGE
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex)

  const handleSort = (field: 'name' | 'orders' | 'value' | 'date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleSelectAll = () => {
    if (selectedCustomers.size === currentCustomers.length) {
      setSelectedCustomers(new Set())
    } else {
      setSelectedCustomers(new Set(currentCustomers.map(c => c.id)))
    }
  }

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(customerId)) {
        newSet.delete(customerId)
      } else {
        newSet.add(customerId)
      }
      return newSet
    })
  }

  const handleBulkAction = async (action: string) => {
    if (selectedCustomers.size === 0) return

    const selected = Array.from(selectedCustomers)
    const selectedCustomersData = customers.filter(c => selected.includes(c.id))

    switch (action) {
      case 'delete':
        if (confirm(`Weet je zeker dat je ${selectedCustomers.size} klant(en) wilt verwijderen?`)) {
          setCustomers(customers.filter(c => !selected.includes(c.id)))
          setFilteredCustomers(filteredCustomers.filter(c => !selected.includes(c.id)))
          setSelectedCustomers(new Set())
          alert(`${selectedCustomers.size} klant(en) verwijderd`)
        }
        break
      case 'status_active':
        setCustomers(customers.map(c => 
          selected.includes(c.id) ? { ...c, status: 'active' as const } : c
        ))
        setFilteredCustomers(filteredCustomers.map(c => 
          selected.includes(c.id) ? { ...c, status: 'active' as const } : c
        ))
        alert(`${selectedCustomers.size} klant(en) op "Actief" gezet`)
        setSelectedCustomers(new Set())
        break
      case 'status_inactive':
        setCustomers(customers.map(c => 
          selected.includes(c.id) ? { ...c, status: 'inactive' as const } : c
        ))
        setFilteredCustomers(filteredCustomers.map(c => 
          selected.includes(c.id) ? { ...c, status: 'inactive' as const } : c
        ))
        alert(`${selectedCustomers.size} klant(en) op "Inactief" gezet`)
        setSelectedCustomers(new Set())
        break
      case 'export':
        const csv = [
          ['Naam', 'Email', 'Telefoon', 'Lid sinds', 'Bestellingen', 'Totale Orderwaarde', 'Status'].join(','),
          ...selectedCustomersData.map(c => [
            `"${c.name}"`,
            c.email,
            c.phone,
            new Date(c.registrationDate).toLocaleDateString('nl-NL'),
            c.totalOrders,
            c.totalOrderValue.toFixed(2),
            c.status
          ].join(','))
        ].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `klanten-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        alert(`${selectedCustomers.size} klant(en) geëxporteerd`)
        break
      case 'email':
        alert(`Email wordt verzonden naar ${selectedCustomers.size} klant(en)`)
        setSelectedCustomers(new Set())
        break
    }
    setShowBulkActions(false)
  }

  const SortIcon = ({ field }: { field: 'name' | 'orders' | 'value' | 'date' }) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  // Calculate totals
  const totalCustomers = filteredCustomers.length
  const totalOrders = filteredCustomers.reduce((sum, c) => sum + c.totalOrders, 0)
  const totalValue = filteredCustomers.reduce((sum, c) => sum + c.totalOrderValue, 0)
  const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0

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
                <Users className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">Klanten Beheer</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Klanten</h1>
            <p className="text-gray-600">
              Beheer alle klanten ({filteredCustomers.length} klanten)
              {totalPages > 1 && ` • Pagina ${currentPage} van ${totalPages}`}
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Totaal Klanten</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-full">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Totaal Bestellingen</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Totale Orderwaarde</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(totalValue.toFixed(2))}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gem. Orderwaarde</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(avgOrderValue.toFixed(2))}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Zoek op naam, e-mail, telefoon of klant ID..."
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
                <option value="active">Actief</option>
                <option value="inactive">Inactief</option>
              </select>
              <Button variant="outline" className="border-gray-300">
                <Filter className="h-4 w-4 mr-2" />
                Meer Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const csv = [
                    ['Naam', 'Email', 'Telefoon', 'Lid sinds', 'Bestellingen', 'Totale Orderwaarde', 'Status'].join(','),
                    ...filteredCustomers.map(c => [
                      `"${c.name}"`,
                      c.email,
                      c.phone,
                      new Date(c.registrationDate).toLocaleDateString('nl-NL'),
                      c.totalOrders,
                      c.totalOrderValue.toFixed(2),
                      c.status
                    ].join(','))
                  ].join('\n')
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `alle-klanten-${new Date().toISOString().split('T')[0]}.csv`
                  a.click()
                  window.URL.revokeObjectURL(url)
                }}
                className="border-gray-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Alles
              </Button>
            </div>
          </Card>

          {/* Bulk Actions Bar */}
          {selectedCustomers.size > 0 && (
            <Card className="p-4 mb-6 bg-primary-50 border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedCustomers.size} klant(en) geselecteerd
                  </span>
                  <button
                    onClick={() => setSelectedCustomers(new Set())}
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
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Status Wijzigen</div>
                        <button
                          onClick={() => handleBulkAction('status_active')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Actief
                        </button>
                        <button
                          onClick={() => handleBulkAction('status_inactive')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Inactief
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

          {/* Customers Table */}
          {isLoading ? (
            <Card className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Klanten laden...</p>
            </Card>
          ) : filteredCustomers.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Geen klanten gevonden</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all' ? 'Probeer andere filters' : 'Er zijn nog geen klanten'}
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
                        {Math.min(endIndex, filteredCustomers.length)}
                      </span> van{' '}
                      <span className="font-medium">{filteredCustomers.length}</span> klanten
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
                          title={selectedCustomers.size === currentCustomers.length ? 'Deselecteer alles' : 'Selecteer alles'}
                        >
                          {selectedCustomers.size === currentCustomers.length && currentCustomers.length > 0 ? (
                            <CheckSquare className="h-5 w-5 text-primary-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-2 hover:text-gray-700"
                        >
                          Klant
                          <span className="text-primary-600">{<SortIcon field="name" />}</span>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('date')}
                          className="flex items-center gap-2 hover:text-gray-700"
                        >
                          Lid sinds
                          <span className="text-primary-600">{<SortIcon field="date" />}</span>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('orders')}
                          className="flex items-center gap-2 hover:text-gray-700"
                        >
                          Bestellingen
                          <span className="text-primary-600">{<SortIcon field="orders" />}</span>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('value')}
                          className="flex items-center gap-2 hover:text-gray-700"
                        >
                          Totale Orderwaarde
                          <span className="text-primary-600">{<SortIcon field="value" />}</span>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Laatste Bestelling
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acties
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {customer.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center gap-2 mb-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <a
                                href={`mailto:${customer.email}`}
                                className="text-primary-600 hover:text-primary-700"
                              >
                                {customer.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <a
                                href={`tel:${customer.phone}`}
                                className="text-gray-600 hover:text-primary-600"
                              >
                                {customer.phone}
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(customer.registrationDate).toLocaleDateString('nl-NL')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary-100 rounded-lg">
                              <ShoppingCart className="h-4 w-4 text-primary-600" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                {customer.totalOrders}
                              </div>
                              <div className="text-xs text-gray-500">
                                {customer.totalOrders === 1 ? 'bestelling' : 'bestellingen'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                {formatPrice(customer.totalOrderValue.toFixed(2))}
                              </div>
                              {customer.totalOrders > 0 && (
                                <div className="text-xs text-gray-500">
                                  Gem. {formatPrice((customer.totalOrderValue / customer.totalOrders).toFixed(2))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.lastOrderDate ? (
                            <div className="text-sm text-gray-900">
                              {new Date(customer.lastOrderDate).toLocaleDateString('nl-NL')}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Geen bestellingen</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/klanten/${customer.id}`}>
                              <button
                                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Bekijk klant"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </Link>
                            <Link href={`/admin/klanten/bewerken/${customer.id}`}>
                              <button
                                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Bewerk klant"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Toont <span className="font-medium">{startIndex + 1}</span> tot{' '}
                      <span className="font-medium">
                        {Math.min(endIndex, filteredCustomers.length)}
                      </span> van{' '}
                      <span className="font-medium">{filteredCustomers.length}</span> klanten
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
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
