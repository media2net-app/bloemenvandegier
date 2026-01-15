'use client'

import { useState } from 'react'
import { Plus, Package, ShoppingCart, Users, FileText, Settings, X, Search, Download, Upload, Eye, Edit } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

interface QuickAction {
  id: string
  label: string
  icon: any
  action: () => void
  category: 'create' | 'view' | 'export' | 'import' | 'settings'
}

export default function QuickActions() {
  const router = useRouter()
  const pathname = usePathname() || ''
  const [isOpen, setIsOpen] = useState(false)

  // Only show on admin pages
  if (!pathname || !pathname.startsWith('/admin')) {
    return null
  }

  // Context-aware actions based on current page
  const getContextActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = [
      {
        id: 'search',
        label: 'Zoeken',
        icon: Search,
        action: () => {
          // Trigger global search (Cmd+K)
          const event = new KeyboardEvent('keydown', {
            key: 'k',
            metaKey: true,
            bubbles: true,
          })
          document.dispatchEvent(event)
          setIsOpen(false)
        },
        category: 'view',
      },
    ]

    if (pathname?.startsWith('/admin/producten')) {
      return [
        ...baseActions,
        {
          id: 'new-product',
          label: 'Nieuw Product',
          icon: Plus,
          action: () => {
            router.push('/admin/producten/bewerken/new')
            setIsOpen(false)
          },
          category: 'create',
        },
        {
          id: 'export-products',
          label: 'Export Producten',
          icon: Download,
          action: () => {
            // Trigger export
            setIsOpen(false)
          },
          category: 'export',
        },
        {
          id: 'import-products',
          label: 'Import Producten',
          icon: Upload,
          action: () => {
            // Trigger import
            setIsOpen(false)
          },
          category: 'import',
        },
      ]
    }

    if (pathname?.startsWith('/admin/bestellingen')) {
      return [
        ...baseActions,
        {
          id: 'new-order',
          label: 'Nieuwe Bestelling',
          icon: Plus,
          action: () => {
            // Create new order
            setIsOpen(false)
          },
          category: 'create',
        },
        {
          id: 'export-orders',
          label: 'Export Bestellingen',
          icon: Download,
          action: () => {
            // Trigger export
            setIsOpen(false)
          },
          category: 'export',
        },
      ]
    }

    if (pathname?.startsWith('/admin/klanten')) {
      return [
        ...baseActions,
        {
          id: 'new-customer',
          label: 'Nieuwe Klant',
          icon: Plus,
          action: () => {
            // Create new customer
            setIsOpen(false)
          },
          category: 'create',
        },
        {
          id: 'export-customers',
          label: 'Export Klanten',
          icon: Download,
          action: () => {
            // Trigger export
            setIsOpen(false)
          },
          category: 'export',
        },
      ]
    }

    if (pathname?.startsWith('/admin/paginas')) {
      return [
        ...baseActions,
        {
          id: 'new-page',
          label: 'Nieuwe Pagina',
          icon: Plus,
          action: () => {
            router.push('/admin/paginas/nieuw')
            setIsOpen(false)
          },
          category: 'create',
        },
      ]
    }

    // Default actions
    return [
      ...baseActions,
      {
        id: 'products',
        label: 'Producten',
        icon: Package,
        action: () => {
          router.push('/admin/producten')
          setIsOpen(false)
        },
        category: 'view',
      },
      {
        id: 'orders',
        label: 'Bestellingen',
        icon: ShoppingCart,
        action: () => {
          router.push('/admin/bestellingen')
          setIsOpen(false)
        },
        category: 'view',
      },
      {
        id: 'customers',
        label: 'Klanten',
        icon: Users,
        action: () => {
          router.push('/admin/klanten')
          setIsOpen(false)
        },
        category: 'view',
      },
      {
        id: 'settings',
        label: 'Instellingen',
        icon: Settings,
        action: () => {
          router.push('/admin/instellingen')
          setIsOpen(false)
        },
        category: 'settings',
      },
    ]
  }

  const actions = getContextActions()
  const categories = ['create', 'view', 'export', 'import', 'settings'] as const

  const getCategoryLabel = (category: typeof categories[number]) => {
    switch (category) {
      case 'create': return 'Aanmaken'
      case 'view': return 'Bekijken'
      case 'export': return 'Exporteren'
      case 'import': return 'Importeren'
      case 'settings': return 'Instellingen'
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all flex items-center justify-center",
          isOpen && "rotate-45"
        )}
        aria-label="Quick Actions"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </button>

      {/* Actions Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-24 right-6 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-80 max-h-[70vh] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Snelle Acties</h3>
              <p className="text-xs text-gray-500 mt-0.5">Kies een actie om uit te voeren</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {categories.map((category) => {
                const categoryActions = actions.filter(a => a.category === category)
                if (categoryActions.length === 0) return null

                return (
                  <div key={category} className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 mb-2">
                      {getCategoryLabel(category)}
                    </h4>
                    <div className="space-y-1">
                      {categoryActions.map((action) => {
                        const Icon = action.icon
                        return (
                          <button
                            key={action.id}
                            onClick={action.action}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                          >
                            <div className="p-1.5 bg-gray-100 rounded">
                              <Icon className="h-4 w-4 text-gray-600" />
                            </div>
                            <span>{action.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
