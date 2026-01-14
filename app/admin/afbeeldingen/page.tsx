'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Search, 
  Filter,
  Upload,
  Image as ImageIcon,
  ImageOff,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Download,
  RefreshCw,
  AlertCircle,
  Package
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { getProductImage } from '@/lib/utils/getProductImage'
import type { Product } from '@/lib/data/products'

const PRODUCTS_PER_PAGE = 50

interface ImageStats {
  total: number
  withImages: number
  withoutImages: number
  broken: number
}

export default function AdminAfbeeldingenPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'with' | 'without' | 'broken'>('without')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState<ImageStats>({
    total: 0,
    withImages: 0,
    withoutImages: 0,
    broken: 0,
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

    loadProducts()
  }, [router])

  const loadProducts = async () => {
    try {
      const { getAllProducts } = await import('@/lib/data/products')
      const allProducts = getAllProducts()
      setProducts(allProducts)
      calculateStats(allProducts)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading products:', error)
      setIsLoading(false)
    }
  }

  const calculateStats = (productsList: Product[]) => {
    const stats: ImageStats = {
      total: productsList.length,
      withImages: 0,
      withoutImages: 0,
      broken: 0,
    }

    productsList.forEach(product => {
      const hasValidImage = !!(
        product.images &&
        product.images.length > 0 &&
        product.images[0].src &&
        product.images[0].src.trim() !== '' &&
        !product.images[0].src.includes('placeholder') &&
        !product.images[0].src.includes('data:image')
      )

      if (!hasValidImage) {
        stats.withoutImages++
      } else {
        stats.withImages++
        // Check if image might be broken (external URL that might be 404)
        if (product.images[0].src.startsWith('http') && !product.images[0].src.includes('bloemenvandegier')) {
          stats.broken++
        }
      }
    })

    setStats(stats)
  }

  const hasValidImage = (product: Product): boolean => {
    return !!(
      product.images &&
      product.images.length > 0 &&
      product.images[0].src &&
      product.images[0].src.trim() !== '' &&
      !product.images[0].src.includes('placeholder') &&
      !product.images[0].src.includes('data:image')
    )
  }

  const isBrokenImage = (product: Product): boolean => {
    if (!hasValidImage(product)) return false
    const imageSrc = product.images![0].src
    return imageSrc.startsWith('http') && !imageSrc.includes('bloemenvandegier')
  }

  useEffect(() => {
    let filtered = [...products]

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.id.toString().includes(query)
      )
    }

    // Apply type filter
    switch (filterType) {
      case 'with':
        filtered = filtered.filter(p => hasValidImage(p) && !isBrokenImage(p))
        break
      case 'without':
        filtered = filtered.filter(p => !hasValidImage(p))
        break
      case 'broken':
        filtered = filtered.filter(p => isBrokenImage(p))
        break
      case 'all':
      default:
        // No additional filtering
        break
    }

    setFilteredProducts(filtered)
    setCurrentPage(1)
  }, [searchQuery, filterType, products])

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const endIndex = startIndex + PRODUCTS_PER_PAGE
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const handleUploadImage = (productId: number) => {
    // In a real app, this would open an image upload modal
    alert(`Afbeelding uploaden voor product #${productId}\n\nIn productie zou hier een upload modal openen.`)
  }

  const handleRefreshImage = (productId: number) => {
    // In a real app, this would try to re-fetch the image
    alert(`Afbeelding verversen voor product #${productId}\n\nIn productie zou hier de afbeelding opnieuw worden opgehaald.`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Producten laden...</p>
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
              <h1 className="text-2xl font-bold">Afbeeldingen Beheer</h1>
              <p className="text-primary-100 text-sm mt-1">
                Beheer productafbeeldingen en upload ontbrekende afbeeldingen
              </p>
            </div>
            <Button className="bg-white text-primary-600 hover:bg-primary-50">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Totaal Producten</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Met Afbeelding</p>
                  <p className="text-2xl font-bold text-green-600">{stats.withImages}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Zonder Afbeelding</p>
                  <p className="text-2xl font-bold text-red-600">{stats.withoutImages}</p>
                </div>
                <ImageOff className="h-8 w-8 text-red-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mogelijk Kapot</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.broken}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Zoek producten op naam, SKU of ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="all">Alle producten</option>
                  <option value="with">Met afbeelding</option>
                  <option value="without">Zonder afbeelding</option>
                  <option value="broken">Mogelijk kapot</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>
                  <strong className="text-gray-900">{filteredProducts.length}</strong> producten gevonden
                </span>
                {filterType === 'without' && (
                  <span className="text-red-600">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    {stats.withoutImages} producten hebben geen afbeelding
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Pagination Top */}
          {totalPages > 1 && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Pagina {currentPage} van {totalPages} ({filteredProducts.length} producten)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Vorige
                </Button>
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
          )}

          {/* Products Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Afbeelding Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Afbeelding URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categorie
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        {searchQuery || filterType !== 'all' 
                          ? 'Geen producten gevonden voor je zoekopdracht.' 
                          : 'Geen producten gevonden.'}
                      </td>
                    </tr>
                  ) : (
                    currentProducts.map((product) => {
                      const hasImage = hasValidImage(product)
                      const broken = isBrokenImage(product)
                      const imageSrc = hasImage ? getProductImage(product.images) : '/images/placeholder-flower.svg'
                      
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-200">
                                <Image
                                  src={imageSrc}
                                  alt={product.name}
                                  fill
                                  className={`object-cover ${!hasImage ? 'opacity-50' : ''}`}
                                  sizes="64px"
                                  onError={(e) => {
                                    // Fallback to placeholder on error
                                    const target = e.target as HTMLImageElement
                                    target.src = '/images/placeholder-flower.svg'
                                  }}
                                />
                                {!hasImage && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                    <ImageOff className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {product.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {product.id} {product.sku && `• SKU: ${product.sku}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {hasImage ? (
                              broken ? (
                                <Badge variant="warning">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Mogelijk kapot
                                </Badge>
                              ) : (
                                <Badge variant="success">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Aanwezig
                                </Badge>
                              )
                            ) : (
                              <Badge variant="default" className="bg-red-100 text-red-800">
                                <ImageOff className="h-3 w-3 mr-1" />
                                Ontbreekt
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {hasImage ? (
                              <div className="max-w-xs">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 break-all">
                                  {product.images![0].src.substring(0, 60)}
                                  {product.images![0].src.length > 60 ? '...' : ''}
                                </code>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.categories?.[0]?.name || 'Geen categorie'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/product/${product.slug}`} target="_blank">
                                <button
                                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                  title="Bekijk product"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </Link>
                              <Link href={`/admin/producten/bewerken/${product.id}`}>
                                <button
                                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Bewerk product"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </Link>
                              {!hasImage ? (
                                <button
                                  onClick={() => handleUploadImage(product.id)}
                                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                  title="Upload afbeelding"
                                >
                                  <Upload className="h-4 w-4" />
                                </button>
                              ) : broken ? (
                                <button
                                  onClick={() => handleRefreshImage(product.id)}
                                  className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                                  title="Ververs afbeelding"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination Bottom */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Pagina {currentPage} van {totalPages} ({filteredProducts.length} producten)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Vorige
                </Button>
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
          )}
        </div>
      </div>
    </div>
  )
}
