'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Facebook,
  Instagram,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Eye,
  MousePointerClick,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Filter,
  Download,
  Plus,
  Edit,
  Pause,
  Play,
  Search
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface Campaign {
  id: string
  name: string
  platform: 'facebook' | 'instagram'
  status: 'active' | 'paused' | 'ended'
  budget: number
  spend: number
  reach: number
  impressions: number
  clicks: number
  engagements: number
  ctr: number
  cpc: number
  roas: number
  startDate: string
  endDate?: string
}

export default function AdminMetaPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }

    loadCampaigns()
  }, [router])

  const loadCampaigns = async () => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock campaigns
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Rozen - Facebook Feed',
          platform: 'facebook',
          status: 'active',
          budget: 2000,
          spend: 1850,
          reach: 125000,
          impressions: 150000,
          clicks: 8500,
          engagements: 12000,
          ctr: 5.7,
          cpc: 0.22,
          roas: 4.2,
          startDate: '2024-01-01',
        },
        {
          id: '2',
          name: 'Boeketten - Instagram Stories',
          platform: 'instagram',
          status: 'active',
          budget: 1500,
          spend: 1200,
          reach: 95000,
          impressions: 120000,
          clicks: 4200,
          engagements: 8500,
          ctr: 3.5,
          cpc: 0.29,
          roas: 3.8,
          startDate: '2024-01-15',
        },
        {
          id: '3',
          name: 'Kerst - Facebook Carousel',
          platform: 'facebook',
          status: 'paused',
          budget: 1000,
          spend: 950,
          reach: 65000,
          impressions: 80000,
          clicks: 2800,
          engagements: 4200,
          ctr: 3.5,
          cpc: 0.34,
          roas: 4.5,
          startDate: '2024-11-01',
          endDate: '2024-12-31',
        },
      ]

      setCampaigns(mockCampaigns)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading campaigns:', error)
      setIsLoading(false)
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filterStatus !== 'all' && campaign.status !== filterStatus) return false
    if (filterPlatform !== 'all' && campaign.platform !== filterPlatform) return false
    if (searchQuery && !campaign.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const totalStats = campaigns.reduce((acc, campaign) => ({
    spend: acc.spend + campaign.spend,
    clicks: acc.clicks + campaign.clicks,
    impressions: acc.impressions + campaign.impressions,
    engagements: acc.engagements + campaign.engagements,
  }), { spend: 0, clicks: 0, impressions: 0, engagements: 0 })

  const avgCtr = campaigns.length > 0 
    ? campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length 
    : 0
  const avgCpc = campaigns.length > 0 
    ? totalStats.spend / totalStats.clicks 
    : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Campagnes laden...</p>
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
                <Facebook className="h-6 w-6" />
                <div>
                  <h1 className="text-2xl font-bold">META (Facebook/Instagram)</h1>
                  <p className="text-primary-100 text-sm mt-1">
                    Beheer Facebook en Instagram advertenties
                  </p>
                </div>
              </div>
            </div>
            <Button className="bg-white text-primary-600 hover:bg-primary-50">
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Campagne
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Totaal Uitgaven</p>
                  <p className="text-2xl font-bold text-gray-900">€{totalStats.spend.toLocaleString('nl-NL')}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Totaal Klikken</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.clicks.toLocaleString('nl-NL')}</p>
                </div>
                <MousePointerClick className="h-8 w-8 text-primary-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Engagements</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.engagements.toLocaleString('nl-NL')}</p>
                </div>
                <Heart className="h-8 w-8 text-primary-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gemiddelde CTR</p>
                  <p className="text-2xl font-bold text-gray-900">{avgCtr.toFixed(2)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary-500" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Zoek campagnes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="all">Alle statussen</option>
                  <option value="active">Actief</option>
                  <option value="paused">Gepauzeerd</option>
                  <option value="ended">Beëindigd</option>
                </select>
              </div>
              <div>
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="all">Alle platforms</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Campaigns Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campagne
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uitgaven
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bereik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klikken
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CTR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ROAS
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                        Geen campagnes gevonden.
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(campaign.startDate).toLocaleDateString('nl-NL')}
                              {campaign.endDate && ` - ${new Date(campaign.endDate).toLocaleDateString('nl-NL')}`}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {campaign.platform === 'facebook' ? (
                              <Facebook className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Instagram className="h-4 w-4 text-pink-600" />
                            )}
                            <span className="text-sm text-gray-900 capitalize">{campaign.platform}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {campaign.status === 'active' ? (
                            <Badge variant="success">Actief</Badge>
                          ) : campaign.status === 'paused' ? (
                            <Badge variant="warning">Gepauzeerd</Badge>
                          ) : (
                            <Badge variant="default" className="bg-gray-100 text-gray-800">Beëindigd</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">€{campaign.spend.toLocaleString('nl-NL')}</div>
                            <div className="text-xs text-gray-500">van €{campaign.budget.toLocaleString('nl-NL')}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{campaign.reach.toLocaleString('nl-NL')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{campaign.clicks.toLocaleString('nl-NL')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {campaign.ctr > 5 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm text-gray-900">{campaign.ctr}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{campaign.roas.toFixed(1)}x</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Bewerk campagne"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {campaign.status === 'active' ? (
                              <button
                                className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                                title="Pauzeer campagne"
                              >
                                <Pause className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                title="Hervat campagne"
                              >
                                <Play className="h-4 w-4" />
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
        </div>
      </div>
    </div>
  )
}
