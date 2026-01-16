'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Trash2,
  TrendingUp,
  DollarSign,
  Calculator,
  Target,
  BarChart3,
  Save,
  FileText,
  X
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'

interface MarketSegment {
  id: string
  name: string
  description: string
  numberOfCustomers: number
  averageOrderValue: number
  ordersPerYear: number
}

interface Scenario {
  id: string
  name: string
  segments: MarketSegment[]
  createdAt: string
}

const BASELINE_REVENUE = 1100000 // €1.1 miljoen

const DEFAULT_SEGMENTS: MarketSegment[] = [
  {
    id: 'middelbare-scholen-valentijn',
    name: 'Middelbare Scholen - Valentijn',
    description: 'Valentijn campagne voor middelbare scholen',
    numberOfCustomers: 200, // Realistisch: 200 van ~650 middelbare scholen in NL
    averageOrderValue: 750,
    ordersPerYear: 1
  },
  {
    id: 'middelbare-scholen-docentendag',
    name: 'Middelbare Scholen - Docentendag',
    description: 'Docentendag bloemen',
    numberOfCustomers: 150,
    averageOrderValue: 600,
    ordersPerYear: 1
  },
  {
    id: 'middelbare-scholen-afscheid',
    name: 'Middelbare Scholen - Afscheid 6e klas',
    description: 'Afscheid 6e klas arrangementen',
    numberOfCustomers: 100,
    averageOrderValue: 1000,
    ordersPerYear: 1
  },
  {
    id: 'kantoren-wekelijks',
    name: 'Kantoren - Wekelijkse Bloemen',
    description: 'Receptie/ontvangst wekelijks',
    numberOfCustomers: 15,
    averageOrderValue: 150,
    ordersPerYear: 52
  },
  {
    id: 'kantoren-maandelijks',
    name: 'Kantoren - Maandelijks Arrangement',
    description: 'Maandelijks bloemstuk',
    numberOfCustomers: 25,
    averageOrderValue: 200,
    ordersPerYear: 12
  },
  {
    id: 'zorginstellingen-wekelijks',
    name: 'Zorginstellingen - Wekelijks',
    description: 'Verzorgingstehuizen wekelijks',
    numberOfCustomers: 8,
    averageOrderValue: 100,
    ordersPerYear: 52
  },
  {
    id: 'restaurants-wekelijks',
    name: 'Restaurants - Wekelijks',
    description: 'Tafelarrangementen wekelijks',
    numberOfCustomers: 12,
    averageOrderValue: 80,
    ordersPerYear: 52
  },
  {
    id: 'hotels-wekelijks',
    name: 'Hotels - Wekelijks',
    description: 'Lobby & kamers wekelijks',
    numberOfCustomers: 5,
    averageOrderValue: 200,
    ordersPerYear: 52
  },
  {
    id: 'evenementen-bruiloften',
    name: 'Evenementen - Bruiloften',
    description: 'Bruiloft decoratie',
    numberOfCustomers: 30,
    averageOrderValue: 2000,
    ordersPerYear: 1
  },
  {
    id: 'evenementen-bedrijfsfeesten',
    name: 'Evenementen - Bedrijfsfeesten',
    description: 'Bedrijfsfeest decoratie',
    numberOfCustomers: 20,
    averageOrderValue: 1500,
    ordersPerYear: 1
  },
  {
    id: 'begrafenisondernemers',
    name: 'Begrafenisondernemers',
    description: 'Rouwkransen & boeketten',
    numberOfCustomers: 3,
    averageOrderValue: 300,
    ordersPerYear: 24
  },
  {
    id: 'winkels-retail',
    name: 'Winkels - Retail',
    description: 'Winkeldecoratie maandelijks',
    numberOfCustomers: 10,
    averageOrderValue: 250,
    ordersPerYear: 12
  }
]

export default function OmzetGeneratorPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [segments, setSegments] = useState<MarketSegment[]>(DEFAULT_SEGMENTS)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [scenarioName, setScenarioName] = useState('')
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('admin_authenticated')
      setIsAuthenticated(!!auth)
      if (!auth) {
        router.push('/admin/login')
      }

      // Load saved scenarios
      const saved = localStorage.getItem('omzet_scenarios')
      if (saved) {
        try {
          setScenarios(JSON.parse(saved))
        } catch (e) {
          console.error('Error loading scenarios:', e)
        }
      }
    }
  }, [router])

  const calculateSegmentRevenue = (segment: MarketSegment): number => {
    return segment.numberOfCustomers * segment.averageOrderValue * segment.ordersPerYear
  }

  const calculateTotalRevenue = (): number => {
    return segments.reduce((total, segment) => total + calculateSegmentRevenue(segment), 0)
  }

  const calculateNewTotalRevenue = (): number => {
    return BASELINE_REVENUE + calculateTotalRevenue()
  }

  const calculateGrowthPercentage = (): number => {
    const newRevenue = calculateNewTotalRevenue()
    return ((newRevenue - BASELINE_REVENUE) / BASELINE_REVENUE) * 100
  }

  const addSegment = () => {
    const newSegment: MarketSegment = {
      id: `segment-${Date.now()}`,
      name: '',
      description: '',
      numberOfCustomers: 0,
      averageOrderValue: 0,
      ordersPerYear: 1
    }
    setSegments([...segments, newSegment])
  }

  const removeSegment = (id: string) => {
    setSegments(segments.filter(s => s.id !== id))
  }

  const updateSegment = (id: string, updates: Partial<MarketSegment>) => {
    setSegments(segments.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const saveScenario = () => {
    if (!scenarioName.trim()) return

    const newScenario: Scenario = {
      id: `scenario-${Date.now()}`,
      name: scenarioName,
      segments: segments.map(s => ({ ...s })),
      createdAt: new Date().toISOString()
    }

    const updated = [...scenarios, newScenario]
    setScenarios(updated)
    localStorage.setItem('omzet_scenarios', JSON.stringify(updated))
    setShowSaveModal(false)
    setScenarioName('')
  }

  const loadScenario = (scenario: Scenario) => {
    setSegments(scenario.segments.map(s => ({ ...s })))
    setSelectedScenario(scenario.id)
  }

  const deleteScenario = (id: string) => {
    const updated = scenarios.filter(s => s.id !== id)
    setScenarios(updated)
    localStorage.setItem('omzet_scenarios', JSON.stringify(updated))
    if (selectedScenario === id) {
      setSelectedScenario(null)
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('nl-NL').format(num)
  }

  if (!isAuthenticated) {
    return null
  }

  const totalNewRevenue = calculateTotalRevenue()
  const newTotalRevenue = calculateNewTotalRevenue()
  const growthPercentage = calculateGrowthPercentage()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Omzet Generator Tool
            </h1>
            <p className="text-gray-600">
              Bereken groeimogelijkheden op basis van zakelijke markten en nieuwe ideeën
            </p>
          </div>

          {/* Baseline Revenue */}
          <Card className="p-6 mb-6 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Baseline Omzet 2025
                </h2>
                <p className="text-3xl font-bold text-primary-600">
                  {formatCurrency(BASELINE_REVENUE)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Nieuwe Omzet</p>
                <p className="text-3xl font-bold text-secondary-600">
                  {formatCurrency(newTotalRevenue)}
                </p>
              </div>
            </div>
          </Card>

          {/* Growth Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">Extra Omzet</h3>
              </div>
              <p className="text-2xl font-bold text-primary-600">
                {formatCurrency(totalNewRevenue)}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-secondary-600" />
                <h3 className="font-semibold text-gray-900">Groei Percentage</h3>
              </div>
              <p className="text-2xl font-bold text-secondary-600">
                {growthPercentage.toFixed(1)}%
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Totaal Omzet</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(newTotalRevenue)}
              </p>
            </Card>
          </div>

          {/* Market Segments */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Zakelijke Markt Segmenten
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Voeg zakelijke markten toe om groeimogelijkheden te berekenen
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Scenario Opslaan
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={addSegment}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Segment Toevoegen
                </Button>
              </div>
            </div>

            {/* Quick Add Suggestions */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">💡 Zakelijke Markt Kansen - Klik om toe te voegen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: 'Middelbare Scholen - Valentijn', desc: 'Valentijn campagne', avg: 750, orders: 1, customers: 200 },
                  { name: 'Middelbare Scholen - Docentendag', desc: 'Docentendag bloemen', avg: 600, orders: 1, customers: 150 },
                  { name: 'Middelbare Scholen - Afscheid', desc: 'Afscheid 6e klas', avg: 1000, orders: 1, customers: 100 },
                  { name: 'Kantoren - Wekelijkse Bloemen', desc: 'Receptie/ontvangst', avg: 150, orders: 52, customers: 15 },
                  { name: 'Kantoren - Maandelijks Arrangement', desc: 'Maandelijks bloemstuk', avg: 200, orders: 12, customers: 25 },
                  { name: 'Zorginstellingen - Wekelijks', desc: 'Verzorgingstehuizen', avg: 100, orders: 52, customers: 8 },
                  { name: 'Restaurants - Wekelijks', desc: 'Tafelarrangementen', avg: 80, orders: 52, customers: 12 },
                  { name: 'Hotels - Wekelijks', desc: 'Lobby & kamers', avg: 200, orders: 52, customers: 5 },
                  { name: 'Evenementen - Bruiloften', desc: 'Bruiloft decoratie', avg: 2000, orders: 1, customers: 30 },
                  { name: 'Evenementen - Bedrijfsfeesten', desc: 'Bedrijfsfeest decoratie', avg: 1500, orders: 1, customers: 20 },
                  { name: 'Begrafenisondernemers', desc: 'Rouwkransen & boeketten', avg: 300, orders: 24, customers: 3 },
                  { name: 'Winkels - Retail', desc: 'Winkeldecoratie', avg: 250, orders: 12, customers: 10 },
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const newSegment: MarketSegment = {
                        id: `segment-${Date.now()}-${idx}`,
                        name: suggestion.name,
                        description: suggestion.desc,
                        numberOfCustomers: suggestion.customers,
                        averageOrderValue: suggestion.avg,
                        ordersPerYear: suggestion.orders
                      }
                      setSegments([...segments, newSegment])
                    }}
                    className="text-left p-3 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-sm"
                  >
                    <div className="font-medium text-gray-900 mb-1">{suggestion.name}</div>
                    <div className="text-xs text-gray-600 mb-2">{suggestion.desc}</div>
                    <div className="text-xs text-primary-600">
                      {suggestion.customers} klanten × €{suggestion.avg} × {suggestion.orders}x/jaar
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {segments.map((segment, index) => (
                <div
                  key={segment.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Markt Segment
                      </label>
                      <input
                        type="text"
                        value={segment.name}
                        onChange={(e) => updateSegment(segment.id, { name: e.target.value })}
                        placeholder="Bijv. Middelbare Scholen - Valentijn"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Beschrijving
                      </label>
                      <input
                        type="text"
                        value={segment.description}
                        onChange={(e) => updateSegment(segment.id, { description: e.target.value })}
                        placeholder="Korte beschrijving"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aantal Klanten
                      </label>
                      <input
                        type="number"
                        value={segment.numberOfCustomers || ''}
                        onChange={(e) => updateSegment(segment.id, { numberOfCustomers: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gem. Orderwaarde (€)
                      </label>
                      <input
                        type="number"
                        value={segment.averageOrderValue || ''}
                        onChange={(e) => updateSegment(segment.id, { averageOrderValue: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Orders/Jaar
                      </label>
                      <input
                        type="number"
                        value={segment.ordersPerYear || ''}
                        onChange={(e) => updateSegment(segment.id, { ordersPerYear: parseInt(e.target.value) || 0 })}
                        placeholder="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                      />
                    </div>

                    <div className="md:col-span-1 flex items-end">
                      <div className="w-full">
                        <p className="text-xs text-gray-500 mb-1">Omzet</p>
                        <p className="text-lg font-bold text-primary-600">
                          {formatCurrency(calculateSegmentRevenue(segment))}
                        </p>
                      </div>
                    </div>
                  </div>

                  {segment.name && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{segment.name}</span>
                          {segment.description && (
                            <span className="text-gray-500 ml-2">- {segment.description}</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSegment(segment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {segments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Nog geen segmenten toegevoegd</p>
                  <Button
                    variant="primary"
                    onClick={addSegment}
                    className="mt-4"
                  >
                    Eerste Segment Toevoegen
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Saved Scenarios */}
          {scenarios.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Opgeslagen Scenario's
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map((scenario) => {
                  const scenarioRevenue = scenario.segments.reduce(
                    (total, seg) => total + (seg.numberOfCustomers * seg.averageOrderValue * seg.ordersPerYear),
                    0
                  )
                  const scenarioGrowth = ((scenarioRevenue / BASELINE_REVENUE) * 100).toFixed(1)

                  return (
                    <div
                      key={scenario.id}
                      className={cn(
                        "border rounded-lg p-4 transition-all",
                        selectedScenario === scenario.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {scenario.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(scenario.createdAt).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteScenario(scenario.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Segmenten:</span>
                          <span className="font-medium">{scenario.segments.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Extra Omzet:</span>
                          <span className="font-bold text-primary-600">
                            {formatCurrency(scenarioRevenue)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Groei:</span>
                          <Badge variant="success">{scenarioGrowth}%</Badge>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadScenario(scenario)}
                        className="w-full"
                      >
                        Scenario Laden
                      </Button>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Save Scenario Modal */}
          {showSaveModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Scenario Opslaan
                  </h3>
                  <button
                    onClick={() => {
                      setShowSaveModal(false)
                      setScenarioName('')
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scenario Naam
                  </label>
                  <input
                    type="text"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    placeholder="Bijv. Valentijn Campagne 2026"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        saveScenario()
                      }
                    }}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Samenvatting:</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex justify-between">
                      <span>Segmenten:</span>
                      <span className="font-medium">{segments.length}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Extra Omzet:</span>
                      <span className="font-medium text-primary-600">
                        {formatCurrency(totalNewRevenue)}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Groei:</span>
                      <span className="font-medium text-secondary-600">
                        {growthPercentage.toFixed(1)}%
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSaveModal(false)
                      setScenarioName('')
                    }}
                    className="flex-1"
                  >
                    Annuleren
                  </Button>
                  <Button
                    variant="primary"
                    onClick={saveScenario}
                    disabled={!scenarioName.trim()}
                    className="flex-1"
                  >
                    Opslaan
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
