'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Image,
  Video,
  FileText,
  Link as LinkIcon,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface ContentItem {
  id: string
  title: string
  type: 'post' | 'video' | 'image' | 'link'
  platform: 'facebook' | 'instagram' | 'tiktok' | 'website' | 'all'
  scheduledDate: string
  scheduledTime: string
  status: 'draft' | 'scheduled' | 'published' | 'cancelled'
  description?: string
  image?: string
  link?: string
  createdAt: string
}

const contentTypes = {
  post: { name: 'Post', icon: FileText, color: 'bg-blue-100 text-blue-600' },
  video: { name: 'Video', icon: Video, color: 'bg-red-100 text-red-600' },
  image: { name: 'Afbeelding', icon: Image, color: 'bg-green-100 text-green-600' },
  link: { name: 'Link', icon: LinkIcon, color: 'bg-purple-100 text-purple-600' },
}

const platforms = {
  facebook: { name: 'Facebook', color: 'bg-blue-500' },
  instagram: { name: 'Instagram', color: 'bg-pink-500' },
  tiktok: { name: 'TikTok', color: 'bg-black' },
  website: { name: 'Website', color: 'bg-green-500' },
  all: { name: 'Alle', color: 'bg-gray-500' },
}

export default function AdminContentKalenderPage() {
  const router = useRouter()
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [showNewItemModal, setShowNewItemModal] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '',
    type: 'post' as 'post' | 'video' | 'image' | 'link',
    platform: 'all' as 'facebook' | 'instagram' | 'tiktok' | 'website' | 'all',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '12:00',
    description: '',
    link: '',
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

    loadContentItems()
  }, [router])

  const loadContentItems = async () => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock content items
      const mockItems: ContentItem[] = [
        {
          id: '1',
          title: 'Nieuwe zomerbloemen collectie',
          type: 'post',
          platform: 'facebook',
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: '10:00',
          status: 'scheduled',
          description: 'Introduceer onze nieuwe zomerbloemen collectie met prachtige foto\'s',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          title: 'Moederdag promotie video',
          type: 'video',
          platform: 'instagram',
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: '14:00',
          status: 'scheduled',
          description: 'Video promotie voor Moederdag met speciale korting',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          title: 'TikTok bloemen arrangement tutorial',
          type: 'video',
          platform: 'tiktok',
          scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: '18:00',
          status: 'draft',
          description: 'Hoe maak je een prachtig bloemenarrangement',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          title: 'Blog: Tips voor langere bloemen',
          type: 'link',
          platform: 'website',
          scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: '09:00',
          status: 'scheduled',
          description: 'Link naar nieuwe blogpost over bloemen verzorging',
          link: 'https://www.bloemenvandegier.nl/blog/tips-langere-bloemen',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '5',
          title: 'Instagram carousel: Rozen collectie',
          type: 'image',
          platform: 'instagram',
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: '16:00',
          status: 'published',
          description: 'Carousel met verschillende rozen arrangementen',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '6',
          title: 'Facebook post: Klantreview',
          type: 'post',
          platform: 'facebook',
          scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: '11:00',
          status: 'scheduled',
          description: 'Deel een positieve klantreview op Facebook',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      setContentItems(mockItems)
      setFilteredItems(mockItems)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading content items:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let currentItems = [...contentItems]

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      currentItems = currentItems.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      currentItems = currentItems.filter(item => item.status === statusFilter)
    }

    // Apply platform filter
    if (platformFilter !== 'all') {
      currentItems = currentItems.filter(item => item.platform === platformFilter)
    }

    setFilteredItems(currentItems)
  }, [searchQuery, statusFilter, platformFilter, contentItems])

  const handleCreateItem = () => {
    if (!newItem.title.trim()) {
      alert('Titel is verplicht')
      return
    }

    const item: ContentItem = {
      id: Date.now().toString(),
      title: newItem.title,
      type: newItem.type,
      platform: newItem.platform,
      scheduledDate: newItem.scheduledDate,
      scheduledTime: newItem.scheduledTime,
      status: 'draft',
      description: newItem.description || undefined,
      link: newItem.link || undefined,
      createdAt: new Date().toISOString(),
    }

    setContentItems(prev => [item, ...prev])
    setNewItem({
      title: '',
      type: 'post',
      platform: 'all',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '12:00',
      description: '',
      link: '',
    })
    setShowNewItemModal(false)
    alert('Content item succesvol aangemaakt!')
  }

  const handleStatusChange = (itemId: string, newStatus: ContentItem['status']) => {
    setContentItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, status: newStatus } : item
    ))
  }

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Weet je zeker dat je dit content item wilt verwijderen?')) {
      setContentItems(prev => prev.filter(item => item.id !== itemId))
    }
  }

  const getStatusBadge = (status: ContentItem['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="default" className="bg-gray-100 text-gray-800">Concept</Badge>
      case 'scheduled':
        return <Badge variant="warning">Gepland</Badge>
      case 'published':
        return <Badge variant="success">Gepubliceerd</Badge>
      case 'cancelled':
        return <Badge variant="error">Geannuleerd</Badge>
    }
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const getItemsForDate = (day: number | null) => {
    if (day === null) return []
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const dateStr = new Date(year, month, day).toISOString().split('T')[0]
    return filteredItems.filter(item => item.scheduledDate === dateStr)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const stats = {
    total: contentItems.length,
    scheduled: contentItems.filter(i => i.status === 'scheduled').length,
    published: contentItems.filter(i => i.status === 'published').length,
    draft: contentItems.filter(i => i.status === 'draft').length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Content kalender laden...</p>
          </div>
        </div>
      </div>
    )
  }

  const monthDays = getMonthDays()
  const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December']
  const dayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']

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
                <Calendar className="h-6 w-6" />
                <div>
                  <h1 className="text-2xl font-bold">Content Kalender</h1>
                  <p className="text-primary-100 text-sm mt-1">
                    Plan en beheer je content publicaties
                  </p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setShowNewItemModal(true)}
              className="bg-white text-primary-600 hover:bg-primary-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nieuw Item
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
                  <p className="text-sm text-gray-600 mb-1">Totaal Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-primary-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gepland</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gepubliceerd</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Concept</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-gray-500" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Zoek content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="all">Alle statussen</option>
                  <option value="draft">Concept</option>
                  <option value="scheduled">Gepland</option>
                  <option value="published">Gepubliceerd</option>
                  <option value="cancelled">Geannuleerd</option>
                </select>
              </div>
              <div>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="all">Alle platforms</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="website">Website</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('month')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'month' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Maand
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'week' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Week
                </button>
              </div>
            </div>
          </Card>

          {/* Calendar View */}
          <Card className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Vandaag
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {monthDays.map((day, index) => {
                  const items = getItemsForDate(day)
                  const isToday = day !== null && 
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() === new Date().toDateString()

                  return (
                    <div
                      key={index}
                      className={`min-h-24 p-2 border border-gray-200 rounded-lg ${
                        day === null ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                      } ${isToday ? 'ring-2 ring-primary-500' : ''}`}
                    >
                      {day !== null && (
                        <>
                          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                            {day}
                          </div>
                          <div className="space-y-1">
                            {items.slice(0, 3).map(item => {
                              const TypeIcon = contentTypes[item.type].icon
                              const typeColor = contentTypes[item.type].color
                              const platformColor = platforms[item.platform].color

                              return (
                                <div
                                  key={item.id}
                                  className={`text-xs p-1 rounded ${typeColor} cursor-pointer hover:opacity-80`}
                                  title={item.title}
                                >
                                  <div className="flex items-center gap-1">
                                    <TypeIcon className="h-3 w-3" />
                                    <span className="truncate flex-1">{item.title}</span>
                                    <div className={`w-2 h-2 rounded-full ${platformColor}`}></div>
                                  </div>
                                </div>
                              )
                            })}
                            {items.length > 3 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{items.length - 3} meer
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Content Items List */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Alle Content Items</h2>
            <div className="space-y-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Geen content items gevonden.</p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const TypeIcon = contentTypes[item.type].icon
                  const typeColor = contentTypes[item.type].color
                  const platformColor = platforms[item.platform].color

                  return (
                    <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className={`p-3 rounded-lg ${typeColor}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          {getStatusBadge(item.status)}
                          <div className={`px-2 py-1 rounded text-xs text-white ${platformColor}`}>
                            {platforms[item.platform].name}
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(item.scheduledDate).toLocaleDateString('nl-NL')} om {item.scheduledTime}
                            </span>
                          </div>
                          {item.link && (
                            <div className="flex items-center gap-1">
                              <LinkIcon className="h-4 w-4" />
                              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                Link
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as ContentItem['status'])}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        >
                          <option value="draft">Concept</option>
                          <option value="scheduled">Gepland</option>
                          <option value="published">Gepubliceerd</option>
                          <option value="cancelled">Geannuleerd</option>
                        </select>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Verwijder item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* New Item Modal */}
      {showNewItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl m-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Nieuw Content Item</h2>
              <button
                onClick={() => setShowNewItemModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Trash2 className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titel *
                </label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Content titel..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value as ContentItem['type'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="post">Post</option>
                    <option value="video">Video</option>
                    <option value="image">Afbeelding</option>
                    <option value="link">Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform
                  </label>
                  <select
                    value={newItem.platform}
                    onChange={(e) => setNewItem(prev => ({ ...prev, platform: e.target.value as ContentItem['platform'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="all">Alle platforms</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="website">Website</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Geplande Datum *
                  </label>
                  <input
                    type="date"
                    value={newItem.scheduledDate}
                    onChange={(e) => setNewItem(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Geplande Tijd *
                  </label>
                  <input
                    type="time"
                    value={newItem.scheduledTime}
                    onChange={(e) => setNewItem(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschrijving
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Content beschrijving..."
                />
              </div>

              {newItem.type === 'link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link URL
                  </label>
                  <input
                    type="url"
                    value={newItem.link}
                    onChange={(e) => setNewItem(prev => ({ ...prev, link: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowNewItemModal(false)}
                  className="border-gray-300"
                >
                  Annuleren
                </Button>
                <Button
                  onClick={handleCreateItem}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  Item Aanmaken
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
