'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Card from '@/components/ui/Card'
import { TrendingUp, DollarSign, Calendar, BarChart3, Loader2, Download } from 'lucide-react'

interface MonthlyBreakdownItem {
  maand: number
  land: string
  landCode: string
  bestellingen: number
  brutoOmzet: number
  nettoOmzet: number
  btw: number
  shipping: number
  korting: number
  refundsBedrag: number
  refundsAantal: number
  items: number
  avgOrder: number
}

interface OmzetData {
  totalRevenue: number
  netRevenue?: number
  totalRefunds?: number
  averagePerMonth: number
  highestMonth: number
  highestAmount: number
  monthlyRevenue: Record<number, number>
  monthlyRefunds?: Record<number, number>
  orderCount: number
  monthlyBreakdown?: MonthlyBreakdownItem[]
}

export default function OmzetOudeShopPage() {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [data, setData] = useState<OmzetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countryFilter, setCountryFilter] = useState<'all' | 'NL' | 'BE'>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Add timeout to the fetch request (5 minutes - increased for large datasets)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 300000)
        
        const url = new URL('/api/omzet-oude-shop', window.location.origin)
        if (countryFilter !== 'all') {
          url.searchParams.append('country', countryFilter)
        }
        
        const response = await fetch(url.toString(), {
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || errorData.details || 'Failed to fetch revenue data')
        }
        
        const omzetData = await response.json()
        
        // Check if response contains an error
        if (omzetData.error) {
          throw new Error(omzetData.error + (omzetData.details ? `: ${omzetData.details}` : ''))
        }
        
        setData(omzetData)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setError('Request timeout: Het ophalen van de data duurt te lang. Probeer het later opnieuw.')
        } else {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [countryFilter])

  const currentYearTotal = data?.totalRevenue || 0
  const monthlyBreakdown = data?.monthlyRevenue || {}

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
      'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
    ]
    return months[month - 1]
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('nl-NL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const exportToCSV = () => {
    if (!data?.monthlyBreakdown || data.monthlyBreakdown.length === 0) {
      alert('Geen data beschikbaar om te exporteren')
      return
    }

    // CSV headers
    const headers = [
      'Maand',
      'Land',
      'Bestellingen',
      'Bruto Omzet',
      'Netto Omzet',
      'BTW',
      'Shipping',
      'Korting',
      'Refunds Bedrag',
      'Refunds Aantal',
      'Items',
      'Avg. Order'
    ]

    // Convert data to CSV rows
    const rows = data.monthlyBreakdown.map(item => [
      getMonthName(item.maand),
      item.land,
      item.bestellingen.toString(),
      item.brutoOmzet.toFixed(2).replace('.', ','),
      item.nettoOmzet.toFixed(2).replace('.', ','),
      item.btw.toFixed(2).replace('.', ','),
      item.shipping.toFixed(2).replace('.', ','),
      item.korting.toFixed(2).replace('.', ','),
      item.refundsBedrag.toFixed(2).replace('.', ','),
      item.refundsAantal.toString(),
      item.items.toString(),
      item.avgOrder.toFixed(2).replace('.', ',')
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n')

    // Add BOM for Excel compatibility
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `omzet-oude-shop-2025-${countryFilter === 'all' ? 'alle-landen' : countryFilter}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getGrowthPercentage = (year: number) => {
    // Geen groei percentage voor 2025 (enige jaar)
    return 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <AdminSidebar />
          <div className="flex-1 ml-64">
            <div className="container mx-auto px-4 py-8">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
                  <p className="text-gray-600">Data laden...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || (!loading && !data)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <AdminSidebar />
          <div className="flex-1 ml-64">
            <div className="container mx-auto px-4 py-8">
              <Card className="p-6 bg-red-50 border-red-200">
                <h2 className="text-lg font-semibold text-red-800 mb-2">Fout bij laden van omzet data</h2>
                <p className="text-red-700 mb-4">
                  {error || 'Kon omzet data niet laden'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Opnieuw proberen
                </button>
                <p className="text-sm text-red-600 mt-4">
                  Tip: Als dit probleem blijft bestaan, controleer de server logs of probeer de test endpoint: <code className="bg-red-100 px-2 py-1 rounded">/api/test-woocommerce</code>
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-orange-600" />
            Omzet Oude Shop
          </h1>
          <p className="text-gray-600">
            Overzicht van de omzet van de oude webshop voor vergelijking met nieuwe initiatieven
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {data.orderCount} bestellingen verwerkt
          </p>
        </div>

        {/* Year and Country Filter */}
        <Card className="p-6 mb-6 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Jaar:</label>
              <span className="text-lg font-semibold text-gray-900">2025</span>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Land:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCountryFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    countryFilter === 'all'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Alle
                </button>
                <button
                  onClick={() => setCountryFilter('NL')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    countryFilter === 'NL'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Nederland
                </button>
                <button
                  onClick={() => setCountryFilter('BE')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    countryFilter === 'BE'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  België
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Yearly Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Totaal 2025</h3>
              <DollarSign className="h-6 w-6 opacity-80" />
            </div>
            <p className="text-3xl font-bold mb-2">{formatCurrency(currentYearTotal)}</p>
            <p className="text-sm opacity-80">{data.orderCount} bestellingen</p>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Gemiddeld per maand</h3>
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(data.averagePerMonth)}
            </p>
            <p className="text-sm text-gray-600">Gemiddeld per maand</p>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Hoogste maand</h3>
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            {data.highestMonth > 0 && (
              <>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(data.highestAmount)}
                </p>
                <p className="text-sm text-gray-600">
                  {getMonthName(data.highestMonth)}
                </p>
              </>
            )}
          </Card>
        </div>

        {/* Monthly Breakdown */}
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Maandelijks overzicht 2025</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(monthlyBreakdown)
              .filter(([_, amount]) => amount > 0)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([month, amount]) => {
                const monthNum = parseInt(month)
                const isSelected = selectedMonth === monthNum
                return (
                  <button
                    key={month}
                    onClick={() => setSelectedMonth(isSelected ? null : monthNum)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 shadow-md'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">{getMonthName(monthNum)}</div>
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(amount)}</div>
                    {currentYearTotal > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {((amount / currentYearTotal) * 100).toFixed(1)}% van totaal
                      </div>
                    )}
                  </button>
                )
              })}
          </div>
        </Card>

        {/* Detailed Monthly Breakdown Table */}
        {data.monthlyBreakdown && data.monthlyBreakdown.length > 0 && (
          <Card className="p-6 bg-white mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Gedetailleerd overzicht per maand en land</h2>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Exporteer naar CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maand</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Land</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bestellingen</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bruto Omzet</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Netto Omzet</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">BTW</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Korting</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Refunds Bedrag</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Refunds Aantal</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Order</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.monthlyBreakdown
                    .sort((a, b) => {
                      // Sort by month first, then by country (NL, BE, other)
                      if (a.maand !== b.maand) return a.maand - b.maand
                      const countryOrder: Record<string, number> = { NL: 1, BE: 2, other: 3 }
                      return (countryOrder[a.landCode] || 99) - (countryOrder[b.landCode] || 99)
                    })
                    .map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {getMonthName(item.maand)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {item.land}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                          {formatNumber(item.bestellingen)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                          {formatCurrency(item.brutoOmzet)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                          {formatCurrency(item.nettoOmzet)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                          {formatCurrency(item.btw)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                          {formatCurrency(item.shipping)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                          {formatCurrency(item.korting)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                          {formatCurrency(item.refundsBedrag)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                          {formatNumber(item.refundsAantal)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                          {formatNumber(item.items)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                          {formatCurrency(item.avgOrder)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

          </div>
        </div>
      </div>
    </div>
  )
}
