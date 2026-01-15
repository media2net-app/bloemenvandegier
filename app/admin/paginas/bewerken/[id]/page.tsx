'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Plus, 
  GripVertical,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  X,
  Type,
  Image as ImageIcon,
  Package,
  Video,
  MessageSquare,
  Layout,
  FileText,
  Grid3x3,
  ChevronDown,
  ChevronUp,
  Bold,
  Italic,
  Underline,
  List,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'
import type { Page, PageBlock, BlockType } from '@/lib/types/page'

export default function AdminPaginaBewerkenPage() {
  const router = useRouter()
  const params = useParams()
  const pageId = params?.id as string
  const [page, setPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [showBlockSelector, setShowBlockSelector] = useState(false)
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null)
  const [dragOverBlock, setDragOverBlock] = useState<string | null>(null)

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }

    loadPage()
  }, [router, pageId])

  const loadPage = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      // Mock page data
      if (pageId === 'new') {
        setPage({
          id: 'new',
          slug: '',
          title: '',
          description: '',
          isHomepage: false,
          published: false,
          blocks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      } else {
        // Load existing page
        const mockPage: Page = {
          id: pageId,
          slug: pageId === '1' ? 'home' : 'over-ons',
          title: pageId === '1' ? 'Homepage' : 'Over Ons',
          description: 'Pagina beschrijving',
          isHomepage: pageId === '1',
          published: true,
          blocks: pageId === '1' ? [
            {
              id: 'block-1',
              type: 'hero',
              order: 0,
              data: {
                title: 'Verse Bloemen van Topkwaliteit',
                subtitle: 'Gegarandeerd meer bloemen voor je geld',
                backgroundImage: '/hero.jpg',
                ctaText: 'Bekijk Boeketten',
                ctaLink: '/boeketten',
                ctaText2: 'Ontdek Rozen',
                ctaLink2: '/rozen',
              },
            },
            {
              id: 'block-2',
              type: 'text',
              order: 1,
              data: {
                content: '<h2>Welkom bij Bloemen van De Gier</h2><p>Wij bieden de mooiste bloemen van topkwaliteit. Met onze 7 dagen versgarantie weet je zeker dat je bloemen lang mooi blijven.</p>',
                alignment: 'center',
                maxWidth: '4xl',
              },
            },
            {
              id: 'block-3',
              type: 'products',
              order: 2,
              data: {
                title: 'Uitgelichte Producten',
                category: 'featured',
                limit: 8,
                columns: 4,
              },
            },
          ] : [],
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Sam de Gier',
        }
        setPage(mockPage)
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading page:', error)
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (page) {
        setPage({
          ...page,
          updatedAt: new Date().toISOString(),
        })
      }
      alert('Pagina opgeslagen!')
      setIsSaving(false)
    } catch (error) {
      console.error('Error saving page:', error)
      setIsSaving(false)
    }
  }

  const handleAddBlock = (type: BlockType) => {
    if (!page) return

    const newBlock: PageBlock = {
      id: `block-${Date.now()}`,
      type,
      order: page.blocks.length,
      data: getDefaultBlockData(type),
    }

    setPage({
      ...page,
      blocks: [...page.blocks, newBlock],
    })
    setShowBlockSelector(false)
    setSelectedBlock(newBlock.id)
  }

  const handleDeleteBlock = (blockId: string) => {
    if (!page) return
    if (confirm('Weet je zeker dat je dit blok wilt verwijderen?')) {
      setPage({
        ...page,
        blocks: page.blocks.filter(b => b.id !== blockId).map((b, index) => ({
          ...b,
          order: index,
        })),
      })
      if (selectedBlock === blockId) {
        setSelectedBlock(null)
      }
    }
  }

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    if (!page) return
    const index = page.blocks.findIndex(b => b.id === blockId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= page.blocks.length) return

    const newBlocks = [...page.blocks]
    ;[newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]]
    newBlocks[index].order = index
    newBlocks[newIndex].order = newIndex

    setPage({
      ...page,
      blocks: newBlocks,
    })
  }

  const handleDragStart = (blockId: string) => {
    setDraggedBlock(blockId)
  }

  const handleDragOver = (e: React.DragEvent, blockId: string) => {
    e.preventDefault()
    if (draggedBlock && draggedBlock !== blockId) {
      setDragOverBlock(blockId)
    }
  }

  const handleDragEnd = () => {
    if (draggedBlock && dragOverBlock && page) {
      const draggedIndex = page.blocks.findIndex(b => b.id === draggedBlock)
      const targetIndex = page.blocks.findIndex(b => b.id === dragOverBlock)
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newBlocks = [...page.blocks]
        const [removed] = newBlocks.splice(draggedIndex, 1)
        newBlocks.splice(targetIndex, 0, removed)
        newBlocks.forEach((b, index) => {
          b.order = index
        })

        setPage({
          ...page,
          blocks: newBlocks,
        })
      }
    }
    setDraggedBlock(null)
    setDragOverBlock(null)
  }

  const handleDuplicateBlock = (blockId: string) => {
    if (!page) return
    const block = page.blocks.find(b => b.id === blockId)
    if (!block) return

    const newBlock: PageBlock = {
      ...block,
      id: `block-${Date.now()}`,
      order: block.order + 1,
    }

    const newBlocks = [...page.blocks]
    newBlocks.splice(block.order + 1, 0, newBlock)
    newBlocks.forEach((b, index) => {
      b.order = index
    })

    setPage({
      ...page,
      blocks: newBlocks,
    })
  }

  const handleUpdateBlock = (blockId: string, data: Record<string, any>) => {
    if (!page) return
    setPage({
      ...page,
      blocks: page.blocks.map(b =>
        b.id === blockId ? { ...b, data: { ...b.data, ...data } } : b
      ),
    })
  }

  const getDefaultBlockData = (type: BlockType): Record<string, any> => {
    switch (type) {
      case 'hero':
        return {
          title: 'Nieuwe Titel',
          subtitle: 'Subtitel tekst',
          backgroundImage: '',
          ctaText: 'Call to Action',
          ctaLink: '/',
        }
      case 'text':
        return {
          content: '<p>Voeg hier je tekst toe...</p>',
          alignment: 'left',
          maxWidth: '4xl',
        }
      case 'image':
        return {
          image: '',
          alt: '',
          caption: '',
          alignment: 'center',
        }
      case 'products':
        return {
          title: 'Producten',
          category: 'featured',
          limit: 8,
          columns: 4,
        }
      case 'categories':
        return {
          title: 'Categorieën',
          columns: 4,
        }
      case 'video':
        return {
          videoUrl: '',
          title: '',
          description: '',
        }
      case 'testimonials':
        return {
          title: 'Wat zeggen onze klanten',
          testimonials: [],
        }
      case 'cta':
        return {
          title: 'Call to Action',
          text: 'Klik hier om te beginnen',
          buttonText: 'Actie',
          buttonLink: '/',
        }
      default:
        return {}
    }
  }

  const getBlockIcon = (type: BlockType) => {
    switch (type) {
      case 'hero':
        return Layout
      case 'text':
        return Type
      case 'image':
        return ImageIcon
      case 'products':
        return Package
      case 'categories':
        return Grid3x3
      case 'video':
        return Video
      case 'testimonials':
        return MessageSquare
      case 'cta':
        return Layout
      default:
        return FileText
    }
  }

  const getBlockLabel = (type: BlockType) => {
    switch (type) {
      case 'hero':
        return 'Hero'
      case 'text':
        return 'Tekst'
      case 'image':
        return 'Afbeelding'
      case 'products':
        return 'Producten'
      case 'categories':
        return 'Categorieën'
      case 'video':
        return 'Video'
      case 'testimonials':
        return 'Testimonials'
      case 'cta':
        return 'Call to Action'
      default:
        return type
    }
  }

  const availableBlocks: Array<{ type: BlockType; label: string; icon: any; description: string }> = [
    { type: 'hero', label: 'Hero', icon: Layout, description: 'Grote banner met titel en CTA' },
    { type: 'text', label: 'Tekst', icon: Type, description: 'Tekst blok met WYSIWYG editor' },
    { type: 'image', label: 'Afbeelding', icon: ImageIcon, description: 'Enkele afbeelding' },
    { type: 'products', label: 'Producten', icon: Package, description: 'Product grid' },
    { type: 'categories', label: 'Categorieën', icon: Grid3x3, description: 'Categorie grid' },
    { type: 'video', label: 'Video', icon: Video, description: 'Video embed' },
    { type: 'testimonials', label: 'Testimonials', icon: MessageSquare, description: 'Klant reviews' },
    { type: 'cta', label: 'Call to Action', icon: Layout, description: 'CTA sectie' },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Pagina laden...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 p-8">
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Pagina niet gevonden</h3>
            <Link href="/admin/paginas">
              <Button variant="outline" className="mt-4">
                Terug naar pagina's
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 flex">
        {/* Main Editor */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Link href="/admin/paginas">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Terug
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {pageId === 'new' ? 'Nieuwe Pagina' : `Bewerk: ${page.title}`}
                  </h1>
                  {page.slug && (
                    <p className="text-sm text-gray-600 mt-1">
                      Slug: <code className="bg-gray-100 px-1 rounded">/{page.slug}</code>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Opslaan...' : 'Opslaan'}
                </Button>
              </div>
            </div>

            {/* Page Settings */}
            <Card className="p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titel
                  </label>
                  <input
                    type="text"
                    value={page.title}
                    onChange={(e) => setPage({ ...page, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Pagina titel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={page.slug}
                    onChange={(e) => setPage({ ...page, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="pagina-slug"
                    disabled={page.isHomepage}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beschrijving
                  </label>
                  <input
                    type="text"
                    value={page.description || ''}
                    onChange={(e) => setPage({ ...page, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Korte beschrijving"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={page.published}
                      onChange={(e) => setPage({ ...page, published: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Gepubliceerd</span>
                  </label>
                  {!page.isHomepage && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={page.isHomepage}
                        onChange={(e) => setPage({ ...page, isHomepage: e.target.checked })}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Homepage</span>
                    </label>
                  )}
                </div>
              </div>
            </Card>

            {/* SEO Settings with Google SERP Preview */}
            <Card className="p-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Instellingen</h2>
              <div className="grid grid-cols-2 gap-6">
                {/* SEO Input Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Titel
                      <span className="text-xs text-gray-500 ml-2">
                        ({page.seoTitle?.length || 0}/60 karakters)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={page.seoTitle || ''}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 60)
                        setPage({ ...page, seoTitle: value })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder={page.title || 'SEO titel voor zoekmachines'}
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Laat leeg om pagina titel te gebruiken
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Beschrijving
                      <span className="text-xs text-gray-500 ml-2">
                        ({page.seoDescription?.length || 0}/160 karakters)
                      </span>
                    </label>
                    <textarea
                      value={page.seoDescription || ''}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 160)
                        setPage({ ...page, seoDescription: value })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder={page.description || 'SEO beschrijving voor zoekmachines'}
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Laat leeg om pagina beschrijving te gebruiken
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Canonical URL
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">https://www.bloemenvandegier.nl/</span>
                      <input
                        type="text"
                        value={page.slug || ''}
                        onChange={(e) => setPage({ ...page, slug: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="pagina-slug"
                      />
                    </div>
                  </div>
                </div>

                {/* Google SERP Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Zoekresultaat Preview
                  </label>
                  <GoogleSERPPreview page={page} />
                </div>
              </div>
            </Card>
          </div>

          {/* Blocks List */}
          <div className="space-y-4">
            {page.blocks.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Geen blokken</h3>
                <p className="text-gray-600 mb-6">Voeg je eerste blok toe om te beginnen</p>
                <Button
                  variant="primary"
                  onClick={() => setShowBlockSelector(true)}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Voeg Blok Toe
                </Button>
              </Card>
            ) : (
              page.blocks
                .sort((a, b) => a.order - b.order)
                .map((block, index) => {
                  const BlockIcon = getBlockIcon(block.type)
                  const isSelected = selectedBlock === block.id
                  
                  return (
                    <Card
                      key={block.id}
                      className={cn(
                        "p-4 transition-all",
                        isSelected && "ring-2 ring-primary-500",
                        draggedBlock === block.id && "opacity-50",
                        dragOverBlock === block.id && "border-2 border-primary-500 border-dashed"
                      )}
                      draggable
                      onDragStart={() => handleDragStart(block.id)}
                      onDragOver={(e) => handleDragOver(e, block.id)}
                      onDragEnd={handleDragEnd}
                      onDragLeave={() => {
                        if (dragOverBlock === block.id) {
                          setDragOverBlock(null)
                        }
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Drag Handle */}
                        <div className="flex flex-col gap-1 pt-2">
                          <button
                            onClick={() => handleMoveBlock(block.id, 'up')}
                            disabled={index === 0}
                            className={cn(
                              "p-1 text-gray-400 hover:text-gray-600 transition-colors",
                              index === 0 && "opacity-30 cursor-not-allowed"
                            )}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <div
                            className="cursor-move"
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation()
                              handleDragStart(block.id)
                            }}
                          >
                            <GripVertical className="h-5 w-5 text-gray-400" />
                          </div>
                          <button
                            onClick={() => handleMoveBlock(block.id, 'down')}
                            disabled={index === page.blocks.length - 1}
                            className={cn(
                              "p-1 text-gray-400 hover:text-gray-600 transition-colors",
                              index === page.blocks.length - 1 && "opacity-30 cursor-not-allowed"
                            )}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Block Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-primary-100 rounded-lg">
                              <BlockIcon className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {getBlockLabel(block.type)}
                              </h3>
                              <p className="text-xs text-gray-500">
                                Blok {index + 1} van {page.blocks.length}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDuplicateBlock(block.id)}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Dupliceer"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBlock(block.id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Verwijder"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Block Editor */}
                          <BlockEditor
                            block={block}
                            isSelected={isSelected}
                            onSelect={() => setSelectedBlock(block.id)}
                            onUpdate={(data) => handleUpdateBlock(block.id, data)}
                          />
                        </div>
                      </div>
                    </Card>
                  )
                })
            )}

            {/* Add Block Button */}
            {page.blocks.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowBlockSelector(true)}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed"
              >
                <Plus className="h-5 w-5" />
                Voeg Blok Toe
              </Button>
            )}
          </div>
        </div>

        {/* Block Selector Sidebar */}
        {showBlockSelector && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowBlockSelector(false)}
            />
            <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Voeg Blok Toe</h2>
                  <button
                    onClick={() => setShowBlockSelector(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Kies een blok type om toe te voegen
                </p>
              </div>
              <div className="p-4 space-y-2">
                {availableBlocks.map((blockOption) => {
                  const Icon = blockOption.icon
                  return (
                    <button
                      key={blockOption.type}
                      onClick={() => handleAddBlock(blockOption.type)}
                      className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <Icon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {blockOption.label}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {blockOption.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* Preview Sidebar */}
        {showPreview && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowPreview(false)}
            />
            <div className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl z-50 overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Preview</h2>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <PagePreview page={page} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Block Editor Component
function BlockEditor({ 
  block, 
  isSelected, 
  onSelect, 
  onUpdate 
}: { 
  block: PageBlock
  isSelected: boolean
  onSelect: () => void
  onUpdate: (data: Record<string, any>) => void
}) {
  const [isExpanded, setIsExpanded] = useState(isSelected)

  useEffect(() => {
    if (isSelected) {
      setIsExpanded(true)
    }
  }, [isSelected])

  return (
    <div>
      <button
        onClick={() => {
          setIsExpanded(!isExpanded)
          if (!isExpanded) {
            onSelect()
          }
        }}
        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
      >
        <span className="text-sm text-gray-600">Bewerk blok instellingen</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <BlockEditorForm block={block} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  )
}

// Block Editor Form
function BlockEditorForm({ 
  block, 
  onUpdate 
}: { 
  block: PageBlock
  onUpdate: (data: Record<string, any>) => void
}) {
  switch (block.type) {
    case 'hero':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
            <input
              type="text"
              value={block.data.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitel</label>
            <input
              type="text"
              value={block.data.subtitle || ''}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Achtergrond Afbeelding URL</label>
            <input
              type="text"
              value={block.data.backgroundImage || ''}
              onChange={(e) => onUpdate({ backgroundImage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="/hero.jpg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Tekst</label>
              <input
                type="text"
                value={block.data.ctaText || ''}
                onChange={(e) => onUpdate({ ctaText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
              <input
                type="text"
                value={block.data.ctaLink || ''}
                onChange={(e) => onUpdate({ ctaLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      )

    case 'text':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inhoud (HTML)</label>
            <WYSIWYGEditor
              value={block.data.content || ''}
              onChange={(content) => onUpdate({ content })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uitlijning</label>
              <select
                value={block.data.alignment || 'left'}
                onChange={(e) => onUpdate({ alignment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="left">Links</option>
                <option value="center">Gecentreerd</option>
                <option value="right">Rechts</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Breedte</label>
              <select
                value={block.data.maxWidth || '4xl'}
                onChange={(e) => onUpdate({ maxWidth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="sm">Klein</option>
                <option value="md">Medium</option>
                <option value="lg">Groot</option>
                <option value="xl">Extra Groot</option>
                <option value="4xl">4XL</option>
                <option value="full">Volledige Breedte</option>
              </select>
            </div>
          </div>
        </div>
      )

    case 'image':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Afbeelding URL</label>
            <input
              type="text"
              value={block.data.image || ''}
              onChange={(e) => onUpdate({ image: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alt Tekst</label>
            <input
              type="text"
              value={block.data.alt || ''}
              onChange={(e) => onUpdate({ alt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
            <input
              type="text"
              value={block.data.caption || ''}
              onChange={(e) => onUpdate({ caption: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      )

    case 'products':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
            <input
              type="text"
              value={block.data.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
            <select
              value={block.data.category || 'featured'}
              onChange={(e) => onUpdate({ category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="featured">Uitgelicht</option>
              <option value="all">Alle</option>
              <option value="rozen">Rozen</option>
              <option value="boeketten">Boeketten</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aantal</label>
              <input
                type="number"
                value={block.data.limit || 8}
                onChange={(e) => onUpdate({ limit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kolommen</label>
              <select
                value={block.data.columns || 4}
                onChange={(e) => onUpdate({ columns: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
          </div>
        </div>
      )

    default:
      return (
        <div className="text-sm text-gray-500">
          Editor voor dit blok type wordt binnenkort toegevoegd
        </div>
      )
  }
}

// WYSIWYG Editor Component
function WYSIWYGEditor({ 
  value, 
  onChange 
}: { 
  value: string
  onChange: (value: string) => void
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [htmlValue, setHtmlValue] = useState(value)

  useEffect(() => {
    setHtmlValue(value)
    if (editorRef.current) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    updateContent()
  }

  const updateContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      setHtmlValue(html)
      onChange(html)
    }
  }

  const handleLink = () => {
    const url = prompt('URL:')
    if (url) {
      handleFormat('createLink', url)
    }
  }

  const handleImage = () => {
    const url = prompt('Afbeelding URL:')
    if (url) {
      const alt = prompt('Alt tekst (optioneel):') || ''
      const img = `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto;" />`
      handleFormat('insertHTML', img)
    }
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => handleFormat('bold')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Vet (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('italic')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Cursief (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('underline')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Onderstrepen (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => handleFormat('justifyLeft')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Links uitlijnen"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('justifyCenter')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Centreren"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('justifyRight')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Rechts uitlijnen"
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => handleFormat('formatBlock', 'h2')}
          className="px-2 py-1 hover:bg-gray-200 rounded text-sm font-bold transition-colors"
          title="Kop 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => handleFormat('formatBlock', 'h3')}
          className="px-2 py-1 hover:bg-gray-200 rounded text-sm font-bold transition-colors"
          title="Kop 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => handleFormat('formatBlock', 'p')}
          className="px-2 py-1 hover:bg-gray-200 rounded text-sm transition-colors"
          title="Paragraaf"
        >
          P
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => handleFormat('insertUnorderedList')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Opsomming"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('insertOrderedList')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Genummerde lijst"
        >
          <span className="text-sm font-bold">1.</span>
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={handleLink}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Link toevoegen"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleImage}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Afbeelding toevoegen"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        onBlur={updateContent}
        className="min-h-[200px] p-4 focus:outline-none prose prose-lg max-w-none"
        style={{ 
          whiteSpace: 'pre-wrap',
          lineHeight: '1.75',
        }}
        suppressContentEditableWarning
      />
    </div>
  )
}

// Google SERP Preview Component
function GoogleSERPPreview({ page }: { page: Page }) {
  const seoTitle = page.seoTitle || page.title || 'Pagina titel'
  const seoDescription = page.seoDescription || page.description || 'Pagina beschrijving'
  const displayUrl = page.slug 
    ? `https://www.bloemenvandegier.nl/${page.slug === 'home' ? '' : page.slug}`
    : 'https://www.bloemenvandegier.nl/'
  
  const titleLength = seoTitle.length
  const descriptionLength = seoDescription.length
  const titleWarning = titleLength > 60
  const descriptionWarning = descriptionLength > 160

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Google Logo and Search Bar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Google</span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2">
          <span className="text-sm text-gray-600">{seoTitle}</span>
        </div>
      </div>

      {/* SERP Result */}
      <div className="p-4">
        <div className="mb-1">
          {/* URL */}
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs text-gray-500">{displayUrl}</span>
            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Title */}
          <h3 className={cn(
            "text-xl text-blue-600 hover:underline cursor-pointer mb-1 leading-snug",
            titleWarning && "text-red-600"
          )}>
            {seoTitle}
          </h3>
          
          {/* Description */}
          <p className={cn(
            "text-sm text-gray-700 leading-relaxed",
            descriptionWarning && "text-red-600"
          )}>
            {seoDescription}
          </p>
        </div>

        {/* Character Count Warnings */}
        {(titleWarning || descriptionWarning) && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
            {titleWarning && (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>SEO titel is te lang ({titleLength}/60). Google kan deze afkappen.</span>
              </div>
            )}
            {descriptionWarning && (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>SEO beschrijving is te lang ({descriptionLength}/160). Google kan deze afkappen.</span>
              </div>
            )}
          </div>
        )}

        {/* SEO Tips */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-medium text-gray-700 mb-2">SEO Tips:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Gebruik belangrijke keywords in de titel</li>
              <li>Houd de titel tussen 50-60 karakters</li>
              <li>Schrijf een aantrekkelijke beschrijving (150-160 karakters)</li>
              <li>Gebruik een call-to-action in de beschrijving</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Page Preview Component
function PagePreview({ page }: { page: Page }) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{page.title}</h1>
        {page.description && (
          <p className="text-gray-600">{page.description}</p>
        )}
      </div>

      {page.blocks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Geen blokken om te previewen</p>
        </div>
      ) : (
        <div className="space-y-8">
          {page.blocks
            .sort((a, b) => a.order - b.order)
            .map((block) => (
              <BlockPreview key={block.id} block={block} />
            ))}
        </div>
      )}
    </div>
  )
}

// Block Preview Component
function BlockPreview({ block }: { block: PageBlock }) {
  switch (block.type) {
    case 'hero':
      return (
        <section
          className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden bg-cover bg-center bg-no-repeat min-h-[400px] flex items-center"
          style={{
            backgroundImage: block.data.backgroundImage ? `url(${block.data.backgroundImage})` : undefined,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/50 to-primary-500/10" />
          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6">
                {block.data.title || 'Titel'}
              </h1>
              <p className="text-lg md:text-xl text-white mb-8">
                {block.data.subtitle || 'Subtitel'}
              </p>
              <div className="flex gap-4">
                {block.data.ctaText && (
                  <Button size="lg">
                    {block.data.ctaText}
                  </Button>
                )}
                {block.data.ctaText2 && (
                  <Button variant="outline" size="lg" className="border-white text-white">
                    {block.data.ctaText2}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      )

    case 'text':
      return (
        <section className={cn(
          "py-12",
          block.data.alignment === 'center' && "text-center",
          block.data.alignment === 'right' && "text-right"
        )}>
          <div className={cn(
            "container mx-auto px-4",
            block.data.maxWidth === 'sm' && "max-w-sm",
            block.data.maxWidth === 'md' && "max-w-md",
            block.data.maxWidth === 'lg' && "max-w-lg",
            block.data.maxWidth === 'xl' && "max-w-xl",
            block.data.maxWidth === '4xl' && "max-w-4xl",
            block.data.maxWidth === 'full' && "max-w-full"
          )}>
            <div
              dangerouslySetInnerHTML={{ __html: block.data.content || '<p>Voeg tekst toe...</p>' }}
              className="prose prose-lg max-w-none"
            />
          </div>
        </section>
      )

    case 'image':
      return (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className={cn(
              "flex",
              block.data.alignment === 'center' && "justify-center",
              block.data.alignment === 'right' && "justify-end"
            )}>
              {block.data.image ? (
                <div className="max-w-4xl">
                  <img
                    src={block.data.image}
                    alt={block.data.alt || ''}
                    className="w-full h-auto rounded-lg"
                  />
                  {block.data.caption && (
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      {block.data.caption}
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                  Geen afbeelding
                </div>
              )}
            </div>
          </div>
        </section>
      )

    case 'products':
      return (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            {block.data.title && (
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                {block.data.title}
              </h2>
            )}
            <div className={cn(
              "grid gap-6",
              block.data.columns === 2 && "grid-cols-1 md:grid-cols-2",
              block.data.columns === 3 && "grid-cols-1 md:grid-cols-3",
              block.data.columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            )}>
              {Array.from({ length: block.data.limit || 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4"></div>
                  <h3 className="font-semibold text-gray-900 mb-2">Product {i + 1}</h3>
                  <p className="text-primary-600 font-bold">€29.95</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )

    default:
      return (
        <div className="p-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 text-center text-gray-500">
          Preview voor {block.type} blok
        </div>
      )
  }
}
