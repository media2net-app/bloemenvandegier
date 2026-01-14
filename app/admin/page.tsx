'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, Package, Users, TrendingUp, ShoppingCart, Settings, Shield, Truck, Sun, Moon, Printer, FileText, AlertCircle, Bell, Search, ArrowUp, ArrowDown, Minus, AlertTriangle, Target, X, Download, Calendar, Clock, MessageSquare, CheckSquare, Activity, HelpCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import AdminSidebar from '@/components/admin/AdminSidebar'

interface TodayOrder {
  id: string
  deliveryDate: string
  deliveryTime: 'day' | 'evening'
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
}

interface Stat {
  label: string
  value: string
  previousValue: string
  change: number
  changeType: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface Notification {
  id: string
  type: 'order' | 'message' | 'task' | 'stock' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  link?: string
}

interface LowStockProduct {
  id: string
  name: string
  stock: number
  minStock: number
  category: string
}

interface ActivityItem {
  id: string
  type: 'order' | 'customer' | 'message' | 'task' | 'product'
  title: string
  description: string
  timestamp: string
  user?: string
  link?: string
}

interface Task {
  id: string
  title: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  assignee: string
}

interface RecentMessage {
  id: string
  customer: string
  subject: string
  preview: string
  timestamp: string
  unread: boolean
  channel: 'whatsapp' | 'email' | 'phone'
}

interface TopProduct {
  id: string
  name: string
  sales: number
  revenue: number
}

interface UpcomingDelivery {
  id: string
  orderNumber: string
  customer: string
  date: string
  time: 'day' | 'evening'
  address: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [todayDayOrders, setTodayDayOrders] = useState(0)
  const [todayEveningOrders, setTodayEveningOrders] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [revenueGoal, setRevenueGoal] = useState({ target: 50000, current: 45678 })
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [pendingTasks, setPendingTasks] = useState<Task[]>([])
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<UpcomingDelivery[]>([])
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [sparklineData, setSparklineData] = useState<{ [key: string]: number[] }>({})

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }

    // Load today's orders
    loadTodayOrders()
    loadNotifications()
    loadLowStockProducts()
    loadRevenueGoal()
    loadActivities()
    loadPendingTasks()
    loadRecentMessages()
    loadTopProducts()
    loadUpcomingDeliveries()
    loadSparklineData()
    
    // Keyboard shortcut for search (Cmd/Ctrl + K) and shortcuts (?)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setShowShortcuts(true)
      }
      if (e.key === 'Escape') {
        setShowSearch(false)
        setShowNotifications(false)
        setShowShortcuts(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  const loadTodayOrders = async () => {
    try {
      // In a real app, this would be an API call
      // Mock data for today's orders
      const today = new Date().toISOString().split('T')[0]
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mock orders for today
      const mockTodayOrders: TodayOrder[] = [
        { id: '1', deliveryDate: today, deliveryTime: 'day', status: 'processing' },
        { id: '2', deliveryDate: today, deliveryTime: 'day', status: 'processing' },
        { id: '3', deliveryDate: today, deliveryTime: 'day', status: 'pending' },
        { id: '4', deliveryDate: today, deliveryTime: 'evening', status: 'processing' },
        { id: '5', deliveryDate: today, deliveryTime: 'evening', status: 'pending' },
        { id: '6', deliveryDate: today, deliveryTime: 'evening', status: 'pending' },
      ]

      const dayOrders = mockTodayOrders.filter(
        o => o.deliveryTime === 'day' && (o.status === 'pending' || o.status === 'processing')
      )
      const eveningOrders = mockTodayOrders.filter(
        o => o.deliveryTime === 'evening' && (o.status === 'pending' || o.status === 'processing')
      )

      setTodayDayOrders(dayOrders.length)
      setTodayEveningOrders(eveningOrders.length)
    } catch (error) {
      console.error('Error loading today orders:', error)
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_authenticated')
      localStorage.removeItem('admin_email')
    }
    router.push('/admin/login')
  }

  const handlePrintPackingSlips = () => {
    // In a real app, this would generate and print packing slips
    alert('Pakbonnen worden voorbereid voor printen...')
  }

  const handlePrintShippingLabels = () => {
    // In a real app, this would generate and print shipping labels
    alert('Verzendlabels worden voorbereid voor printen...')
  }

  const loadNotifications = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'order',
          title: 'Nieuwe bestelling',
          message: 'Bestelling #1234 ontvangen van Jan de Vries',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          read: false,
          link: '/admin/bestellingen/1234',
        },
        {
          id: '2',
          type: 'message',
          title: 'Nieuw bericht',
          message: 'Ongelezen bericht van Maria Smit',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          read: false,
          link: '/admin/berichten',
        },
        {
          id: '3',
          type: 'stock',
          title: 'Lage voorraad',
          message: '3 producten hebben lage voorraad',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          read: false,
          link: '/admin/producten?filter=low_stock',
        },
        {
          id: '4',
          type: 'task',
          title: 'Taak deadline',
          message: '2 taken hebben een deadline vandaag',
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
          read: true,
          link: '/admin/taken',
        },
      ]
      
      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const loadLowStockProducts = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const mockLowStock: LowStockProduct[] = [
        { id: '1', name: 'Rode Rozen', stock: 5, minStock: 20, category: 'Rozen' },
        { id: '2', name: 'Witte Rozen', stock: 8, minStock: 20, category: 'Rozen' },
        { id: '3', name: 'Gemengd Boeket', stock: 12, minStock: 25, category: 'Boeketten' },
      ]
      
      setLowStockProducts(mockLowStock)
    } catch (error) {
      console.error('Error loading low stock products:', error)
    }
  }

  const loadRevenueGoal = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      // Mock revenue goal data
      setRevenueGoal({ target: 50000, current: 45678 })
    } catch (error) {
      console.error('Error loading revenue goal:', error)
    }
  }

  const loadActivities = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'order',
          title: 'Nieuwe bestelling ontvangen',
          description: 'Bestelling #1234 van Jan de Vries - €49.95',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          user: 'Systeem',
          link: '/admin/bestellingen/1234',
        },
        {
          id: '2',
          type: 'customer',
          title: 'Nieuwe klant geregistreerd',
          description: 'Maria Smit heeft een account aangemaakt',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          user: 'Systeem',
          link: '/admin/klanten',
        },
        {
          id: '3',
          type: 'message',
          title: 'Nieuw bericht ontvangen',
          description: 'Bericht van Piet Bakker via WhatsApp',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          user: 'Sam',
          link: '/admin/berichten',
        },
        {
          id: '4',
          type: 'task',
          title: 'Taak voltooid',
          description: 'Productcategorie "Zomerbloemen" toegevoegd',
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          user: 'Chiel',
          link: '/admin/taken',
        },
        {
          id: '5',
          type: 'product',
          title: 'Product bijgewerkt',
          description: 'Rode Rozen - prijs aangepast naar €29.95',
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
          user: 'Sam',
          link: '/admin/producten',
        },
      ]
      setActivities(mockActivities)
    } catch (error) {
      console.error('Error loading activities:', error)
    }
  }

  const loadPendingTasks = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Nieuwe productcategorie toevoegen',
          status: 'in_progress',
          priority: 'high',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          assignee: 'Sam',
        },
        {
          id: '2',
          title: 'Website performance optimaliseren',
          status: 'todo',
          priority: 'medium',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          assignee: 'Chiel',
        },
        {
          id: '3',
          title: 'Marketing campagne voorbereiden',
          status: 'todo',
          priority: 'high',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          assignee: 'Sam',
        },
      ]
      setPendingTasks(mockTasks)
    } catch (error) {
      console.error('Error loading pending tasks:', error)
    }
  }

  const loadRecentMessages = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      const mockMessages: RecentMessage[] = [
        {
          id: '1',
          customer: 'Jan de Vries',
          subject: 'Vraag over bestelling #1234',
          preview: 'Wanneer wordt mijn bestelling bezorgd?',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          unread: true,
          channel: 'whatsapp',
        },
        {
          id: '2',
          customer: 'Maria Smit',
          subject: 'Product vraag',
          preview: 'Heeft u ook witte rozen beschikbaar?',
          timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
          unread: true,
          channel: 'email',
        },
        {
          id: '3',
          customer: 'Piet Bakker',
          subject: 'Bezorging annuleren',
          preview: 'Kan ik mijn bestelling nog annuleren?',
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          unread: false,
          channel: 'phone',
        },
      ]
      setRecentMessages(mockMessages)
    } catch (error) {
      console.error('Error loading recent messages:', error)
    }
  }

  const loadTopProducts = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      const mockTopProducts: TopProduct[] = [
        { id: '1', name: 'Rode Rozen', sales: 23, revenue: 687.85 },
        { id: '2', name: 'Plukboeket XL', sales: 18, revenue: 539.10 },
        { id: '3', name: 'Witte Rozen', sales: 15, revenue: 449.25 },
        { id: '4', name: 'Gemengd Boeket', sales: 12, revenue: 299.40 },
      ]
      setTopProducts(mockTopProducts)
    } catch (error) {
      console.error('Error loading top products:', error)
    }
  }

  const loadUpcomingDeliveries = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const mockDeliveries: UpcomingDelivery[] = [
        {
          id: '1',
          orderNumber: '#1234',
          customer: 'Jan de Vries',
          date: today.toISOString().split('T')[0],
          time: 'day',
          address: 'Hoofdstraat 123, Amsterdam',
        },
        {
          id: '2',
          orderNumber: '#1235',
          customer: 'Maria Smit',
          date: today.toISOString().split('T')[0],
          time: 'evening',
          address: 'Kerkstraat 45, Rotterdam',
        },
        {
          id: '3',
          orderNumber: '#1236',
          customer: 'Piet Bakker',
          date: tomorrow.toISOString().split('T')[0],
          time: 'day',
          address: 'Parkweg 78, Utrecht',
        },
      ]
      setUpcomingDeliveries(mockDeliveries)
    } catch (error) {
      console.error('Error loading upcoming deliveries:', error)
    }
  }

  const loadSparklineData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      // Generate 7-day sparkline data for each stat
      const generateSparkline = () => {
        return Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + 50)
      }
      setSparklineData({
        orders: generateSparkline(),
        customers: generateSparkline(),
        products: generateSparkline(),
        revenue: generateSparkline(),
      })
    } catch (error) {
      console.error('Error loading sparkline data:', error)
    }
  }

  const unreadNotificationsCount = notifications.filter(n => !n.read).length

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000)
    
    if (diffInMinutes < 1) return 'Zojuist'
    if (diffInMinutes < 60) return `${diffInMinutes} min geleden`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} uur geleden`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} dag${diffInDays > 1 ? 'en' : ''} geleden`
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order': return ShoppingCart
      case 'message': return FileText
      case 'task': return Settings
      case 'stock': return AlertTriangle
      case 'system': return AlertCircle
      default: return Bell
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-600'
      case 'message': return 'bg-purple-100 text-purple-600'
      case 'task': return 'bg-orange-100 text-orange-600'
      case 'stock': return 'bg-red-100 text-red-600'
      case 'system': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  // Mock stats with trends
  const stats: Stat[] = [
    { 
      label: 'Totaal Bestellingen', 
      value: '1,234', 
      previousValue: '1,180',
      change: 4.6,
      changeType: 'up',
      icon: ShoppingCart, 
      color: 'text-primary-600' 
    },
    { 
      label: 'Actieve Klanten', 
      value: '892', 
      previousValue: '856',
      change: 4.2,
      changeType: 'up',
      icon: Users, 
      color: 'text-primary-600' 
    },
    { 
      label: 'Producten', 
      value: '156', 
      previousValue: '156',
      change: 0,
      changeType: 'neutral',
      icon: Package, 
      color: 'text-primary-600' 
    },
    { 
      label: 'Maand Omzet', 
      value: '€45,678', 
      previousValue: '€42,350',
      change: 7.9,
      changeType: 'up',
      icon: TrendingUp, 
      color: 'text-primary-600' 
    },
  ]

  const quickActions = [
    { name: 'Producten beheren', href: '/admin/producten', icon: Package },
    { name: 'Bestellingen', href: '/admin/bestellingen', icon: ShoppingCart },
    { name: 'Klanten', href: '/admin/klanten', icon: Users },
    { name: 'Instellingen', href: '/admin/instellingen', icon: Settings },
  ]

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
                <Shield className="h-5 w-5 text-white flex-shrink-0" />
                <span className="font-semibold text-white whitespace-nowrap">Admin Dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Export Button */}
                <button
                  onClick={() => alert('Export opties worden geladen...')}
                  className="flex items-center gap-2 px-3 py-2 bg-primary-500 hover:bg-primary-400 rounded-lg transition-colors text-sm"
                  title="Export"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden md:inline">Export</span>
                </button>
                
                {/* Quick Search */}
                <button
                  onClick={() => setShowSearch(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-primary-500 hover:bg-primary-400 rounded-lg transition-colors text-sm"
                  title="Zoeken (Cmd/Ctrl + K)"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden md:inline">Zoeken</span>
                  <kbd className="hidden lg:inline px-1.5 py-0.5 bg-primary-400 rounded text-xs">⌘K</kbd>
                </button>
                
                {/* Keyboard Shortcuts */}
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="p-2 bg-primary-500 hover:bg-primary-400 rounded-lg transition-colors"
                  title="Keyboard Shortcuts (?)"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
                
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 bg-primary-500 hover:bg-primary-400 rounded-lg transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowNotifications(false)}
                      />
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                          <h3 className="font-bold text-gray-900">Notificaties</h3>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              Geen notificaties
                            </div>
                          ) : (
                            notifications.map((notification) => {
                              const Icon = getNotificationIcon(notification.type)
                              return (
                                <Link
                                  key={notification.id}
                                  href={notification.link || '#'}
                                  onClick={() => {
                                    markNotificationAsRead(notification.id)
                                    setShowNotifications(false)
                                  }}
                                  className={`block p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                      <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.timestamp)}</p>
                                    </div>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                    )}
                                  </div>
                                </Link>
                              )
                            })
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="p-3 border-t border-gray-200">
                            <Link
                              href="/admin/berichten"
                              className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                              onClick={() => setShowNotifications(false)}
                            >
                              Alle notificaties bekijken
                            </Link>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Uitloggen
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Search Modal */}
        {showSearch && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-50" 
              onClick={() => setShowSearch(false)}
            />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg shadow-2xl z-50">
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Zoek in producten, bestellingen, klanten, berichten..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-gray-900 placeholder-gray-400"
                  autoFocus
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {searchQuery ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 mb-2">Zoekresultaten voor "{searchQuery}"</p>
                    <div className="text-sm text-gray-500">
                      Zoekfunctionaliteit wordt geladen...
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm py-8">
                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Begin met typen om te zoeken...</p>
                    <p className="text-xs mt-2 text-gray-400">Gebruik Cmd/Ctrl + K om snel te zoeken</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welkom terug, Admin</h1>
            <p className="text-gray-600">Beheer je webshop en bekijk belangrijke statistieken</p>
          </div>

          {/* Today's Delivery Orders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Sun className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Daglevering Vandaag</h3>
                    <p className="text-sm text-gray-600">Nog te verwerken</p>
                  </div>
                </div>
                {todayDayOrders > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-bold text-lg">{todayDayOrders}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Bestellingen vandaag:</span>
                  <span className="text-3xl font-bold text-primary-600">{todayDayOrders}</span>
                </div>
                {todayDayOrders > 0 ? (
                  <Link href="/admin/bestellingen?filter=day&date=today">
                    <Button variant="outline" className="w-full mt-3 border-primary-500 text-primary-600 hover:bg-primary-50">
                      <Truck className="h-4 w-4 mr-2" />
                      Bekijk Bestellingen
                    </Button>
                  </Link>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">Geen bestellingen voor daglevering vandaag</p>
                )}
              </div>
            </Card>

            <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Moon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Avondlevering Vandaag</h3>
                    <p className="text-sm text-gray-600">Nog te verwerken</p>
                  </div>
                </div>
                {todayEveningOrders > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-bold text-lg">{todayEveningOrders}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Bestellingen vandaag:</span>
                  <span className="text-3xl font-bold text-purple-600">{todayEveningOrders}</span>
                </div>
                {todayEveningOrders > 0 ? (
                  <Link href="/admin/bestellingen?filter=evening&date=today">
                    <Button variant="outline" className="w-full mt-3 border-purple-500 text-purple-600 hover:bg-purple-50">
                      <Truck className="h-4 w-4 mr-2" />
                      Bekijk Bestellingen
                    </Button>
                  </Link>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">Geen bestellingen voor avondlevering vandaag</p>
                )}
              </div>
            </Card>
          </div>

        {/* Stats Grid with Trends and Sparklines */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const TrendIcon = stat.changeType === 'up' ? ArrowUp : stat.changeType === 'down' ? ArrowDown : Minus
            const trendColor = stat.changeType === 'up' ? 'text-green-600' : stat.changeType === 'down' ? 'text-red-600' : 'text-gray-600'
            const statKey = index === 0 ? 'orders' : index === 1 ? 'customers' : index === 2 ? 'products' : 'revenue'
            const sparkline = sparklineData[statKey] || []
            const maxValue = sparkline.length > 0 ? Math.max(...sparkline) : 100
            
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 bg-primary-100 rounded-full ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
                    <TrendIcon className="h-4 w-4" />
                    {stat.changeType !== 'neutral' && `${Math.abs(stat.change)}%`}
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">Vorige periode: {stat.previousValue}</p>
                </div>
                {/* Sparkline Chart */}
                {sparkline.length > 0 && (
                  <div className="h-12 w-full flex items-end gap-0.5">
                    {sparkline.map((value, i) => {
                      const height = (value / maxValue) * 100
                      return (
                        <div
                          key={i}
                          className="flex-1 bg-primary-200 rounded-t hover:bg-primary-400 transition-colors"
                          style={{ height: `${height}%` }}
                          title={`Dag ${i + 1}: ${value}`}
                        />
                      )
                    })}
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Revenue Goal Progress */}
        <Card className="p-6 mb-8 border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Target className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Maandelijks Omzet Doel</h3>
                <p className="text-sm text-gray-600">Doel: €{revenueGoal.target.toLocaleString('nl-NL')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">€{revenueGoal.current.toLocaleString('nl-NL')}</p>
              <p className="text-sm text-gray-600">
                {Math.round((revenueGoal.current / revenueGoal.target) * 100)}% voltooid
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-primary-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((revenueGoal.current / revenueGoal.target) * 100, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>€{revenueGoal.current.toLocaleString('nl-NL')} van €{revenueGoal.target.toLocaleString('nl-NL')}</span>
            <span className="font-medium text-primary-600">
              €{(revenueGoal.target - revenueGoal.current).toLocaleString('nl-NL')} te gaan
            </span>
          </div>
        </Card>

        {/* Low Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <Card className="p-6 mb-8 border-2 border-red-200 bg-red-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Lage Voorraad Waarschuwing</h3>
                  <p className="text-sm text-gray-600">{lowStockProducts.length} product{lowStockProducts.length > 1 ? 'en' : ''} met lage voorraad</p>
                </div>
              </div>
              <Link href="/admin/producten?filter=low_stock">
                <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
                  Bekijk Alle
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/producten/bewerken/${product.id}`}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200 hover:border-red-300 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{product.stock} op voorraad</p>
                    <p className="text-xs text-gray-500">Min: {product.minStock}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Snelle acties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <div className="p-2 bg-primary-100 rounded-lg">
                  <action.icon className="h-5 w-5 text-primary-600" />
                </div>
                <span className="font-medium text-gray-900">{action.name}</span>
              </Link>
            ))}
            <button
              onClick={handlePrintPackingSlips}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
            >
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <span className="font-medium text-gray-900">Pakbonnen vandaag printen</span>
            </button>
            <button
              onClick={handlePrintShippingLabels}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
            >
              <div className="p-2 bg-primary-100 rounded-lg">
                <Printer className="h-5 w-5 text-primary-600" />
              </div>
              <span className="font-medium text-gray-900">Verzendlabels vandaag printen</span>
            </button>
          </div>
        </Card>

        {/* Activity Feed and Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Timeline */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Laatste Activiteit</h2>
              <Link href="/admin/bestellingen" className="text-sm text-primary-600 hover:text-primary-700">
                Bekijk alle
              </Link>
            </div>
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const getActivityIcon = () => {
                  switch (activity.type) {
                    case 'order': return ShoppingCart
                    case 'customer': return Users
                    case 'message': return MessageSquare
                    case 'task': return CheckSquare
                    case 'product': return Package
                    default: return Activity
                  }
                }
                const getActivityColor = () => {
                  switch (activity.type) {
                    case 'order': return 'bg-blue-100 text-blue-600'
                    case 'customer': return 'bg-green-100 text-green-600'
                    case 'message': return 'bg-purple-100 text-purple-600'
                    case 'task': return 'bg-orange-100 text-orange-600'
                    case 'product': return 'bg-primary-100 text-primary-600'
                    default: return 'bg-gray-100 text-gray-600'
                  }
                }
                const Icon = getActivityIcon()
                return (
                  <Link
                    key={activity.id}
                    href={activity.link || '#'}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${getActivityColor()}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                        {activity.user && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{activity.user}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Card>

          {/* Pending Tasks Widget */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Urgente Taken</h2>
              <Link href="/admin/taken" className="text-sm text-primary-600 hover:text-primary-700">
                Bekijk alle
              </Link>
            </div>
            <div className="space-y-3">
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Geen urgente taken</p>
              ) : (
                pendingTasks.map((task) => {
                  const isUrgent = task.priority === 'high' || task.priority === 'urgent'
                  const isDueSoon = task.dueDate && new Date(task.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000)
                  return (
                    <Link
                      key={task.id}
                      href="/admin/taken"
                      className={`block p-3 rounded-lg border-2 transition-colors ${
                        isUrgent || isDueSoon
                          ? 'border-red-200 bg-red-50 hover:bg-red-100'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.priority}
                            </span>
                            <span className="text-xs text-gray-500">{task.assignee}</span>
                          </div>
                        </div>
                        {isDueSoon && (
                          <Clock className="h-4 w-4 text-red-600 flex-shrink-0" />
                        )}
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </Card>
        </div>

        {/* Recent Messages and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Messages */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recente Berichten</h2>
              <Link href="/admin/berichten" className="text-sm text-primary-600 hover:text-primary-700">
                Bekijk alle
              </Link>
            </div>
            <div className="space-y-3">
              {recentMessages.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Geen recente berichten</p>
              ) : (
                recentMessages.map((message) => (
                  <Link
                    key={message.id}
                    href="/admin/berichten"
                    className={`block p-3 rounded-lg border-2 transition-colors ${
                      message.unread
                        ? 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900">{message.customer}</p>
                          {message.unread && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-700 font-medium">{message.subject}</p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">{message.preview}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{formatTimeAgo(message.timestamp)}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 capitalize">{message.channel}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>

          {/* Top Products Today */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Top Producten Vandaag</h2>
              <Link href="/admin/producten" className="text-sm text-primary-600 hover:text-primary-700">
                Bekijk alle
              </Link>
            </div>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Geen verkopen vandaag</p>
              ) : (
                topProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/admin/producten/bewerken/${product.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sales} verkopen</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">€{product.revenue.toFixed(2)}</p>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Upcoming Deliveries and System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Deliveries Calendar */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Aankomende Leveringen</h2>
              <Link href="/admin/verzending" className="text-sm text-primary-600 hover:text-primary-700">
                Bekijk alle
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingDeliveries.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Geen aankomende leveringen</p>
              ) : (
                upcomingDeliveries.map((delivery) => {
                  const isToday = delivery.date === new Date().toISOString().split('T')[0]
                  return (
                    <Link
                      key={delivery.id}
                      href="/admin/verzending"
                      className={`block p-3 rounded-lg border-2 transition-colors ${
                        isToday
                          ? 'border-primary-200 bg-primary-50 hover:bg-primary-100'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900">{delivery.orderNumber}</p>
                            {isToday && (
                              <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded">
                                Vandaag
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">{delivery.customer}</p>
                          <p className="text-xs text-gray-600 mt-1">{delivery.address}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {new Date(delivery.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 capitalize">
                              {delivery.time === 'day' ? 'Dag' : 'Avond'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </Card>

          {/* System Status */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Systeem status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Website status</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Database</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Verbonden
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Laatste backup</span>
                <span className="text-sm text-gray-600">Vandaag 02:00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Versie</span>
                <span className="text-sm text-gray-600">v1.0.0</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Keyboard Shortcuts Modal */}
        {showShortcuts && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-50" 
              onClick={() => setShowShortcuts(false)}
            />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg shadow-2xl z-50">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h2>
                </div>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Navigatie</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">Zoeken</span>
                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">⌘K</kbd>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">Sluiten (modals)</span>
                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Esc</kbd>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">Shortcuts tonen</span>
                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">?</kbd>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Acties</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">Nieuwe bestelling</span>
                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">⌘N</kbd>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">Snel opslaan</span>
                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">⌘S</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        </main>
      </div>
    </div>
  )
}
