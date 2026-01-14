'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Tag,
  Filter,
  MoreVertical,
  Package,
  ExternalLink
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface Category {
  id: number
  name: string
  slug: string
  productCount: number
  parentId?: number
  description?: string
  image?: string
}

const CATEGORIES_PER_PAGE = 50

export default function AdminCategorieenPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<'name' | 'productCount' | 'id'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }

    // Load categories
    loadCategories()
  }, [router])

  const loadCategories = async () => {
    try {
      // Try API first
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
        setFilteredCategories(data)
        setIsLoading(false)
        return
      }
    } catch (error) {
      console.error('Error loading categories from API:', error)
    }
    
    // Fallback to JSON file
    try {
      const categoriesData = await import('@/lib/data/categories.json')
      setCategories(categoriesData.default)
      setFilteredCategories(categoriesData.default)
    } catch (e) {
      console.error('Error loading fallback categories:', e)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    let filtered = [...categories]

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'productCount':
          aValue = a.productCount
          bValue = b.productCount
          break
        case 'id':
          aValue = a.id
          bValue = b.id
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredCategories(filtered)
    setCurrentPage(1)
  }, [searchQuery, categories, sortBy, sortOrder])

  // Calculate pagination
  const totalPages = Math.ceil(filteredCategories.length / CATEGORIES_PER_PAGE)
  const startIndex = (currentPage - 1) * CATEGORIES_PER_PAGE
  const endIndex = startIndex + CATEGORIES_PER_PAGE
  const currentCategories = filteredCategories.slice(startIndex, endIndex)

  const handleDelete = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId)
    if (confirm(`Weet je zeker dat je de categorie "${category?.name}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      // In a real app, this would be an API call
      setCategories(categories.filter(c => c.id !== categoryId))
      setFilteredCategories(filteredCategories.filter(c => c.id !== categoryId))
    }
  }

  const handleSort = (field: 'name' | 'productCount' | 'id') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Categorieën laden...</p>
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
              <h1 className="text-2xl font-bold">Categorieën</h1>
              <p className="text-primary-100 text-sm mt-1">
                Beheer alle productcategorieën
              </p>
            </div>
            <Link href="/admin/categorieen/nieuw">
              <Button className="bg-white text-primary-600 hover:bg-primary-50">
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe categorie
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Search and Filters */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Zoek categorieën..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-')
                    setSortBy(field as 'name' | 'productCount' | 'id')
                    setSortOrder(order as 'asc' | 'desc')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="name-asc">Naam (A-Z)</option>
                  <option value="name-desc">Naam (Z-A)</option>
                  <option value="productCount-desc">Meeste producten</option>
                  <option value="productCount-asc">Minste producten</option>
                  <option value="id-asc">ID (Oudste eerst)</option>
                  <option value="id-desc">ID (Nieuwste eerst)</option>
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>
                  <strong className="text-gray-900">{filteredCategories.length}</strong> categorieën
                </span>
                <span>
                  Totaal <strong className="text-gray-900">{categories.reduce((sum, c) => sum + c.productCount, 0)}</strong> producten
                </span>
              </div>
            </div>
          </Card>

          {/* Pagination Top */}
          {totalPages > 1 && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Pagina {currentPage} van {totalPages} ({filteredCategories.length} categorieën)
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

          {/* Categories Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('id')}
                        className="flex items-center gap-2 hover:text-gray-700"
                      >
                        ID
                        {sortBy === 'id' && (
                          <span className="text-primary-600">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-2 hover:text-gray-700"
                      >
                        Naam
                        {sortBy === 'name' && (
                          <span className="text-primary-600">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('productCount')}
                        className="flex items-center gap-2 hover:text-gray-700"
                      >
                        Producten
                        {sortBy === 'productCount' && (
                          <span className="text-primary-600">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        {searchQuery ? 'Geen categorieën gevonden voor je zoekopdracht.' : 'Geen categorieën gevonden.'}
                      </td>
                    </tr>
                  ) : (
                    currentCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{category.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                              <Tag className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {category.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                            {category.slug}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={category.productCount > 0 ? 'default' : 'warning'}>
                            <Package className="h-3 w-3 mr-1" />
                            {category.productCount}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/categorie/${category.slug}`}
                              target="_blank"
                              className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                              title="Bekijk op website"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/categorieen/bewerken/${category.id}`}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Bewerken"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Verwijderen"
                              disabled={category.productCount > 0}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination Bottom */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Pagina {currentPage} van {totalPages} ({filteredCategories.length} categorieën)
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
