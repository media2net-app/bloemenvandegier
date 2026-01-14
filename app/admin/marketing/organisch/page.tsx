'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  TrendingUp,
  Search,
  Globe,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Eye,
  MousePointerClick,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface Keyword {
  keyword: string
  position: number
  previousPosition: number
  clicks: number
  impressions: number
  ctr: number
  change: number
}

interface PagePerformance {
  page: string
  url: string
  clicks: number
  impressions: number
  ctr: number
  avgPosition: number
  change: number
}

export default function AdminOrganischPage() {
  const router = useRouter()
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [pages, setPages] = useState<PagePerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }

    loadOrganischData()
  }, [router, timeRange])

  const loadOrganischData = async () => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock keywords
      const mockKeywords: Keyword[] = [
        { keyword: 'rozen kopen', position: 3, previousPosition: 5, clicks: 1250, impressions: 45000, ctr: 2.8, change: 2 },
        { keyword: 'bloemen bezorgen', position: 1, previousPosition: 2, clicks: 3200, impressions: 85000, ctr: 3.8, change: 1 },
        { keyword: 'boeket bestellen', position: 4, previousPosition: 6, clicks: 980, impressions: 32000, ctr: 3.1, change: 2 },
        { keyword: 'online bloemen', position: 2, previousPosition: 3, clicks: 2100, impressions: 65000, ctr: 3.2, change: 1 },
        { keyword: 'rozen bezorgen', position: 5, previousPosition: 8, clicks: 750, impressions: 28000, ctr: 2.7, change: 3 },
      ]

      // Mock pages
      const mockPages: PagePerformance[] = [
        { page: 'Homepage', url: '/', clicks: 8500, impressions: 250000, ctr: 3.4, avgPosition: 2.1, change: 0.3 },
        { page: 'Rozen', url: '/rozen', clicks: 4200, impressions: 120000, ctr: 3.5, avgPosition: 3.2, change: -0.5 },
        { page: 'Boeketten', url: '/boeketten', clicks: 3800, impressions: 98000, ctr: 3.9, avgPosition: 4.1, change: 0.8 },
        { page: 'Product: Roze Rozen XXL', url: '/product/roze-rozen-xxl', clicks: 1250, impressions: 35000, ctr: 3.6, avgPosition: 5.2, change: 1.2 },
        { page: 'Voorjaarsbloemen', url: '/categorie/voorjaarsbloemen', clicks: 2100, impressions: 65000, ctr: 3.2, avgPosition: 3.8, change: -0.2 },
      ]

      setKeywords(mockKeywords)
      setPages(mockPages)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading organisch data:', error)
      setIsLoading(false)
    }
  }

  const totalClicks = keywords.reduce((sum, k) => sum + k.clicks, 0)
  const totalImpressions = keywords.reduce((sum, k) => sum + k.impressions, 0)
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const avgPosition = keywords.length > 0 
    ? keywords.reduce((sum, k) => sum + k.position, 0) / keywords.length 
    : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">SEO data laden...</p>
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
            <div className="flex items-center gap-4">
              <Link href="/admin/marketing">
                <button className="p-2 hover:bg-primary-500 rounded-lg transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6" />
                <div>
                  <h1 className="text-2xl font-bold">Organisch (SEO)</h1>
                  <p className="text-primary-100 text-sm mt-1">
                    Zoekmachine optimalisatie en organisch verkeer
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/50 outline-none"
              >
                <option value="7d">Laatste 7 dagen</option>
                <option value="30d">Laatste 30 dagen</option>
                <option value="90d">Laatste 90 dagen</option>
              </select>
              <Button variant="outline" className="bg-white text-primary-600 hover:bg-primary-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Totaal Klikken</p>
                  <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString('nl-NL')}</p>
                </div>
                <MousePointerClick className="h-8 w-8 text-primary-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Totaal Impressies</p>
                  <p className="text-2xl font-bold text-gray-900">{totalImpressions.toLocaleString('nl-NL')}</p>
                </div>
                <Eye className="h-8 w-8 text-primary-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gemiddelde CTR</p>
                  <p className="text-2xl font-bold text-gray-900">{avgCtr.toFixed(2)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gem. Positie</p>
                  <p className="text-2xl font-bold text-gray-900">{avgPosition.toFixed(1)}</p>
                </div>
                <Search className="h-8 w-8 text-primary-500" />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Keywords */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Top Zoekwoorden</h2>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Gratis verkeer
                </Badge>
              </div>
              <div className="space-y-4">
                {keywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{keyword.keyword}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>Positie: {keyword.position}</span>
                            <span className="flex items-center gap-1">
                              {keyword.change > 0 ? (
                                <>
                                  <ArrowUp className="h-3 w-3 text-green-600" />
                                  <span className="text-green-600">+{keyword.change}</span>
                                </>
                              ) : (
                                <>
                                  <ArrowDown className="h-3 w-3 text-red-600" />
                                  <span className="text-red-600">{keyword.change}</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{keyword.clicks.toLocaleString('nl-NL')}</p>
                      <p className="text-xs text-gray-500">klikken</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Pages */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Top Pagina's</h2>
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {pages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{page.page}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>Positie: {page.avgPosition.toFixed(1)}</span>
                            <span className="flex items-center gap-1">
                              {page.change > 0 ? (
                                <>
                                  <ArrowUp className="h-3 w-3 text-green-600" />
                                  <span className="text-green-600">+{page.change}</span>
                                </>
                              ) : (
                                <>
                                  <ArrowDown className="h-3 w-3 text-red-600" />
                                  <span className="text-red-600">{page.change}</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{page.clicks.toLocaleString('nl-NL')}</p>
                      <p className="text-xs text-gray-500">klikken</p>
                    </div>
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
