'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Image as ImageIcon } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface Category {
  id: number
  name: string
  slug: string
  productCount: number
  parentId?: number
  description?: string
  image?: string
}

export default function AdminCategorieBewerkenPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params?.id ? parseInt(params.id as string) : null

  const [category, setCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
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

    if (categoryId) {
      loadCategory()
    } else {
      setIsLoading(false)
    }
  }, [categoryId, router])

  const loadCategory = async () => {
    try {
      // Try API first
      const response = await fetch('/api/categories')
      if (response.ok) {
        const categories = await response.json()
        const found = categories.find((c: Category) => c.id === categoryId)
        if (found) {
          setCategory(found)
          setFormData({
            name: found.name || '',
            slug: found.slug || '',
            description: '',
            parentId: '',
          })
        }
      } else {
        // Fallback to JSON
        const categoriesData = await import('@/lib/data/categories.json')
        const found = categoriesData.default.find((c: Category) => c.id === categoryId)
        if (found) {
          setCategory(found)
          setFormData({
            name: found.name || '',
            slug: found.slug || '',
            description: '',
            parentId: '',
          })
        }
      }
    } catch (error) {
      console.error('Error loading category:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({
        ...prev,
        slug,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate save
      console.log('Saving category:', { id: categoryId, ...formData })
      
      // Redirect back to categories list
      router.push('/admin/categorieen')
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Er is een fout opgetreden bij het opslaan van de categorie.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!category) return
    
    if (confirm(`Weet je zeker dat je de categorie "${category.name}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      // In a real app, this would be an API call
      router.push('/admin/categorieen')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Categorie laden...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!category && categoryId) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Categorie niet gevonden</p>
            <Link href="/admin/categorieen">
              <Button variant="outline">Terug naar categorieën</Button>
            </Link>
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
            <div className="flex items-center gap-4">
              <Link href="/admin/categorieen">
                <button className="p-2 hover:bg-primary-500 rounded-lg transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">
                  {categoryId ? 'Categorie bewerken' : 'Nieuwe categorie'}
                </h1>
                <p className="text-primary-100 text-sm mt-1">
                  {categoryId ? `Bewerk categorie #${categoryId}` : 'Maak een nieuwe categorie aan'}
                </p>
              </div>
            </div>
            {categoryId && (
              <Button
                variant="outline"
                onClick={handleDelete}
                className="bg-red-600 text-white border-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Verwijderen
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Basisinformatie</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Categorienaam *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        placeholder="Bijv. Rozen, Boeketten, etc."
                      />
                    </div>

                    <div>
                      <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                        Slug *
                      </label>
                      <input
                        type="text"
                        id="slug"
                        name="slug"
                        required
                        value={formData.slug}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none font-mono text-sm"
                        placeholder="bijv. rozen, boeketten"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        URL-vriendelijke versie van de naam (bijv. "rozen" voor "Rozen")
                      </p>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Beschrijving
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        placeholder="Optionele beschrijving van de categorie..."
                      />
                    </div>
                  </div>
                </Card>

                {/* Category Image */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Afbeelding</h2>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload een afbeelding voor deze categorie
                      </p>
                      <Button variant="outline" type="button">
                        Afbeelding uploaden
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Actions */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Acties</h3>
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Opslaan...' : 'Opslaan'}
                    </Button>
                    <Link href="/admin/categorieen" className="block">
                      <Button variant="outline" className="w-full">
                        Annuleren
                      </Button>
                    </Link>
                  </div>
                </Card>

                {/* Category Info */}
                {category && (
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Categorie Info</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-600">ID:</span>
                        <span className="ml-2 font-medium text-gray-900">#{category.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Producten:</span>
                        <span className="ml-2 font-medium text-gray-900">{category.productCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Slug:</span>
                        <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {category.slug}
                        </code>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
