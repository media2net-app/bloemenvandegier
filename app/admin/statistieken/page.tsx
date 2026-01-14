'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils/format'

type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'custom'

interface StatCard {
  label: string
  value: string
  change: number
  changeType: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface ChartData {
  date: string
  value: number
  label: string
}

interface TopItem {
  name: string
  value: number
  count?: number
}

export default function AdminStatistiekenPage() {
  const router = useRouter()
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<StatCard[]>([])
  const [revenueData, setRevenueData] = useState<ChartData[]>([])
  const [ordersData, setOrdersData] = useState<ChartData[]>([])
  const [topProducts, setTopProducts] = useState<TopItem[]>([])
  const [topCategories, setTopCategories] = useState<TopItem[]>([])
  const [topCustomers, setTopCustomers] = useState<TopItem[]>([])

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }

    loadStatistics()
  }, [router, timePeriod])

  const loadStatistics = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Generate mock data based on time period
      const mockStats: StatCard[] = [
        {
          label: 'Totale Omzet',
          value: formatPrice(getRandomValue(50000, 100000)),
          change: getRandomChange(),
          changeType: getRandomChangeType(),
          icon: DollarSign,
          color: 'text-green-600',
        },
        {
          label: 'Bestellingen',
          value: getRandomValue(500, 1500).toLocaleString(),
          change: getRandomChange(),
          changeType: getRandomChangeType(),
          icon: ShoppingCart,
          color: 'text-blue-600',
        },
        {
          label: 'Nieuwe Klanten',
          value: getRandomValue(50, 200).toLocaleString(),
          change: getRandomChange(),
          changeType: getRandomChangeType(),
          icon: Users,
          color: 'text-purple-600',
        },
        {
          label: 'Gemiddelde Orderwaarde',
          value: formatPrice(getRandomValue(45, 75)),
          change: getRandomChange(),
          changeType: getRandomChangeType(),
          icon: Package,
          color: 'text-orange-600',
        },
      ]

      // Generate chart data
      const days = timePeriod === 'today' ? 1 : timePeriod === 'week' ? 7 : timePeriod === 'month' ? 30 : 365
      const revenueChart: ChartData[] = []
      const ordersChart: ChartData[] = []

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
        
        revenueChart.push({
          date: dateStr,
          value: getRandomValue(1000, 5000),
          label: dateStr,
        })
        
        ordersChart.push({
          date: dateStr,
          value: getRandomValue(10, 50),
          label: dateStr,
        })
      }

      // Top products
      const mockTopProducts: TopItem[] = [
        { name: 'Boeket Rode Rozen', value: 12500, count: 312 },
        { name: 'Plukboeket XL', value: 9800, count: 245 },
        { name: 'Witte Rozen', value: 8750, count: 219 },
        { name: 'Gemengd Boeket', value: 7200, count: 180 },
        { name: 'Roze Rozen XXL', value: 6500, count: 163 },
      ]

      // Top categories
      const mockTopCategories: TopItem[] = [
        { name: 'Rozen', value: 45000, count: 1125 },
        { name: 'Boeketten', value: 38000, count: 950 },
        { name: 'Voorjaarsbloemen', value: 22000, count: 550 },
        { name: 'Kerst', value: 18000, count: 450 },
        { name: 'Groen & Decoratief', value: 15000, count: 375 },
      ]

      // Top customers
      const mockTopCustomers: TopItem[] = [
        { name: 'Jan Jansen', value: 1250, count: 12 },
        { name: 'Maria de Vries', value: 980, count: 8 },
        { name: 'Piet Bakker', value: 875, count: 7 },
        { name: 'Anna Smit', value: 720, count: 6 },
        { name: 'Kees van der Berg', value: 650, count: 5 },
      ]

      setStats(mockStats)
      setRevenueData(revenueChart)
      setOrdersData(ordersChart)
      setTopProducts(mockTopProducts)
      setTopCategories(mockTopCategories)
      setTopCustomers(mockTopCustomers)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading statistics:', error)
      setIsLoading(false)
    }
  }

  const getRandomValue = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const getRandomChange = () => {
    return Math.floor(Math.random() * 30) - 15 // -15% to +15%
  }

  const getRandomChangeType = (): 'up' | 'down' | 'neutral' => {
    const rand = Math.random()
    if (rand > 0.6) return 'up'
    if (rand > 0.3) return 'down'
    return 'neutral'
  }

  const getMaxValue = (data: ChartData[]) => {
    return Math.max(...data.map(d => d.value), 1)
  }

  const formatPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'today':
        return 'Vandaag'
      case 'week':
        return 'Deze Week'
      case 'month':
        return 'Deze Maand'
      case 'year':
        return 'Dit Jaar'
      case 'custom':
        return 'Aangepast'
      default:
        return 'Deze Maand'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Statistieken laden...</p>
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
              <h1 className="text-2xl font-bold">Statistieken</h1>
              <p className="text-primary-100 text-sm mt-1">
                Overzicht van webshop prestaties en analytics
              </p>
            </div>
            <Button className="bg-white text-primary-600 hover:bg-primary-50">
              <Download className="h-4 w-4 mr-2" />
              Export Rapport
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Time Period Selector */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Tijdperiode:</span>
              </div>
              <div className="flex gap-2">
                {(['today', 'week', 'month', 'year'] as TimePeriod[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      timePeriod === period
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {formatPeriodLabel(period)}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-gray-100 rounded-lg ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      stat.changeType === 'up' ? 'text-green-600' :
                      stat.changeType === 'down' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {stat.changeType === 'up' && <ArrowUp className="h-4 w-4" />}
                      {stat.changeType === 'down' && <ArrowDown className="h-4 w-4" />}
                      {stat.changeType === 'neutral' && <Minus className="h-4 w-4" />}
                      {Math.abs(stat.change)}%
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Omzet Trend</h3>
                  <p className="text-sm text-gray-600">{formatPeriodLabel(timePeriod)}</p>
                </div>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-64 flex items-end justify-between gap-2">
                {revenueData.map((data, index) => {
                  const maxValue = getMaxValue(revenueData)
                  const height = (data.value / maxValue) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-t-lg relative group">
                        <div
                          className="bg-primary-600 rounded-t-lg transition-all hover:bg-primary-700"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                            {formatPrice(data.value.toFixed(2))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left whitespace-nowrap">
                        {data.date}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Orders Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Bestellingen Trend</h3>
                  <p className="text-sm text-gray-600">{formatPeriodLabel(timePeriod)}</p>
                </div>
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-64 flex items-end justify-between gap-2">
                {ordersData.map((data, index) => {
                  const maxValue = getMaxValue(ordersData)
                  const height = (data.value / maxValue) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-t-lg relative group">
                        <div
                          className="bg-blue-600 rounded-t-lg transition-all hover:bg-blue-700"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                            {data.value} bestellingen
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left whitespace-nowrap">
                        {data.date}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Top Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Products */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Top Producten</h3>
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.count} verkopen</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{formatPrice(product.value.toFixed(2))}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Categories */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Top Categorieën</h3>
                <PieChart className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {topCategories.map((category, index) => {
                  const total = topCategories.reduce((sum, c) => sum + c.value, 0)
                  const percentage = (category.value / total) * 100
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{category.name}</p>
                            <p className="text-xs text-gray-500">{category.count} producten</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{formatPrice(category.value.toFixed(2))}</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Top Customers */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Top Klanten</h3>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.count} bestellingen</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{formatPrice(customer.value.toFixed(2))}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
