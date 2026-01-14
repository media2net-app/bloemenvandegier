'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, Package, Users, TrendingUp, ShoppingCart, Settings, Shield, Truck, Sun, Moon, Printer, FileText, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import AdminSidebar from '@/components/admin/AdminSidebar'

interface TodayOrder {
  id: string
  deliveryDate: string
  deliveryTime: 'day' | 'evening'
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
}

export default function AdminDashboard() {
  const router = useRouter()
  const [todayDayOrders, setTodayDayOrders] = useState(0)
  const [todayEveningOrders, setTodayEveningOrders] = useState(0)

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

  // Mock stats
  const stats = [
    { label: 'Totaal Bestellingen', value: '1,234', icon: ShoppingCart, color: 'text-primary-600' },
    { label: 'Actieve Klanten', value: '892', icon: Users, color: 'text-primary-600' },
    { label: 'Producten', value: '156', icon: Package, color: 'text-primary-600' },
    { label: 'Maand Omzet', value: '€45,678', icon: TrendingUp, color: 'text-primary-600' },
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
                <Shield className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">Admin Dashboard</span>
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
        </header>

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 bg-primary-100 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

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

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recente bestellingen</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Bestelling #{1000 + i}</p>
                    <p className="text-sm text-gray-600">€{49.95 + i * 10}</p>
                  </div>
                  <span className="text-sm text-primary-600 font-medium">Nieuw</span>
                </div>
              ))}
            </div>
          </Card>

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
        </main>
      </div>
    </div>
  )
}
