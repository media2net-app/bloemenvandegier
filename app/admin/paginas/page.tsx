'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FileText, 
  Plus, 
  Edit, 
  Eye, 
  Trash2,
  Search,
  Filter,
  Globe,
  Home,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Copy,
  Download
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'
import type { Page } from '@/lib/types/page'

export default function AdminPaginasPage() {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [filteredPages, setFilteredPages] = useState<Page[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }

    loadPages()
  }, [router])

  const loadPages = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      // Mock pages data
      const mockPages: Page[] = [
        {
          id: '1',
          slug: 'home',
          title: 'Homepage',
          description: 'Hoofdpagina van de webshop',
          isHomepage: true,
          published: true,
          blocks: [],
          seoTitle: 'Bloemen van De Gier - Verse Bloemen Online',
          seoDescription: 'Prachtige bloemen van topkwaliteit. Gegarandeerd meer bloemen voor je geld.',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'Sam de Gier',
        },
        {
          id: '2',
          slug: 'over-ons',
          title: 'Over Ons',
          description: 'Informatie over Bloemen van De Gier',
          isHomepage: false,
          published: true,
          blocks: [],
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'Sam de Gier',
        },
        {
          id: '3',
          slug: 'contact',
          title: 'Contact',
          description: 'Contactpagina',
          isHomepage: false,
          published: true,
          blocks: [],
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'Chiel',
        },
        {
          id: '4',
          slug: 'veelgestelde-vragen',
          title: 'Veelgestelde Vragen',
          description: 'FAQ pagina',
          isHomepage: false,
          published: true,
          blocks: [],
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'Sam de Gier',
        },
        {
          id: '5',
          slug: 'nieuwe-pagina',
          title: 'Nieuwe Pagina',
          description: 'Work in progress',
          isHomepage: false,
          published: false,
          blocks: [],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'Chiel',
        },
      ]

      setPages(mockPages)
      setFilteredPages(mockPages)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading pages:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let filtered = pages

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(page =>
        page.title.toLowerCase().includes(query) ||
        page.slug.toLowerCase().includes(query) ||
        page.description?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(page => 
        statusFilter === 'published' ? page.published : !page.published
      )
    }

    setFilteredPages(filtered)
  }, [searchQuery, statusFilter, pages])

  const handleDelete = (pageId: string) => {
    if (confirm('Weet je zeker dat je deze pagina wilt verwijderen?')) {
      setPages(pages.filter(p => p.id !== pageId))
      setFilteredPages(filteredPages.filter(p => p.id !== pageId))
    }
  }

  const handleDuplicate = (page: Page) => {
    const newPage: Page = {
      ...page,
      id: Date.now().toString(),
      slug: `${page.slug}-kopie`,
      title: `${page.title} (Kopie)`,
      isHomepage: false,
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setPages([...pages, newPage])
    setFilteredPages([...filteredPages, newPage])
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Pagina's laden...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Pagina's</h1>
              <p className="text-gray-600 mt-1">Beheer alle pagina's en content</p>
            </div>
            <Link href="/admin/paginas/nieuw">
              <Button
                variant="primary"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nieuwe Pagina
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek pagina's..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Alle statussen</option>
              <option value="published">Gepubliceerd</option>
              <option value="draft">Concept</option>
            </select>
            <Button
              variant="secondary"
              onClick={() => {
                const csv = [
                  ['Titel', 'Slug', 'Status', 'Homepage', 'Aangemaakt', 'Bijgewerkt'].join(','),
                  ...filteredPages.map(p => [
                    `"${p.title}"`,
                    p.slug,
                    p.published ? 'Gepubliceerd' : 'Concept',
                    p.isHomepage ? 'Ja' : 'Nee',
                    formatDate(p.createdAt),
                    formatDate(p.updatedAt)
                  ].join(','))
                ].join('\n')
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `paginas-export-${new Date().toISOString().split('T')[0]}.csv`
                a.click()
                window.URL.revokeObjectURL(url)
              }}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </Card>

        {/* Pages List */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pagina
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blokken
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bijgewerkt
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Geen pagina's gevonden
                    </td>
                  </tr>
                ) : (
                  filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {page.isHomepage && (
                            <span title="Homepage">
                              <Home className="h-4 w-4 text-primary-600" />
                            </span>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {page.title}
                            </div>
                            {page.description && (
                              <div className="text-xs text-gray-500">
                                {page.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                          /{page.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {page.blocks.length} blok{page.blocks.length !== 1 ? 'ken' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {page.published ? (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Gepubliceerd
                          </Badge>
                        ) : (
                          <Badge variant="default" className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Concept
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(page.updatedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          door {page.createdBy || 'Onbekend'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {page.published && (
                            <Link href={`/${page.slug === 'home' ? '' : page.slug}`} target="_blank">
                              <button
                                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Bekijk pagina"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </Link>
                          )}
                          <Link href={`/admin/paginas/bewerken/${page.id}`}>
                            <button
                              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Bewerk pagina"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDuplicate(page)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Dupliceer pagina"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          {!page.isHomepage && (
                            <button
                              onClick={() => handleDelete(page.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Verwijder pagina"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
