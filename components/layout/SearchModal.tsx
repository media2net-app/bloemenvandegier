'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { X, Search, Loader2 } from 'lucide-react'
import { searchProducts } from '@/lib/data/products'
import { formatPrice } from '@/lib/utils/format'
import { getProductImage } from '@/lib/utils/getProductImage'
import type { Product } from '@/lib/data/products'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      
      // Handle ESC key
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    } else {
      // Clear search when modal closes
      setQuery('')
      setResults([])
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    // Debounce search
    const timeoutId = setTimeout(() => {
      const searchResults = searchProducts(query)
      setResults(searchResults.slice(0, 12)) // Limit to 12 results
      setIsSearching(false)
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      setIsSearching(false)
    }
  }, [query])

  const handleProductClick = (product: Product) => {
    onClose()
    router.push(`/product/${product.slug}`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop with transparent green */}
      <div 
        className="absolute inset-0 bg-primary-500/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="relative z-10 px-4 py-6 border-b border-primary-400/30">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Zoek naar bloemen, boeketten, rozen..."
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-white/40 focus:bg-white/15 text-lg backdrop-blur-sm"
                />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70 animate-spin" />
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Sluit zoeken"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-4xl px-4 py-8">
            {!query.trim() ? (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/80 text-lg">Begin met typen om te zoeken...</p>
              </div>
            ) : results.length === 0 && !isSearching ? (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/80 text-lg mb-2">Geen resultaten gevonden</p>
                <p className="text-white/60">Probeer een andere zoekterm</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    {isSearching ? 'Zoeken...' : `${results.length} resultaten gevonden`}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((product) => {
                    const image = getProductImage(product.images)
                    return (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:border-white/40 transition-all text-left"
                      >
                        <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden bg-white/10">
                          <Image
                            src={image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-100 transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-white">
                            {formatPrice(product.price)}
                          </span>
                          {product.on_sale && (
                            <span className="text-sm text-white/70 line-through">
                              {formatPrice(product.regular_price)}
                            </span>
                          )}
                        </div>
                        {product.stock_status === 'outofstock' && (
                          <span className="inline-block mt-2 text-xs text-white/70 bg-white/10 px-2 py-1 rounded">
                            Uitverkocht
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer hint */}
        {query.trim() && results.length > 0 && (
          <div className="relative z-10 px-4 py-4 border-t border-primary-400/30 bg-primary-500/50 backdrop-blur-sm">
            <div className="container mx-auto max-w-4xl">
              <p className="text-white/70 text-sm text-center">
                Druk op <kbd className="px-2 py-1 bg-white/10 rounded text-xs">ESC</kbd> om te sluiten
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
