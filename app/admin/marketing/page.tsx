'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  TrendingUp,
  BarChart3,
  DollarSign,
  Users,
  Eye,
  MousePointerClick,
  Calendar,
  Target,
  ArrowRight,
  Search,
  Facebook,
  Instagram,
  Music,
  Calendar as CalendarIcon
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface MarketingStats {
  totalSpend: number
  totalClicks: number
  totalImpressions: number
  totalConversions: number
  ctr: number
  cpc: number
  roas: number
}

interface PlatformStats {
  name: string
  spend: number
  clicks: number
  impressions: number
  conversions: number
  ctr: number
  cpc: number
  roas: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  href: string
}

export default function AdminMarketingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<MarketingStats>({
    totalSpend: 0,
    totalClicks: 0,
    totalImpressions: 0,
    totalConversions: 0,
    ctr: 0,
    cpc: 0,
    roas: 0,
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

    loadMarketingData()
  }, [router])

  const loadMarketingData = async () => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock data
      setStats({
        totalSpend: 12500,
        totalClicks: 45000,
        totalImpressions: 1250000,
        totalConversions: 850,
        ctr: 3.6,
        cpc: 0.28,
        roas: 4.2,
      })
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading marketing data:', error)
      setIsLoading(false)
    }
  }

  const platformStats: PlatformStats[] = [
    {
      name: 'Google Adwords',
      spend: 6500,
      clicks: 25000,
      impressions: 800000,
      conversions: 450,
      ctr: 3.1,
      cpc: 0.26,
      roas: 4.5,
      icon: Search,
      color: 'text-blue-600',
      href: '/admin/marketing/google-adwords',
    },
    {
      name: 'Organisch (SEO)',
      spend: 0,
      clicks: 12000,
      impressions: 250000,
      conversions: 280,
      ctr: 4.8,
      cpc: 0,
      roas: 0,
      icon: TrendingUp,
      color: 'text-green-600',
      href: '/admin/marketing/organisch',
    },
    {
      name: 'META (Facebook/Instagram)',
      spend: 4500,
      clicks: 15000,
      impressions: 150000,
      conversions: 200,
      ctr: 10.0,
      cpc: 0.30,
      roas: 3.8,
      icon: Facebook,
      color: 'text-blue-500',
      href: '/admin/marketing/meta',
    },
  {
    name: 'TikTok',
    spend: 1500,
    clicks: 3000,
    impressions: 50000,
    conversions: 120,
    ctr: 6.0,
    cpc: 0.50,
    roas: 3.2,
    icon: Music,
    color: 'text-black',
    href: '/admin/marketing/tiktok',
  },
  {
    name: 'Content Kalender',
    spend: 0,
    clicks: 0,
    impressions: 0,
    conversions: 0,
    ctr: 0,
    cpc: 0,
    roas: 0,
    icon: CalendarIcon,
    color: 'text-purple-600',
    href: '/admin/marketing/content-kalender',
  },
]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Marketing data laden...</p>
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
              <h1 className="text-2xl font-bold">Marketing</h1>
              <p className="text-primary-100 text-sm mt-1">
                Overzicht van alle marketing kanalen en campagnes
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Totaal Uitgaven</p>
                  <p className="text-2xl font-bold text-gray-900">€{stats.totalSpend.toLocaleString('nl-NL')}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Totaal Klikken</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClicks.toLocaleString('nl-NL')}</p>
                </div>
                <MousePointerClick className="h-8 w-8 text-primary-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Conversies</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalConversions.toLocaleString('nl-NL')}</p>
                </div>
                <Target className="h-8 w-8 text-primary-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">ROAS</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.roas.toFixed(1)}x</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary-500" />
              </div>
            </Card>
          </div>

          {/* Platform Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platformStats.map((platform) => {
              const Icon = platform.icon
              return (
                <Link key={platform.name} href={platform.href}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 bg-gray-100 rounded-lg ${platform.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{platform.name}</h3>
                          {platform.spend > 0 ? (
                            <p className="text-sm text-gray-600">€{platform.spend.toLocaleString('nl-NL')} uitgegeven</p>
                          ) : (
                            <p className="text-sm text-gray-600">Gratis verkeer</p>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Klikken</p>
                        <p className="text-sm font-semibold text-gray-900">{platform.clicks.toLocaleString('nl-NL')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Impressies</p>
                        <p className="text-sm font-semibold text-gray-900">{platform.impressions.toLocaleString('nl-NL')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Conversies</p>
                        <p className="text-sm font-semibold text-gray-900">{platform.conversions}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">CTR</p>
                        <p className="text-sm font-semibold text-gray-900">{platform.ctr}%</p>
                      </div>
                    </div>

                    {platform.spend > 0 && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">CPC</p>
                            <p className="text-sm font-semibold text-gray-900">€{platform.cpc.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">ROAS</p>
                            <p className="text-sm font-semibold text-gray-900">{platform.roas.toFixed(1)}x</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
