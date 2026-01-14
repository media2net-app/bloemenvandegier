'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Save,
  Settings,
  Mail,
  Truck,
  CreditCard,
  Globe,
  Shield,
  Bell,
  Image as ImageIcon,
  Store,
  FileText
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

type SettingsTab = 'general' | 'shipping' | 'payment' | 'email' | 'seo' | 'security' | 'notifications'

export default function AdminInstellingenPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Bloemen van De Gier',
    siteUrl: 'https://www.bloemenvandegier.nl',
    email: 'info@bloemenvandegier.nl',
    phone: '+31 528 123456',
    address: 'Industrieweg 8',
    postalCode: '7921 JP',
    city: 'Zuidwolde',
    country: 'Nederland',
    taxNumber: 'NL123456789B01',
    kvkNumber: '12345678',
  })

  // Shipping settings
  const [shippingSettings, setShippingSettings] = useState({
    standardCost: '4.95',
    freeShippingThreshold: '50.00',
    insuredDeliveryCost: '7.50',
    deliveryDays: ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
    cutoffTime: '23:59',
    deliveryTime: 'day',
    zones: [
      { name: 'Nederland', cost: '4.95', freeThreshold: '50.00' },
      { name: 'België', cost: '9.95', freeThreshold: '75.00' },
    ],
  })

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    methods: {
      ideal: { enabled: true, name: 'iDEAL' },
      creditcard: { enabled: true, name: 'Creditcard' },
      paypal: { enabled: false, name: 'PayPal' },
      banktransfer: { enabled: true, name: 'Bankoverschrijving' },
    },
    defaultMethod: 'ideal',
    invoiceEnabled: true,
  })

  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    fromName: 'Bloemen van De Gier',
    fromEmail: 'noreply@bloemenvandegier.nl',
    orderConfirmation: true,
    shippingNotification: true,
    deliveryReminder: true,
    newsletterEnabled: true,
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
  })

  // SEO settings
  const [seoSettings, setSeoSettings] = useState({
    metaTitle: 'Bloemen van De Gier - Verse Bloemen Online',
    metaDescription: 'Prachtige bloemen van topkwaliteit. Gegarandeerd meer bloemen voor je geld. 7 dagen versgarantie.',
    metaKeywords: 'bloemen, rozen, boeketten, online bloemen bestellen, bloemen bezorgen',
    ogImage: '/images/og-image.jpg',
    googleAnalytics: '',
    facebookPixel: '',
  })

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '60',
    passwordMinLength: '8',
    requireStrongPassword: true,
    loginAttempts: '5',
    lockoutDuration: '15',
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    newOrder: true,
    lowStock: true,
    paymentReceived: true,
    deliveryFailed: true,
    customerMessage: true,
    emailNotifications: true,
    pushNotifications: false,
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

    loadSettings()
  }, [router])

  const loadSettings = async () => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading settings:', error)
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Instellingen opgeslagen!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Er is een fout opgetreden bij het opslaan.')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'general', label: 'Algemeen', icon: Settings },
    { id: 'shipping', label: 'Verzending', icon: Truck },
    { id: 'payment', label: 'Betaling', icon: CreditCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'security', label: 'Beveiliging', icon: Shield },
    { id: 'notifications', label: 'Notificaties', icon: Bell },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Instellingen laden...</p>
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
              <h1 className="text-2xl font-bold">Instellingen</h1>
              <p className="text-primary-100 text-sm mt-1">
                Beheer webshop instellingen en configuratie
              </p>
            </div>
            <Button 
              onClick={handleSave}
              className="bg-white text-primary-600 hover:bg-primary-50"
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Opslaan...' : 'Opslaan'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              {/* General Settings */}
              {activeTab === 'general' && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Algemene Instellingen
                  </h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webshop Naam *
                        </label>
                        <input
                          type="text"
                          value={generalSettings.siteName}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website URL *
                        </label>
                        <input
                          type="url"
                          value={generalSettings.siteUrl}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, siteUrl: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Adres *
                        </label>
                        <input
                          type="email"
                          value={generalSettings.email}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefoonnummer
                        </label>
                        <input
                          type="tel"
                          value={generalSettings.phone}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adres
                      </label>
                      <input
                        type="text"
                        value={generalSettings.address}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none mb-2"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Postcode"
                          value={generalSettings.postalCode}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, postalCode: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Stad"
                          value={generalSettings.city}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, city: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Land"
                          value={generalSettings.country}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, country: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          BTW Nummer
                        </label>
                        <input
                          type="text"
                          value={generalSettings.taxNumber}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, taxNumber: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          KvK Nummer
                        </label>
                        <input
                          type="text"
                          value={generalSettings.kvkNumber}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, kvkNumber: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Shipping Settings */}
              {activeTab === 'shipping' && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Verzendinstellingen
                  </h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Standaard Verzendkosten (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={shippingSettings.standardCost}
                          onChange={(e) => setShippingSettings({ ...shippingSettings, standardCost: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gratis Verzending vanaf (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={shippingSettings.freeShippingThreshold}
                          onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Verzekerde Bezorging (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={shippingSettings.insuredDeliveryCost}
                          onChange={(e) => setShippingSettings({ ...shippingSettings, insuredDeliveryCost: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Besteltijd Cutoff
                        </label>
                        <input
                          type="time"
                          value={shippingSettings.cutoffTime}
                          onChange={(e) => setShippingSettings({ ...shippingSettings, cutoffTime: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">Bestellingen voor deze tijd worden de volgende dag bezorgd</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bezorgdagen
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'].map((day) => (
                            <label key={day} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                              <input
                                type="checkbox"
                                checked={shippingSettings.deliveryDays.includes(day)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setShippingSettings({
                                      ...shippingSettings,
                                      deliveryDays: [...shippingSettings.deliveryDays, day],
                                    })
                                  } else {
                                    setShippingSettings({
                                      ...shippingSettings,
                                      deliveryDays: shippingSettings.deliveryDays.filter(d => d !== day),
                                    })
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700 capitalize">{day}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Payment Settings */}
              {activeTab === 'payment' && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Betalingsinstellingen
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Beschikbare Betaalmethoden
                      </label>
                      <div className="space-y-3">
                        {Object.entries(paymentSettings.methods).map(([key, method]) => (
                          <label key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={method.enabled}
                                onChange={(e) => {
                                  setPaymentSettings({
                                    ...paymentSettings,
                                    methods: {
                                      ...paymentSettings.methods,
                                      [key]: { ...method, enabled: e.target.checked },
                                    },
                                  })
                                }}
                                className="rounded"
                              />
                              <span className="font-medium text-gray-900">{method.name}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Standaard Betaalmethode
                      </label>
                      <select
                        value={paymentSettings.defaultMethod}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, defaultMethod: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      >
                        {Object.entries(paymentSettings.methods)
                          .filter(([_, method]) => method.enabled)
                          .map(([key, method]) => (
                            <option key={key} value={key}>{method.name}</option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentSettings.invoiceEnabled}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, invoiceEnabled: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Factuur op rekening toestaan</span>
                      </label>
                    </div>
                  </div>
                </Card>
              )}

              {/* Email Settings */}
              {activeTab === 'email' && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Instellingen
                  </h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Afzender Naam
                        </label>
                        <input
                          type="text"
                          value={emailSettings.fromName}
                          onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Afzender Email
                        </label>
                        <input
                          type="email"
                          value={emailSettings.fromEmail}
                          onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Email Notificaties
                      </label>
                      <div className="space-y-3">
                        {[
                          { key: 'orderConfirmation', label: 'Bestelbevestiging naar klant' },
                          { key: 'shippingNotification', label: 'Verzendnotificatie naar klant' },
                          { key: 'deliveryReminder', label: 'Bezorgherinnering naar klant' },
                          { key: 'newsletterEnabled', label: 'Nieuwsbrief inschrijvingen toestaan' },
                        ].map((item) => (
                          <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={emailSettings[item.key as keyof typeof emailSettings] as boolean}
                              onChange={(e) => setEmailSettings({ ...emailSettings, [item.key]: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* SEO Settings */}
              {activeTab === 'seo' && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    SEO Instellingen
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Titel
                      </label>
                      <input
                        type="text"
                        value={seoSettings.metaTitle}
                        onChange={(e) => setSeoSettings({ ...seoSettings, metaTitle: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Beschrijving
                      </label>
                      <textarea
                        rows={3}
                        value={seoSettings.metaDescription}
                        onChange={(e) => setSeoSettings({ ...seoSettings, metaDescription: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        value={seoSettings.metaKeywords}
                        onChange={(e) => setSeoSettings({ ...seoSettings, metaKeywords: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Google Analytics ID
                        </label>
                        <input
                          type="text"
                          value={seoSettings.googleAnalytics}
                          onChange={(e) => setSeoSettings({ ...seoSettings, googleAnalytics: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          placeholder="G-XXXXXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Facebook Pixel ID
                        </label>
                        <input
                          type="text"
                          value={seoSettings.facebookPixel}
                          onChange={(e) => setSeoSettings({ ...seoSettings, facebookPixel: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Beveiligingsinstellingen
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings.twoFactorEnabled}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Twee-factor authenticatie inschakelen</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sessie Timeout (minuten)
                        </label>
                        <input
                          type="number"
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimale Wachtwoord Lengte
                        </label>
                        <input
                          type="number"
                          value={securitySettings.passwordMinLength}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Login Pogingen
                        </label>
                        <input
                          type="number"
                          value={securitySettings.loginAttempts}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, loginAttempts: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Blokkering Duur (minuten)
                        </label>
                        <input
                          type="number"
                          value={securitySettings.lockoutDuration}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, lockoutDuration: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings.requireStrongPassword}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, requireStrongPassword: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Sterk wachtwoord vereisen (hoofdletters, cijfers, symbolen)</span>
                      </label>
                    </div>
                  </div>
                </Card>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificatie Instellingen
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Admin Notificaties
                      </label>
                      <div className="space-y-3">
                        {[
                          { key: 'newOrder', label: 'Nieuwe bestelling' },
                          { key: 'lowStock', label: 'Lage voorraad' },
                          { key: 'paymentReceived', label: 'Betaling ontvangen' },
                          { key: 'deliveryFailed', label: 'Bezorging mislukt' },
                          { key: 'customerMessage', label: 'Klant bericht' },
                        ].map((item) => (
                          <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                              onChange={(e) => setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Notificatie Methoden
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">Email notificaties</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.pushNotifications}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">Push notificaties</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
