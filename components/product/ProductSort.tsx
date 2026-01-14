'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SortOption {
  value: string
  label: string
}

const sortOptions: SortOption[] = [
  { value: 'popularity', label: 'Populairste eerst' },
  { value: 'price-asc', label: 'Prijs: Laag naar Hoog' },
  { value: 'price-desc', label: 'Prijs: Hoog naar Laag' },
  { value: 'newest', label: 'Nieuwste eerst' },
  { value: 'rating', label: 'Hoogste beoordeling' },
]

interface ProductSortProps {
  currentSort?: string
  onSortChange: (sort: string) => void
  productCount?: number
}

export default function ProductSort({
  currentSort = 'popularity',
  onSortChange,
  productCount,
}: ProductSortProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentLabel = sortOptions.find((opt) => opt.value === currentSort)?.label || 'Sorteren'

  return (
    <div className="flex items-center justify-between mb-6">
      {productCount !== undefined && (
        <p className="text-sm text-gray-600">
          {productCount} {productCount === 1 ? 'product' : 'producten'} gevonden
        </p>
      )}

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-primary-500 transition-colors text-sm font-medium text-gray-700"
        >
          <span>{currentLabel}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <div className="py-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors',
                      currentSort === option.value && 'bg-primary-50 text-primary-600 font-medium'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
