'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/lib/auth/store'
import { getAllProducts } from '@/lib/data/products'
import ProductGrid from '@/components/product/ProductGrid'
import ProductFilters from '@/components/product/ProductFilters'
import ProductSort from '@/components/product/ProductSort'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { Heart, LogOut, ShoppingCart, Search, Filter } from 'lucide-react'
import { useCartStore } from '@/lib/cart/store'

// Filter products for Valentijn - specifieke roos producten
function getValentijnProducts() {
  const allProducts = getAllProducts()
  
  // Toon de specifieke roos producten voor valentijn
  const valentijnProductSlugs = [
    'onbewerkte-rode-roos-per-stuk-te-bestellen',
    'onbewerkte-rode-roos-142',
    'per-stuk-verpakte-rode-roos-245'
  ]
  
  return allProducts.filter(product => {
    return valentijnProductSlugs.includes(product.slug)
  })
}

const valentijnProducts = getValentijnProducts()

const mockFilters = {
  price: [
    { value: '0-20', label: '€0 - €20', count: valentijnProducts.filter(p => parseFloat(p.price) >= 0 && parseFloat(p.price) <= 20).length },
    { value: '20-30', label: '€20 - €30', count: valentijnProducts.filter(p => parseFloat(p.price) > 20 && parseFloat(p.price) <= 30).length },
    { value: '30-50', label: '€30 - €50', count: valentijnProducts.filter(p => parseFloat(p.price) > 30 && parseFloat(p.price) <= 50).length },
    { value: '50+', label: '€50+', count: valentijnProducts.filter(p => parseFloat(p.price) > 50).length },
  ],
  availability: [
    { value: 'instock', label: 'Op voorraad', count: valentijnProducts.filter(p => p.stock_status === 'instock').length },
    { value: 'outofstock', label: 'Uitverkocht', count: valentijnProducts.filter(p => p.stock_status === 'outofstock').length },
  ],
}

export default function MiddelbareScholenValentijnPage() {
  const router = useRouter()
  const { user, isAuthenticated, userType, logout } = useAuthStore()
  const { getItemCount } = useCartStore()
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})
  const [sortBy, setSortBy] = useState<string>('popularity')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    // Wait a bit for auth store to hydrate from localStorage
    const timer = setTimeout(() => {
      // Redirect if not authenticated as middelbare school
      if (!isAuthenticated || userType !== 'middelbare-school') {
        router.push('/middelbare-scholen/login')
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [isAuthenticated, userType, router])

  const handleLogout = () => {
    logout()
    router.push('/middelbare-scholen/login')
  }

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setActiveFilters((prev) => {
      const currentValues = prev[filterType] || []
      const isActive = currentValues.includes(value)
      
      return {
        ...prev,
        [filterType]: isActive
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value],
      }
    })
  }

  // Clear all filters
  const handleClearFilters = () => {
    setActiveFilters({})
  }

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...valentijnProducts]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.short_description.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      )
    }

    // Price filter
    if (activeFilters.price && activeFilters.price.length > 0) {
      filtered = filtered.filter((product) => {
        const price = parseFloat(product.price)
        return activeFilters.price.some((filter) => {
          if (filter === '0-20') return price >= 0 && price <= 20
          if (filter === '20-30') return price > 20 && price <= 30
          if (filter === '30-50') return price > 30 && price <= 50
          if (filter === '50+') return price > 50
          return true
        })
      })
    }

    // Availability filter
    if (activeFilters.availability && activeFilters.availability.length > 0) {
      filtered = filtered.filter((product) =>
        activeFilters.availability.includes(product.stock_status || '')
      )
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return parseFloat(a.price) - parseFloat(b.price)
        case 'price-desc':
          return parseFloat(b.price) - parseFloat(a.price)
        case 'rating':
          return parseFloat(b.average_rating || '0') - parseFloat(a.average_rating || '0')
        case 'newest':
          return b.id - a.id
        case 'popularity':
        default:
          return parseFloat(b.average_rating || '0') - parseFloat(a.average_rating || '0')
      }
    })

    return sorted
  }, [activeFilters, sortBy, searchQuery])

  // Show loading state while checking auth
  if (typeof window !== 'undefined' && (!isAuthenticated || userType !== 'middelbare-school')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/logo.svg"
                  alt="Bloemen van De Gier"
                  width={200}
                  height={50}
                  className="h-10 w-auto brightness-0 invert"
                />
              </Link>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold">Valentijn Assortiment</h1>
                <p className="text-sm text-red-100">{user?.schoolName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/afrekenen" className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-white text-white hover:bg-white hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-50 via-red-100 to-red-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-6">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Valentijn Campagne 2026
            </h2>
            <p className="text-xl text-gray-700 mb-6">
              Speciaal voor middelbare scholen: Ontdek ons uitgebreide Valentijn assortiment met voordelige prijzen
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="font-semibold text-red-600">✓</span> Voordelige prijzen
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="font-semibold text-red-600">✓</span> Verse bloemen
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="font-semibold text-red-600">✓</span> Snelle levering
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoek in Valentijn assortiment..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <ProductSort currentSort={sortBy} onSortChange={setSortBy} />
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="p-4 mb-4">
              <ProductFilters
                filters={mockFilters}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </Card>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'product' : 'producten'} gevonden
          </p>
        </div>

        {/* Products Grid */}
        {filteredAndSortedProducts.length > 0 ? (
          <ProductGrid products={filteredAndSortedProducts} basePath="/middelbare-scholen/valentijn" />
        ) : (
          <Card className="p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Geen producten gevonden</h3>
            <p className="text-gray-600 mb-4">
              Probeer andere filters of zoektermen
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setActiveFilters({})
                setSearchQuery('')
              }}
            >
              Filters wissen
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
