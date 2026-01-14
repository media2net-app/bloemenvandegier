'use client'

import { useState, useMemo } from 'react'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import ProductGrid from '@/components/product/ProductGrid'
import ProductFilters from '@/components/product/ProductFilters'
import ProductSort from '@/components/product/ProductSort'
import { Product, Category } from '@/lib/data/products'

// Re-export types for use in client component
export type { Product, Category }

interface CategoryClientProps {
  category: Category
  products: Product[]
}

export default function CategoryClient({ category, products: allProducts }: CategoryClientProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})
  const [sortBy, setSortBy] = useState('popularity')

  const mockFilters = {
    price: [
      { value: '0-20', label: '€0 - €20', count: allProducts.filter(p => parseFloat(p.price) >= 0 && parseFloat(p.price) <= 20).length },
      { value: '20-30', label: '€20 - €30', count: allProducts.filter(p => parseFloat(p.price) > 20 && parseFloat(p.price) <= 30).length },
      { value: '30+', label: '€30+', count: allProducts.filter(p => parseFloat(p.price) > 30).length },
    ],
    availability: [
      { value: 'instock', label: 'Op voorraad', count: allProducts.filter(p => p.stock_status === 'instock').length },
      { value: 'outofstock', label: 'Uitverkocht', count: allProducts.filter(p => p.stock_status === 'outofstock').length },
    ],
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[filterType] || []
      const newFilters = { ...prev }

      if (current.includes(value)) {
        newFilters[filterType] = current.filter((v) => v !== value)
        if (newFilters[filterType].length === 0) {
          delete newFilters[filterType]
        }
      } else {
        newFilters[filterType] = [...current, value]
      }

      return newFilters
    })
  }

  const handleClearFilters = () => {
    setActiveFilters({})
  }

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts]

    // Apply filters
    if (activeFilters.price && activeFilters.price.length > 0) {
      filtered = filtered.filter((product) => {
        const price = parseFloat(product.price)
        return activeFilters.price.some((filter) => {
          if (filter === '0-20') return price >= 0 && price <= 20
          if (filter === '20-30') return price > 20 && price <= 30
          if (filter === '30+') return price > 30
          return true
        })
      })
    }

    if (activeFilters.availability && activeFilters.availability.length > 0) {
      filtered = filtered.filter((product) =>
        activeFilters.availability.includes(product.stock_status || '')
      )
    }

    // Apply sorting
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
  }, [activeFilters, sortBy, allProducts])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: category.name, href: `#` },
            ]}
          />
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">
            {category.name}
          </h1>
          <p className="text-lg text-gray-600">
            {allProducts.length} {allProducts.length === 1 ? 'product' : 'producten'} beschikbaar
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar with filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <ProductFilters
              filters={mockFilters}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* Main content */}
          <main className="flex-1">
            <ProductSort
              currentSort={sortBy}
              onSortChange={setSortBy}
              productCount={filteredAndSortedProducts.length}
            />

            {filteredAndSortedProducts.length > 0 ? (
              <ProductGrid products={filteredAndSortedProducts} columns={3} />
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600 mb-4">
                  Geen producten gevonden met de geselecteerde filters.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Wis alle filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
