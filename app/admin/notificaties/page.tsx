'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Settings,
  Filter,
  Search,
  Download,
  Send,
  Clock,
  User,
  Package,
  ShoppingCart,
  TrendingDown,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Save
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'

interface Notification {
  id: string
  type: 'order' | 'stock' | 'customer' | 'system' | 'payment' | 'delivery'
  title: string
  message: string
  channel: 'email' | 'sms' | 'push' | 'in-app'
  status: 'sent' | 'pending' | 'failed' | 'draft'
  recipient: string
  createdAt: string
  sentAt?: string
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  metadata?: {
    orderId?: string
    productId?: string
    customerId?: string
  }
}

interface NotificationTemplate {
  id: string
  name: string
  type: Notification['type']
  channel: Notification['channel']
  subject: string
  body: string
  enabled: boolean
  variables: string[]
}

interface NotificationSettings {
  email: {
    enabled: boolean
    orderConfirmation: boolean
    shippingNotification: boolean
    stockAlert: boolean
    paymentReceived: boolean
  }
  sms: {
    enabled: boolean
    orderConfirmation: boolean
    shippingNotification: boolean
  }
  push: {
    enabled: boolean
    orderUpdates: boolean
    stockAlerts: boolean
  }
  inApp: {
    enabled: boolean
    allNotifications: boolean
  }
}

type FilterType = 'all' | 'order' | 'stock' | 'customer' | 'system' | 'payment' | 'delivery'
type FilterChannel = 'all' | 'email' | 'sms' | 'push' | 'in-app'
type FilterStatus = 'all' | 'sent' | 'pending' | 'failed' | 'draft'

export default function AdminNotificatiesPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'settings'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [channelFilter, setChannelFilter] = useState<FilterChannel>('all')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      orderConfirmation: true,
      shippingNotification: true,
      stockAlert: true,
      paymentReceived: true,
    },
    sms: {
      enabled: false,
      orderConfirmation: false,
      shippingNotification: false,
    },
    push: {
      enabled: true,
      orderUpdates: true,
      stockAlerts: true,
    },
    inApp: {
      enabled: true,
      allNotifications: true,
    },
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

    loadNotifications()
    loadTemplates()
  }, [router])

  const loadNotifications = async () => {
    try {
      // Mock notifications data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'order',
          title: 'Nieuwe bestelling ontvangen',
          message: 'Bestelling #1234 is ontvangen van Jan Jansen',
          channel: 'email',
          status: 'sent',
          recipient: 'jan.jansen@example.com',
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          sentAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          read: false,
          priority: 'high',
          metadata: { orderId: 'ORD1234' },
        },
        {
          id: '2',
          type: 'stock',
          title: 'Lage voorraad waarschuwing',
          message: 'Rode Rozen heeft nog 5 stuks op voorraad',
          channel: 'push',
          status: 'sent',
          recipient: 'Admin',
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          sentAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          read: true,
          priority: 'urgent',
          metadata: { productId: '123' },
        },
        {
          id: '3',
          type: 'payment',
          title: 'Betaling ontvangen',
          message: 'Betaling voor bestelling #1234 is ontvangen',
          channel: 'email',
          status: 'sent',
          recipient: 'jan.jansen@example.com',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          read: false,
          priority: 'medium',
          metadata: { orderId: 'ORD1234' },
        },
        {
          id: '4',
          type: 'delivery',
          title: 'Bezorging gepland',
          message: 'Bestelling #1234 wordt vandaag bezorgd tussen 14:00-18:00',
          channel: 'sms',
          status: 'sent',
          recipient: '+31 6 12345678',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'medium',
          metadata: { orderId: 'ORD1234' },
        },
        {
          id: '5',
          type: 'customer',
          title: 'Nieuwe klant geregistreerd',
          message: 'Maria de Vries heeft een account aangemaakt',
          channel: 'in-app',
          status: 'sent',
          recipient: 'Admin',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: 'low',
          metadata: { customerId: '456' },
        },
        {
          id: '6',
          type: 'system',
          title: 'Systeem backup voltooid',
          message: 'Dagelijkse backup is succesvol voltooid',
          channel: 'in-app',
          status: 'sent',
          recipient: 'Admin',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: 'low',
        },
        {
          id: '7',
          type: 'order',
          title: 'Bestelling geannuleerd',
          message: 'Bestelling #1235 is geannuleerd door klant',
          channel: 'email',
          status: 'pending',
          recipient: 'piet.bakker@example.com',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          read: false,
          priority: 'high',
          metadata: { orderId: 'ORD1235' },
        },
        {
          id: '8',
          type: 'stock',
          title: 'Product uitverkocht',
          message: 'Witte Rozen is nu uitverkocht',
          channel: 'email',
          status: 'failed',
          recipient: 'admin@bloemenvandegier.nl',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'urgent',
          metadata: { productId: '789' },
        },
      ]

      setNotifications(mockNotifications)
      setFilteredNotifications(mockNotifications)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading notifications:', error)
      setIsLoading(false)
    }
  }

  const loadTemplates = async () => {
    // Mock templates
    const mockTemplates: NotificationTemplate[] = [
      {
        id: '1',
        name: 'Order Bevestiging',
        type: 'order',
        channel: 'email',
        subject: 'Je bestelling bij Bloemen van De Gier',
        body: 'Beste {{customer_name}},\n\nBedankt voor je bestelling #{{order_number}}.\n\nTotaal: {{order_total}}\n\nWe houden je op de hoogte van de bezorging.',
        enabled: true,
        variables: ['customer_name', 'order_number', 'order_total'],
      },
      {
        id: '2',
        name: 'Bezorging Gepland',
        type: 'delivery',
        channel: 'sms',
        subject: '',
        body: 'Je bestelling #{{order_number}} wordt vandaag bezorgd tussen {{delivery_time}}.',
        enabled: true,
        variables: ['order_number', 'delivery_time'],
      },
      {
        id: '3',
        name: 'Lage Voorraad Alert',
        type: 'stock',
        channel: 'push',
        subject: '',
        body: '{{product_name}} heeft nog {{stock_quantity}} stuks op voorraad.',
        enabled: true,
        variables: ['product_name', 'stock_quantity'],
      },
    ]

    setTemplates(mockTemplates)
  }

  useEffect(() => {
    let filtered = notifications

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.recipient.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter)
    }

    // Channel filter
    if (channelFilter !== 'all') {
      filtered = filtered.filter(n => n.channel === channelFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(n => n.status === statusFilter)
    }

    setFilteredNotifications(filtered)
  }, [searchQuery, typeFilter, channelFilter, statusFilter, notifications])

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return ShoppingCart
      case 'stock':
        return Package
      case 'customer':
        return User
      case 'payment':
        return CheckCircle
      case 'delivery':
        return Package
      default:
        return AlertCircle
    }
  }

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-800'
      case 'stock':
        return 'bg-orange-100 text-orange-800'
      case 'customer':
        return 'bg-green-100 text-green-800'
      case 'payment':
        return 'bg-purple-100 text-purple-800'
      case 'delivery':
        return 'bg-teal-100 text-teal-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadge = (status: Notification['status']) => {
    switch (status) {
      case 'sent':
        return <Badge variant="success" className="bg-green-100 text-green-800">Verzonden</Badge>
      case 'pending':
        return <Badge variant="warning" className="bg-yellow-100 text-yellow-800">In wachtrij</Badge>
      case 'failed':
        return <Badge variant="error" className="bg-red-100 text-red-800">Mislukt</Badge>
      case 'draft':
        return <Badge variant="default" className="bg-gray-100 text-gray-800">Concept</Badge>
      default:
        return null
    }
  }

  const getChannelIcon = (channel: Notification['channel']) => {
    switch (channel) {
      case 'email':
        return Mail
      case 'sms':
        return MessageSquare
      case 'push':
        return Bell
      case 'in-app':
        return Eye
      default:
        return Bell
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Zojuist'
    if (minutes < 60) return `${minutes} min geleden`
    if (hours < 24) return `${hours} uur geleden`
    if (days < 7) return `${days} dagen geleden`
    return date.toLocaleDateString('nl-NL')
  }

  const stats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent').length,
    pending: notifications.filter(n => n.status === 'pending').length,
    failed: notifications.filter(n => n.status === 'failed').length,
    unread: notifications.filter(n => !n.read).length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Notificaties laden...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Notificaties</h1>
              <p className="text-gray-600 mt-1">Beheer alle notificaties en instellingen</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Instellingen
              </Button>
              <Button
                variant="primary"
                onClick={() => {/* TODO: Test notification */}}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Test Notificatie
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                'px-4 py-2 font-medium text-sm border-b-2 transition-colors',
                activeTab === 'overview'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              Overzicht
            </button>
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
              onClick={() => setActiveTab('settings')}
              className={cn(
                'px-4 py-2 font-medium text-sm border-b-2 transition-colors',
                activeTab === 'settings'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              Instellingen
            </button>
          </div>
        </div>

        {/* Stats */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-5 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">Totaal</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">Verzonden</div>
              <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">In wachtrij</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">Mislukt</div>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">Ongelezen</div>
              <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
            </Card>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
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
                      placeholder="Zoek notificaties..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as FilterType)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Alle types</option>
                  <option value="order">Bestelling</option>
                  <option value="stock">Voorraad</option>
                  <option value="customer">Klant</option>
                  <option value="payment">Betaling</option>
                  <option value="delivery">Bezorging</option>
                  <option value="system">Systeem</option>
                </select>

                {/* Channel Filter */}
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value as FilterChannel)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Alle kanalen</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push</option>
                  <option value="in-app">In-app</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Alle statussen</option>
                  <option value="sent">Verzonden</option>
                  <option value="pending">In wachtrij</option>
                  <option value="failed">Mislukt</option>
                  <option value="draft">Concept</option>
                </select>

                <Button
                  variant="secondary"
                  onClick={() => {/* TODO: Export */}}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Geen notificaties gevonden
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const TypeIcon = getTypeIcon(notification.type)
                  const ChannelIcon = getChannelIcon(notification.channel)
                  
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 border rounded-lg transition-colors',
                        notification.read ? 'bg-white' : 'bg-blue-50 border-blue-200'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn('p-2 rounded-lg', getTypeColor(notification.type))}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <ChannelIcon className="h-3 w-3" />
                              <span className="capitalize">{notification.channel}</span>
                            </div>
                            <span>Naar: {notification.recipient}</span>
                            <span>{formatDate(notification.createdAt)}</span>
                            {getStatusBadge(notification.status)}
                            <Badge className={cn('text-xs', getTypeColor(notification.type))}>
                              {notification.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {notification.metadata?.orderId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/bestellingen/${notification.metadata?.orderId?.replace('ORD', '')}`)}
                            >
                              Bekijk
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Notificatie Templates</h2>
              <Button
                variant="primary"
                onClick={() => {/* TODO: New template */}}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nieuwe Template
              </Button>
            </div>

            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Badge className={getTypeColor(template.type)}>
                          {template.type}
                        </Badge>
                        <Badge className="capitalize">
                          {template.channel}
                        </Badge>
                        {template.enabled ? (
                          <Badge className="bg-green-100 text-green-800">Actief</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Uitgeschakeld</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {template.channel === 'email' && (
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Onderwerp:</strong> {template.subject}
                    </div>
                  )}
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                    {template.body}
                  </div>
                  {template.variables.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Variabelen:</strong> {template.variables.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Notificatie Instellingen</h2>

            {/* Email Settings */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Email Notificaties</h3>
              </div>
              <div className="space-y-3 pl-7">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">Email notificaties inschakelen</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email.orderConfirmation}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, orderConfirmation: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    disabled={!settings.email.enabled}
                  />
                  <span className="text-gray-700">Order bevestiging</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email.shippingNotification}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, shippingNotification: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    disabled={!settings.email.enabled}
                  />
                  <span className="text-gray-700">Bezorging notificatie</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email.stockAlert}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, stockAlert: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    disabled={!settings.email.enabled}
                  />
                  <span className="text-gray-700">Voorraad waarschuwingen</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email.paymentReceived}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, paymentReceived: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    disabled={!settings.email.enabled}
                  />
                  <span className="text-gray-700">Betaling ontvangen</span>
                </label>
              </div>
            </div>

            {/* SMS Settings */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">SMS Notificaties</h3>
              </div>
              <div className="space-y-3 pl-7">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sms.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sms: { ...settings.sms, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">SMS notificaties inschakelen</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sms.orderConfirmation}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sms: { ...settings.sms, orderConfirmation: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    disabled={!settings.sms.enabled}
                  />
                  <span className="text-gray-700">Order bevestiging</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sms.shippingNotification}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sms: { ...settings.sms, shippingNotification: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    disabled={!settings.sms.enabled}
                  />
                  <span className="text-gray-700">Bezorging notificatie</span>
                </label>
              </div>
            </div>

            {/* Push Settings */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Push Notificaties</h3>
              </div>
              <div className="space-y-3 pl-7">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.push.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        push: { ...settings.push, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">Push notificaties inschakelen</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.push.orderUpdates}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        push: { ...settings.push, orderUpdates: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    disabled={!settings.push.enabled}
                  />
                  <span className="text-gray-700">Order updates</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.push.stockAlerts}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        push: { ...settings.push, stockAlerts: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    disabled={!settings.push.enabled}
                  />
                  <span className="text-gray-700">Voorraad waarschuwingen</span>
                </label>
              </div>
            </div>

            {/* In-App Settings */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">In-App Notificaties</h3>
              </div>
              <div className="space-y-3 pl-7">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.inApp.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        inApp: { ...settings.inApp, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">In-app notificaties inschakelen</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.inApp.allNotifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        inApp: { ...settings.inApp, allNotifications: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    disabled={!settings.inApp.enabled}
                  />
                  <span className="text-gray-700">Alle notificaties tonen</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  // TODO: Save settings
                  alert('Instellingen opgeslagen!')
                }}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Instellingen Opslaan
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
