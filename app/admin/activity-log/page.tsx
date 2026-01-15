'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Activity, 
  Filter,
  Search,
  Download,
  User,
  Package,
  ShoppingCart,
  Edit,
  Trash2,
  Settings,
  Mail,
  Calendar,
  Clock,
  ChevronDown
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'

interface ActivityItem {
  id: string
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'email'
  entity: 'product' | 'order' | 'customer' | 'subscription' | 'category' | 'user' | 'system'
  entityId?: string
  entityName: string
  user: string
  timestamp: string
  details?: string
  changes?: Array<{ field: string; oldValue: string; newValue: string }>
  ipAddress?: string
}

type FilterAction = 'all' | 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'email'
type FilterEntity = 'all' | 'product' | 'order' | 'customer' | 'subscription' | 'category' | 'user' | 'system'
type FilterUser = 'all' | string

export default function AdminActivityLogPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<FilterAction>('all')
  const [entityFilter, setEntityFilter] = useState<FilterEntity>('all')
  const [userFilter, setUserFilter] = useState<FilterUser>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }

    loadActivities()
  }, [router])

  const loadActivities = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      // Mock activity data
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          action: 'create',
          entity: 'order',
          entityId: 'ORD1234',
          entityName: 'Order #1234',
          user: 'Sam de Gier',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          details: 'Nieuwe bestelling aangemaakt',
          ipAddress: '192.168.1.100',
        },
        {
          id: '2',
          action: 'update',
          entity: 'product',
          entityId: '123',
          entityName: 'Rode Rozen',
          user: 'Chiel',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          details: 'Product bijgewerkt',
          changes: [
            { field: 'Prijs', oldValue: '€39.95', newValue: '€34.95' },
            { field: 'Voorraad', oldValue: '10', newValue: '25' },
          ],
          ipAddress: '192.168.1.101',
        },
        {
          id: '3',
          action: 'delete',
          entity: 'product',
          entityId: '456',
          entityName: 'Oude Product',
          user: 'Sam de Gier',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          details: 'Product verwijderd',
          ipAddress: '192.168.1.100',
        },
        {
          id: '4',
          action: 'update',
          entity: 'order',
          entityId: 'ORD1234',
          entityName: 'Order #1234',
          user: 'Sam de Gier',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          details: 'Order status bijgewerkt',
          changes: [
            { field: 'Status', oldValue: 'pending', newValue: 'processing' },
          ],
          ipAddress: '192.168.1.100',
        },
        {
          id: '5',
          action: 'export',
          entity: 'order',
          entityName: 'Bestellingen export',
          user: 'Chiel',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          details: '250 bestellingen geëxporteerd naar CSV',
          ipAddress: '192.168.1.101',
        },
        {
          id: '6',
          action: 'email',
          entity: 'order',
          entityId: 'ORD1234',
          entityName: 'Order #1234',
          user: 'Sam de Gier',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          details: 'Email verzonden naar klant',
          ipAddress: '192.168.1.100',
        },
        {
          id: '7',
          action: 'create',
          entity: 'customer',
          entityId: 'CUST789',
          entityName: 'Nieuwe Klant',
          user: 'System',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          details: 'Nieuwe klant geregistreerd',
          ipAddress: '192.168.1.50',
        },
        {
          id: '8',
          action: 'login',
          entity: 'user',
          entityName: 'Sam de Gier',
          user: 'Sam de Gier',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          details: 'Inloggen succesvol',
          ipAddress: '192.168.1.100',
        },
        {
          id: '9',
          action: 'update',
          entity: 'subscription',
          entityId: 'SUB001',
          entityName: 'Abonnement #001',
          user: 'Chiel',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          details: 'Abonnement gepauzeerd',
          changes: [
            { field: 'Status', oldValue: 'active', newValue: 'paused' },
          ],
          ipAddress: '192.168.1.101',
        },
        {
          id: '10',
          action: 'create',
          entity: 'category',
          entityId: 'CAT123',
          entityName: 'Zomerbloemen',
          user: 'Sam de Gier',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          details: 'Nieuwe categorie aangemaakt',
          ipAddress: '192.168.1.100',
        },
      ]

      setActivities(mockActivities)
      setFilteredActivities(mockActivities)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading activities:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let filtered = activities

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(a =>
        a.entityName.toLowerCase().includes(query) ||
        a.user.toLowerCase().includes(query) ||
        a.details?.toLowerCase().includes(query) ||
        a.entityId?.toLowerCase().includes(query)
      )
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(a => a.action === actionFilter)
    }

    // Entity filter
    if (entityFilter !== 'all') {
      filtered = filtered.filter(a => a.entity === entityFilter)
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(a => a.user === userFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
      }
      filtered = filtered.filter(a => new Date(a.timestamp) >= filterDate)
    }

    setFilteredActivities(filtered)
  }, [searchQuery, actionFilter, entityFilter, userFilter, dateFilter, activities])

  const getActionIcon = (action: ActivityItem['action']) => {
    switch (action) {
      case 'create':
        return Package
      case 'update':
        return Edit
      case 'delete':
        return Trash2
      case 'login':
      case 'logout':
        return User
      case 'export':
        return Download
      case 'email':
        return Mail
      default:
        return Activity
    }
  }

  const getActionColor = (action: ActivityItem['action']) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800'
      case 'update':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
        return 'bg-red-100 text-red-800'
      case 'login':
        return 'bg-purple-100 text-purple-800'
      case 'logout':
        return 'bg-gray-100 text-gray-800'
      case 'export':
        return 'bg-yellow-100 text-yellow-800'
      case 'email':
        return 'bg-teal-100 text-teal-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEntityIcon = (entity: ActivityItem['entity']) => {
    switch (entity) {
      case 'product':
        return Package
      case 'order':
        return ShoppingCart
      case 'customer':
        return User
      case 'subscription':
        return User
      case 'category':
        return Package
      case 'user':
        return User
      default:
        return Activity
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
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const uniqueUsers = Array.from(new Set(activities.map(a => a.user)))

  const stats = {
    total: activities.length,
    today: activities.filter(a => {
      const date = new Date(a.timestamp)
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }).length,
    thisWeek: activities.filter(a => {
      const date = new Date(a.timestamp)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return date >= weekAgo
    }).length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Activity log laden...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
              <p className="text-gray-600 mt-1">Overzicht van alle admin acties en wijzigingen</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const csv = [
                  ['Tijd', 'Actie', 'Entity', 'Entity ID', 'Entity Naam', 'Gebruiker', 'Details', 'IP Adres'].join(','),
                  ...filteredActivities.map(a => [
                    new Date(a.timestamp).toLocaleString('nl-NL'),
                    a.action,
                    a.entity,
                    a.entityId || '',
                    `"${a.entityName}"`,
                    a.user,
                    `"${a.details || ''}"`,
                    a.ipAddress || ''
                  ].join(','))
                ].join('\n')
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`
                a.click()
                window.URL.revokeObjectURL(url)
              }}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Totaal Acties</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Vandaag</div>
            <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Deze Week</div>
            <div className="text-2xl font-bold text-green-600">{stats.thisWeek}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              {/* Search */}
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Zoek in activity log..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Filter */}
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value as FilterAction)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Alle acties</option>
                <option value="create">Aanmaken</option>
                <option value="update">Bijwerken</option>
                <option value="delete">Verwijderen</option>
                <option value="login">Inloggen</option>
                <option value="logout">Uitloggen</option>
                <option value="export">Export</option>
                <option value="email">Email</option>
              </select>

              {/* Entity Filter */}
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value as FilterEntity)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Alle entities</option>
                <option value="product">Product</option>
                <option value="order">Bestelling</option>
                <option value="customer">Klant</option>
                <option value="subscription">Abonnement</option>
                <option value="category">Categorie</option>
                <option value="user">Gebruiker</option>
                <option value="system">Systeem</option>
              </select>

              {/* User Filter */}
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value as FilterUser)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Alle gebruikers</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Alle tijd</option>
                <option value="today">Vandaag</option>
                <option value="week">Deze week</option>
                <option value="month">Deze maand</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Activity List */}
        <Card className="p-6">
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Geen activiteiten gevonden
              </div>
            ) : (
              filteredActivities.map((activity) => {
                const ActionIcon = getActionIcon(activity.action)
                const EntityIcon = getEntityIcon(activity.entity)
                
                return (
                  <div
                    key={activity.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn('p-2 rounded-lg', getActionColor(activity.action))}>
                        <ActionIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <EntityIcon className="h-4 w-4 text-gray-400" />
                              <span className="font-semibold text-gray-900">{activity.entityName}</span>
                              <Badge className={cn('text-xs', getActionColor(activity.action))}>
                                {activity.action}
                              </Badge>
                              <Badge className="text-xs capitalize">
                                {activity.entity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{activity.details}</p>
                          </div>
                          <div className="text-xs text-gray-500 text-right">
                            <div>{formatDate(activity.timestamp)}</div>
                            {activity.ipAddress && (
                              <div className="mt-1">IP: {activity.ipAddress}</div>
                            )}
                          </div>
                        </div>
                        {activity.changes && activity.changes.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs font-semibold text-gray-600 mb-2">Wijzigingen:</div>
                            <div className="space-y-1">
                              {activity.changes.map((change, index) => (
                                <div key={index} className="text-xs text-gray-700">
                                  <span className="font-medium">{change.field}:</span>{' '}
                                  <span className="text-red-600 line-through">{change.oldValue}</span>{' '}
                                  →{' '}
                                  <span className="text-green-600">{change.newValue}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-2 text-xs text-gray-500">
                          Door: <span className="font-medium">{activity.user}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
