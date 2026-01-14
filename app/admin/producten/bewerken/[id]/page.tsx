'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Upload,
  Package,
  DollarSign,
  Tag,
  FileText,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils/format'
import { getProductImage } from '@/lib/utils/getProductImage'
import type { Product } from '@/lib/data/products'

export default function AdminProductEditPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params?.id ? parseInt(params.id as string) : null

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    price: '',
    regular_price: '',
    sale_price: '',
    description: '',
    short_description: '',
    stock_status: 'instock' as 'instock' | 'outofstock',
    stock_quantity: '',
    categories: [] as string[],
  })

  const [images, setImages] = useState<Array<{ id: number; src: string; alt: string; name: string }>>([])

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }

    if (productId) {
      loadProduct()
    }
  }, [productId, router])

  const loadProduct = async () => {
    try {
      const { getProductById } = await import('@/lib/data/products')
      const loadedProduct = getProductById(productId!)
      
      if (!loadedProduct) {
        router.push('/admin/producten')
        return
      }

      setProduct(loadedProduct)
      setFormData({
        name: loadedProduct.name || '',
        slug: loadedProduct.slug || '',
        sku: loadedProduct.sku || '',
        price: loadedProduct.price || '',
        regular_price: loadedProduct.regular_price || '',
        sale_price: loadedProduct.sale_price || '',
        description: loadedProduct.description || '',
        short_description: loadedProduct.short_description || '',
        stock_status: loadedProduct.stock_status || 'instock',
        stock_quantity: loadedProduct.stock_quantity?.toString() || '',
        categories: loadedProduct.categories?.map(c => c.name) || [],
      })
      setImages(loadedProduct.images || [])
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading product:', error)
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleImageAdd = () => {
    const url = prompt('Voer de URL van de afbeelding in:')
    if (url) {
      setImages(prev => [...prev, {
        id: Date.now(),
        src: url,
        alt: formData.name || 'Product afbeelding',
        name: formData.name || 'Product afbeelding'
      }])
    }
  }

  const handleImageRemove = (imageId: number) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  const handleImageReorder = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newImages = [...images]
      ;[newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]]
      setImages(newImages)
    } else if (direction === 'down' && index < images.length - 1) {
      const newImages = [...images]
      ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
      setImages(newImages)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Productnaam is verplicht'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is verplicht'
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Geldige prijs is verplicht'
    }

    if (formData.sale_price && parseFloat(formData.sale_price) >= parseFloat(formData.price)) {
      newErrors.sale_price = 'Aanbiedingsprijs moet lager zijn dan de normale prijs'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate save
      console.log('Saving product:', { ...formData, images })
      
      // Redirect back to products list
      router.push('/admin/producten')
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Er is een fout opgetreden bij het opslaan')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <header className="bg-primary-600 text-white border-b border-primary-500 shadow-sm sticky top-0 z-30">
            <div className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">Product Bewerken</span>
              </div>
            </div>
          </header>
          <main className="p-6">
            <Card className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Product laden...</p>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <header className="bg-primary-600 text-white border-b border-primary-500 shadow-sm sticky top-0 z-30">
            <div className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">Product Bewerken</span>
              </div>
            </div>
          </header>
          <main className="p-6">
            <Card className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Product niet gevonden</h3>
              <p className="text-gray-600 mb-6">Het product dat je zoekt bestaat niet.</p>
              <Link href="/admin/producten">
                <Button>Terug naar producten</Button>
              </Link>
            </Card>
          </main>
        </div>
      </div>
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
                <span className="font-semibold text-white">Product Bewerken</span>
              </div>
              <Link href="/admin/producten">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Terug
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Bewerken</h1>
            <p className="text-gray-600">Bewerk de productinformatie hieronder</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  Basis Informatie
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Productnaam *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Bijv. Rode Rozen Boeket"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                        errors.slug ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="bijv. rode-rozen-boeket"
                    />
                    {errors.slug && (
                      <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="Bijv. ROS-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Korte Beschrijving
                    </label>
                    <textarea
                      value={formData.short_description}
                      onChange={(e) => handleInputChange('short_description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="Korte beschrijving die op productkaarten verschijnt..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Volledige Beschrijving
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={8}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="Volledige productbeschrijving..."
                    />
                  </div>
                </div>
              </Card>

              {/* Pricing */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary-600" />
                  Prijzen
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Normale Prijs (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="29.95"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aanbiedingsprijs (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sale_price}
                      onChange={(e) => handleInputChange('sale_price', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                        errors.sale_price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="24.95"
                    />
                    {errors.sale_price && (
                      <p className="mt-1 text-sm text-red-600">{errors.sale_price}</p>
                    )}
                    {formData.sale_price && (
                      <p className="mt-1 text-sm text-gray-500">
                        Korting: {formatPrice((parseFloat(formData.price) - parseFloat(formData.sale_price)).toString())}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Images */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary-600" />
                  Product Afbeeldingen
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-semibold">
                              Hoofdafbeelding
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {index > 0 && (
                            <button
                              onClick={() => handleImageReorder(index, 'up')}
                              className="p-2 bg-white rounded-lg hover:bg-gray-100"
                              title="Omhoog"
                            >
                              ↑
                            </button>
                          )}
                          {index < images.length - 1 && (
                            <button
                              onClick={() => handleImageReorder(index, 'down')}
                              className="p-2 bg-white rounded-lg hover:bg-gray-100"
                              title="Omlaag"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            onClick={() => handleImageRemove(image.id)}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            title="Verwijderen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleImageAdd}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Afbeelding Toevoegen
                  </Button>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Stock Management */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary-600" />
                  Voorraad
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voorraadstatus
                    </label>
                    <select
                      value={formData.stock_status}
                      onChange={(e) => handleInputChange('stock_status', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="instock">Op voorraad</option>
                      <option value="outofstock">Uitverkocht</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voorraadaantal
                    </label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </Card>

              {/* Categories */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary-600" />
                  Categorieën
                </h2>
                <div className="space-y-2">
                  {formData.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{category}</span>
                      <button
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            categories: prev.categories.filter((_, i) => i !== index)
                          }))
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const category = prompt('Voer categorie naam in:')
                      if (category) {
                        setFormData(prev => ({
                          ...prev,
                          categories: [...prev.categories, category]
                        }))
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Categorie Toevoegen
                  </Button>
                </div>
              </Card>

              {/* Actions */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Acties</h2>
                <div className="space-y-3">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Opslaan...' : 'Wijzigingen Opslaan'}
                  </Button>
                  <Link href="/admin/producten">
                    <Button variant="outline" className="w-full">
                      Annuleren
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
