'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  BarChart3,
  PieChart,
  Mail,
  Clock,
  CheckCircle,
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

interface Report {
  id: string
  name: string
  type: 'sales' | 'products' | 'customers' | 'inventory' | 'marketing' | 'subscriptions' | 'custom'
  description: string
  lastGenerated?: string
  schedule?: 'daily' | 'weekly' | 'monthly' | 'none'
  format: 'pdf' | 'excel' | 'csv'
  isTemplate: boolean
}

interface ReportData {
  period: string
  revenue: number
  orders: number
  customers: number
  averageOrderValue: number
  topProducts: Array<{ name: string; sales: number; revenue: number }>
  topCategories: Array<{ name: string; revenue: number; orders: number }>
  topCustomers: Array<{ name: string; revenue: number; orders: number }>
  chartData: Array<{ date: string; revenue: number; orders: number }>
}

type ReportType = 'all' | 'sales' | 'products' | 'customers' | 'inventory' | 'marketing' | 'subscriptions' | 'custom'

export default function AdminRapportenPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'templates' | 'custom' | 'history'>('templates')
  const [typeFilter, setTypeFilter] = useState<ReportType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewReportModal, setShowNewReportModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
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

    loadReports()
  }, [router])

  const loadReports = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      // Pre-built report templates
      const mockReports: Report[] = [
        {
          id: '1',
          name: 'Sales Rapport',
          type: 'sales',
          description: 'Volledig overzicht van verkopen, omzet en trends',
          lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          schedule: 'weekly',
          format: 'pdf',
          isTemplate: true,
        },
        {
          id: '2',
          name: 'Product Performance',
          type: 'products',
          description: 'Gedetailleerde analyse van product verkopen en prestaties',
          lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          schedule: 'monthly',
          format: 'excel',
          isTemplate: true,
        },
        {
          id: '3',
          name: 'Customer Rapport',
          type: 'customers',
          description: 'Klant analyse met bestedingspatronen en loyaliteit',
          lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          schedule: 'monthly',
          format: 'pdf',
          isTemplate: true,
        },
        {
          id: '4',
          name: 'Inventory Overzicht',
          type: 'inventory',
          description: 'Voorraad status en low stock waarschuwingen',
          lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          schedule: 'daily',
          format: 'csv',
          isTemplate: true,
        },
        {
          id: '5',
          name: 'Marketing ROI',
          type: 'marketing',
          description: 'Marketing campagne performance en ROI analyse',
          lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          schedule: 'weekly',
          format: 'excel',
          isTemplate: true,
        },
        {
          id: '6',
          name: 'Abonnement Rapport',
          type: 'subscriptions',
          description: 'Abonnement overzicht en churn analyse',
          lastGenerated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          schedule: 'monthly',
          format: 'pdf',
          isTemplate: true,
        },
        {
          id: '7',
          name: 'Custom Rapport Q1 2024',
          type: 'custom',
          description: 'Aangepast rapport voor Q1 analyse',
          lastGenerated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          schedule: 'none',
          format: 'pdf',
          isTemplate: false,
        },
      ]

      setReports(mockReports)
      setFilteredReports(mockReports)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading reports:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let filtered = reports

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter)
    }

    // Tab filter
    if (activeTab === 'templates') {
      filtered = filtered.filter(r => r.isTemplate)
    } else if (activeTab === 'custom') {
      filtered = filtered.filter(r => !r.isTemplate)
    }

    setFilteredReports(filtered)
  }, [searchQuery, typeFilter, activeTab, reports])

  const generateReport = async (report: Report) => {
    setIsLoading(true)
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock report data
      const mockData: ReportData = {
        period: `${dateRange.start} - ${dateRange.end}`,
        revenue: 45678,
        orders: 234,
        customers: 189,
        averageOrderValue: 195.20,
        topProducts: [
          { name: 'Boeket Rode Rozen', sales: 45, revenue: 2250 },
          { name: 'Plukboeket XL', sales: 32, revenue: 1920 },
          { name: 'Witte Rozen', sales: 28, revenue: 1680 },
        ],
        topCategories: [
          { name: 'Rozen', revenue: 12000, orders: 120 },
          { name: 'Boeketten', revenue: 9800, orders: 85 },
          { name: 'Voorjaarsbloemen', revenue: 5600, orders: 45 },
        ],
        topCustomers: [
          { name: 'Jan Jansen', revenue: 1250, orders: 8 },
          { name: 'Maria de Vries', revenue: 980, orders: 6 },
          { name: 'Piet Bakker', revenue: 875, orders: 5 },
        ],
        chartData: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 2000) + 1000,
          orders: Math.floor(Math.random() * 15) + 5,
        })),
      }

      setReportData(mockData)
      setSelectedReport(report)
      setIsLoading(false)
    } catch (error) {
      console.error('Error generating report:', error)
      setIsLoading(false)
    }
  }

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    // Simulate export
    alert(`${format.toUpperCase()} rapport wordt gedownload...`)
  }

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'sales':
        return DollarSign
      case 'products':
        return Package
      case 'customers':
        return Users
      case 'inventory':
        return Package
      case 'marketing':
        return TrendingUp
      case 'subscriptions':
        return Users
      default:
        return FileText
    }
  }

  const getTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'sales':
        return 'bg-blue-100 text-blue-800'
      case 'products':
        return 'bg-green-100 text-green-800'
      case 'customers':
        return 'bg-purple-100 text-purple-800'
      case 'inventory':
        return 'bg-orange-100 text-orange-800'
      case 'marketing':
        return 'bg-pink-100 text-pink-800'
      case 'subscriptions':
        return 'bg-teal-100 text-teal-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading && !reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Rapporten laden...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rapporten</h1>
              <p className="text-gray-600 mt-1">Genereer en beheer rapporten</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowNewReportModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nieuw Rapport
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('templates')}
              className={cn(
                'px-4 py-2 font-medium text-sm border-b-2 transition-colors',
                activeTab === 'templates'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={cn(
                'px-4 py-2 font-medium text-sm border-b-2 transition-colors',
                activeTab === 'custom'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              Custom Rapporten
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                'px-4 py-2 font-medium text-sm border-b-2 transition-colors',
                activeTab === 'history'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              Geschiedenis
            </button>
          </div>
        </div>

        {/* Report Preview */}
        {reportData && selectedReport && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedReport.name}</h2>
                <p className="text-gray-600 mt-1">Periode: {reportData.period}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setReportData(null)
                    setSelectedReport(null)
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Sluiten
                </Button>
                <Button
                  onClick={() => exportReport('pdf')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
                <Button
                  onClick={() => exportReport('excel')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Excel
                </Button>
                <Button
                  onClick={() => exportReport('csv')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>

            {/* Report Content */}
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-sm text-gray-600 mb-1">Omzet</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(reportData.revenue)}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-gray-600 mb-1">Bestellingen</div>
                  <div className="text-2xl font-bold text-gray-900">{reportData.orders}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-gray-600 mb-1">Klanten</div>
                  <div className="text-2xl font-bold text-gray-900">{reportData.customers}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-gray-600 mb-1">Gem. Orderwaarde</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(reportData.averageOrderValue)}
                  </div>
                </Card>
              </div>

              {/* Top Products */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Producten</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Verkopen</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Omzet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.topProducts.map((product, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{product.sales}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            {formatPrice(product.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Categories */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Categorieën</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Categorie</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Omzet</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Bestellingen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.topCategories.map((category, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{category.name}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            {formatPrice(category.revenue)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{category.orders}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Reports List */}
        {!reportData && (
          <Card className="p-6">
            {/* Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-4 flex-wrap">
                {/* Search */}
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Zoek rapporten..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as ReportType)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Alle types</option>
                  <option value="sales">Sales</option>
                  <option value="products">Producten</option>
                  <option value="customers">Klanten</option>
                  <option value="inventory">Voorraad</option>
                  <option value="marketing">Marketing</option>
                  <option value="subscriptions">Abonnementen</option>
                  <option value="custom">Custom</option>
                </select>

                {/* Date Range */}
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-gray-600">tot</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  Geen rapporten gevonden
                </div>
              ) : (
                filteredReports.map((report) => {
                  const TypeIcon = getTypeIcon(report.type)
                  
                  return (
                    <Card key={report.id} className="p-5 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn('p-2 rounded-lg', getTypeColor(report.type))}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!report.isTemplate && (
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{report.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <Badge className={getTypeColor(report.type)}>
                          {report.type}
                        </Badge>
                        <Badge  className="capitalize">
                          {report.format}
                        </Badge>
                        {report.schedule && report.schedule !== 'none' && (
                          <Badge  className="capitalize">
                            {report.schedule}
                          </Badge>
                        )}
                      </div>
                      {report.lastGenerated && (
                        <div className="text-xs text-gray-500 mb-4">
                          Laatst gegenereerd: {formatDate(report.lastGenerated)}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => generateReport(report)}
                          className="flex-1"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Genereren...
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Genereer
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => exportReport(report.format)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
