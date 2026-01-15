'use client'

import { useState } from 'react'
import { X, Filter } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface ProductFiltersProps {
  filters: {
    price?: FilterOption[]
    color?: FilterOption[]
    availability?: FilterOption[]
  }
  activeFilters: Record<string, string[]>
  onFilterChange: (filterType: string, value: string) => void
  onClearFilters: () => void
}

export default function ProductFilters({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const activeCount = Object.values(activeFilters).flat().length

  return (
    <div className="relative">
      {/* Mobile filter button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <Badge variant="default" className="ml-2">
                {activeCount}
              </Badge>
            )}
          </span>
          {isOpen ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
        </Button>
      </div>

      {/* Filter panel */}
      <div
        className={cn(
          'lg:block',
          isOpen ? 'block' : 'hidden'
        )}
      >
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Filters</h3>
            {activeCount > 0 && (
              <button
                onClick={onClearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Wis alles
              </button>
            )}
          </div>

          {/* Price filter */}
          {filters.price && filters.price.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Prijs</h4>
              <div className="space-y-2">
                {filters.price.map((option) => {
                  const isActive = activeFilters.price?.includes(option.value)
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer hover:text-primary-600"
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => onFilterChange('price', option.value)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">
                        {option.label}
                        {option.count !== undefined && (
                          <span className="text-gray-400 ml-1">({option.count})</span>
                        )}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* Color filter */}
          {filters.color && filters.color.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Kleur</h4>
              <div className="space-y-1.5">
                {filters.color.map((option) => {
                  const isActive = activeFilters.color?.includes(option.value)
                  const colorMap: Record<string, string> = {
                    rood: 'bg-red-500',
                    roze: 'bg-pink-500',
                    wit: 'bg-white border border-gray-300',
                    geel: 'bg-yellow-400',
                    blauw: 'bg-blue-500',
                    paars: 'bg-purple-500',
                    oranje: 'bg-orange-500',
                    groen: 'bg-green-500',
                    gemengd: 'bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400',
                    multicolor: 'bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400',
                  }
                  const bgColor = colorMap[option.value.toLowerCase()] || 'bg-gray-400'
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => onFilterChange('color', option.value)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-left",
                        isActive
                          ? "bg-primary-50 border border-primary-300"
                          : "hover:bg-gray-50 border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full flex-shrink-0 shadow-sm",
                        bgColor,
                        isActive && "ring-2 ring-primary-600 ring-offset-1"
                      )} />
                      <span className="text-sm text-gray-700 flex-1">
                        {option.label}
                      </span>
                      {option.count !== undefined && (
                        <span className={cn(
                          "text-xs font-medium px-1.5 py-0.5 rounded",
                          isActive 
                            ? "bg-primary-600 text-white" 
                            : "bg-gray-200 text-gray-600"
                        )}>
                          {option.count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Availability filter */}
          {filters.availability && filters.availability.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Beschikbaarheid</h4>
              <div className="space-y-2">
                {filters.availability.map((option) => {
                  const isActive = activeFilters.availability?.includes(option.value)
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer hover:text-primary-600"
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => onFilterChange('availability', option.value)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">
                        {option.label}
                        {option.count !== undefined && (
                          <span className="text-gray-400 ml-1">({option.count})</span>
                        )}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
