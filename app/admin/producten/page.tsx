'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Package,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Download,
  CheckSquare,
  Square,
  ChevronDown
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils/format'
import { getProductImage } from '@/lib/utils/getProductImage'
import type { Product } from '@/lib/data/products'
import { cn } from '@/lib/utils/cn'

const PRODUCTS_PER_PAGE = 100

export default function AdminProductenPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }

    // Load products
    loadProducts()
  }, [router])

  const loadProducts = async () => {
    try {
      // In a real app, this would be an API call
      // For now, we'll use a dynamic import
      const { getAllProducts } = await import('@/lib/data/products')
      const allProducts = getAllProducts()
      setProducts(allProducts)
      setFilteredProducts(allProducts)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading products:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      )
      setFilteredProducts(filtered)
    }
    // Reset to page 1 when search changes
    setCurrentPage(1)
  }, [searchQuery, products])

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const endIndex = startIndex + PRODUCTS_PER_PAGE
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const handleDelete = (productId: number) => {
    if (confirm('Weet je zeker dat je dit product wilt verwijderen?')) {
      // In a real app, this would be an API call
      setProducts(products.filter(p => p.id !== productId))
      setFilteredProducts(filteredProducts.filter(p => p.id !== productId))
      setSelectedProducts(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleSelectAll = () => {
    if (selectedProducts.size === currentProducts.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(currentProducts.map(p => p.id)))
    }
  }

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.size === 0) return

    const selected = Array.from(selectedProducts)
    const selectedProductsData = products.filter(p => selected.includes(p.id))

    switch (action) {
      case 'delete':
        if (confirm(`Weet je zeker dat je ${selectedProducts.size} product(en) wilt verwijderen?`)) {
          setProducts(products.filter(p => !selected.includes(p.id)))
          setFilteredProducts(filteredProducts.filter(p => !selected.includes(p.id)))
          setSelectedProducts(new Set())
          alert(`${selectedProducts.size} product(en) verwijderd`)
        }
        break
      case 'instock':
        setProducts(products.map(p => 
          selected.includes(p.id) ? { ...p, stock_status: 'instock' as const } : p
        ))
        setFilteredProducts(filteredProducts.map(p => 
          selected.includes(p.id) ? { ...p, stock_status: 'instock' as const } : p
        ))
        alert(`${selectedProducts.size} product(en) op voorraad gezet`)
        setSelectedProducts(new Set())
        break
      case 'outofstock':
        setProducts(products.map(p => 
          selected.includes(p.id) ? { ...p, stock_status: 'outofstock' as const } : p
        ))
        setFilteredProducts(filteredProducts.map(p => 
          selected.includes(p.id) ? { ...p, stock_status: 'outofstock' as const } : p
        ))
        alert(`${selectedProducts.size} product(en) uitverkocht gezet`)
        setSelectedProducts(new Set())
        break
      case 'featured':
        setProducts(products.map(p => 
          selected.includes(p.id) ? { ...p, featured: true } : p
        ))
        setFilteredProducts(filteredProducts.map(p => 
          selected.includes(p.id) ? { ...p, featured: true } : p
        ))
        alert(`${selectedProducts.size} product(en) als featured gemarkeerd`)
        setSelectedProducts(new Set())
        break
      case 'unfeatured':
        setProducts(products.map(p => 
          selected.includes(p.id) ? { ...p, featured: false } : p
        ))
        setFilteredProducts(filteredProducts.map(p => 
          selected.includes(p.id) ? { ...p, featured: false } : p
        ))
        alert(`${selectedProducts.size} product(en) niet meer featured`)
        setSelectedProducts(new Set())
        break
      case 'export':
        // Export to CSV
        const csv = [
          ['Naam', 'SKU', 'Prijs', 'Voorraad', 'Status', 'Featured'].join(','),
          ...selectedProductsData.map(p => [
            `"${p.name}"`,
            p.sku || '',
            p.price,
            p.stock_quantity ?? '',
            p.stock_status,
            p.featured ? 'Ja' : 'Nee'
          ].join(','))
        ].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `producten-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        alert(`${selectedProducts.size} product(en) geëxporteerd`)
        break
    }
    setShowBulkActions(false)
  }

  const getStockBadge = (status: string) => {
    if (status === 'instock') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          <CheckCircle className="h-3 w-3" />
          Op voorraad
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
        <XCircle className="h-3 w-3" />
        Uitverkocht
      </span>
    )
  }

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
                <Package className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">Producten Beheer</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Producten</h1>
              <p className="text-gray-600">
                Beheer alle producten in je webshop ({filteredProducts.length} producten)
                {totalPages > 1 && ` • Pagina ${currentPage} van ${totalPages}`}
              </p>
            </div>
            <Link href="/admin/producten/nieuw">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nieuw Product
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Zoek op naam, SKU of beschrijving..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <Button variant="outline" className="border-gray-300">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const csv = [
                    ['Naam', 'SKU', 'Prijs', 'Voorraad', 'Status', 'Featured'].join(','),
                    ...filteredProducts.map(p => [
                      `"${p.name}"`,
                      p.sku || '',
                      p.price,
                      p.stock_quantity ?? '',
                      p.stock_status,
                      p.featured ? 'Ja' : 'Nee'
                    ].join(','))
                  ].join('\n')
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `alle-producten-${new Date().toISOString().split('T')[0]}.csv`
                  a.click()
                  window.URL.revokeObjectURL(url)
                }}
                className="border-gray-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Alles
              </Button>
            </div>
          </Card>

          {/* Bulk Actions Bar */}
          {selectedProducts.size > 0 && (
            <Card className="p-4 mb-6 bg-primary-50 border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedProducts.size} product(en) geselecteerd
                  </span>
                  <button
                    onClick={() => setSelectedProducts(new Set())}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Deselecteer alles
                  </button>
                </div>
                <div className="relative">
                  <Button
                    variant="primary"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="flex items-center gap-2"
                  >
                    Bulk Acties
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {showBulkActions && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => handleBulkAction('instock')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Op voorraad zetten
                        </button>
                        <button
                          onClick={() => handleBulkAction('outofstock')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Uitverkocht zetten
                        </button>
                        <button
                          onClick={() => handleBulkAction('featured')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Als featured markeren
                        </button>
                        <button
                          onClick={() => handleBulkAction('unfeatured')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Featured verwijderen
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => handleBulkAction('export')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Download className="h-4 w-4 inline mr-2" />
                          Export geselecteerde
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => handleBulkAction('delete')}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 inline mr-2" />
                          Verwijderen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Products Table */}
          {isLoading ? (
            <Card className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Producten laden...</p>
            </Card>
          ) : filteredProducts.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Geen producten gevonden</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'Probeer een andere zoekterm' : 'Voeg je eerste product toe'}
              </p>
              {!searchQuery && (
                <Link href="/admin/producten/nieuw">
                  <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuw Product
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <Card className="overflow-hidden">
              {/* Top Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Toont <span className="font-medium">{startIndex + 1}</span> tot{' '}
                      <span className="font-medium">
                        {Math.min(endIndex, filteredProducts.length)}
                      </span> van{' '}
                      <span className="font-medium">{filteredProducts.length}</span> producten
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Vorige
                      </Button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-primary-600 text-white font-semibold'
                                  : 'bg-white text-gray-700 hover:bg-primary-50 border border-gray-300'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Volgende
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        <button
                          onClick={handleSelectAll}
                          className="flex items-center"
                          title={selectedProducts.size === currentProducts.length ? 'Deselecteer alles' : 'Selecteer alles'}
                        >
                          {selectedProducts.size === currentProducts.length && currentProducts.length > 0 ? (
                            <CheckSquare className="h-5 w-5 text-primary-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prijs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Voorraad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acties
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentProducts.map((product) => {
                      const image = getProductImage(product.images)
                      const isSelected = selectedProducts.has(product.id)
                      return (
                        <tr key={product.id} className={cn("hover:bg-gray-50 transition-colors", isSelected && "bg-primary-50")}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleSelectProduct(product.id)}
                              className="flex items-center"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-5 w-5 text-primary-600" />
                              ) : (
                                <Square className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <Image
                                  src={image}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {product.name}
                                </div>
                                <div className="text-xs text-gray-500 line-clamp-1">
                                  {product.categories?.[0]?.name || 'Geen categorie'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.sku || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatPrice(product.sale_price || product.price)}
                            </div>
                            {product.sale_price && (
                              <div className="text-xs text-gray-500 line-through">
                                {formatPrice(product.regular_price)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.stock_quantity ?? '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStockBadge(product.stock_status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/product/${product.slug}`} target="_blank">
                                <button
                                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                  title="Bekijk product"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </Link>
                              <Link href={`/admin/producten/bewerken/${product.id}`}>
                                <button
                                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                  title="Bewerk product"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Verwijder product"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Toont <span className="font-medium">{startIndex + 1}</span> tot{' '}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredProducts.length)}
                    </span> van{' '}
                    <span className="font-medium">{filteredProducts.length}</span> producten
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Vorige
                      </Button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-primary-600 text-white font-semibold'
                                  : 'bg-white text-gray-700 hover:bg-primary-50 border border-gray-300'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Volgende
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
