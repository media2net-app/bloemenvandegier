'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SubMenuItem {
  name: string
  href: string
  description?: string
}

interface CategoryMenuItem {
  name: string
  href: string
  submenu?: SubMenuItem[]
}

interface CategoryDropdownProps {
  item: CategoryMenuItem
  isActive: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  renderDropdownOutside?: boolean
  renderDropdownOnly?: boolean
}

export default function CategoryDropdown({ item, isActive, onMouseEnter, onMouseLeave, renderDropdownOutside = false, renderDropdownOnly = false }: CategoryDropdownProps) {
  const [headerHeight, setHeaderHeight] = useState(65) // Default: h-16 (64px) + border (1px)
  
  useEffect(() => {
    // Calculate exact header height including border
    const updateHeaderHeight = () => {
      const header = document.querySelector('header')
      if (header) {
        // Use getBoundingClientRect to get exact position including border
        const rect = header.getBoundingClientRect()
        // Get the bottom position of the header (which is where dropdown should start)
        const bottom = rect.bottom
        setHeaderHeight(bottom)
      }
    }
    
    // Update on mount and when dropdown becomes active
    updateHeaderHeight()
    
    // Use requestAnimationFrame for smooth updates
    const rafId = requestAnimationFrame(updateHeaderHeight)
    
    window.addEventListener('resize', updateHeaderHeight)
    window.addEventListener('scroll', updateHeaderHeight, { passive: true })
    
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', updateHeaderHeight)
      window.removeEventListener('scroll', updateHeaderHeight)
    }
  }, [isActive]) // Recalculate when dropdown becomes active

  if (!item.submenu || item.submenu.length === 0) {
    return (
      <Link
        href={item.href}
        className="text-white hover:text-primary-100 transition-colors font-medium"
      >
        {item.name}
      </Link>
    )
  }

  // If renderDropdownOnly is true, only render the dropdown (not the trigger)
  if (renderDropdownOnly) {
    if (!isActive) return null
    
    return (
      <>
        {/* Invisible bridge to connect navbar to dropdown - prevents gap */}
        <div 
          className="fixed z-[54]"
          style={{ 
            top: `${headerHeight - 10}px`,
            left: 0,
            right: 0,
            height: '10px',
            background: 'transparent'
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
        {/* Overlay backdrop - dims the rest of the site, starts below header */}
        <div 
          className="fixed bg-black/30 z-[50] transition-opacity"
          style={{ 
            top: `${headerHeight}px`,
            left: 0,
            right: 0,
            bottom: 0
          }}
          onMouseEnter={onMouseLeave}
        />
        {/* Dropdown menu - positioned right below navbar */}
        <div 
          className="fixed left-0 right-0 bg-white shadow-xl z-[55]"
          style={{ 
            top: `${headerHeight}px`,
            transform: 'translateZ(0)' // Force hardware acceleration
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-4 gap-8">
              {item.submenu?.map((subItem, index) => (
                <Link
                  key={index}
                  href={subItem.href}
                  className="group p-4 rounded-lg hover:bg-primary-50 transition-colors"
                  onClick={onMouseLeave}
                >
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {subItem.name}
                  </h3>
                  {subItem.description && (
                    <p className="text-sm text-gray-600">
                      {subItem.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-1 text-white hover:text-primary-100 transition-colors font-medium",
          isActive && "text-primary-100"
        )}
      >
        {item.name}
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          isActive && "rotate-180"
        )} />
      </Link>

      {/* Full width dropdown - render outside header if renderDropdownOutside is true */}
      {isActive && !renderDropdownOutside && (
        <>
          {/* Overlay backdrop - dims the rest of the site, starts below header */}
          <div 
            className="fixed bg-black/30 z-[50] transition-opacity"
            style={{ 
              top: `${headerHeight}px`,
              left: 0,
              right: 0,
              bottom: 0
            }}
            onMouseEnter={onMouseLeave}
          />
          {/* Dropdown menu - positioned right below navbar */}
          <div 
            className="fixed left-0 right-0 bg-white shadow-xl z-[55]"
            style={{ 
              top: `${headerHeight}px`,
              transform: 'translateZ(0)' // Force hardware acceleration
            }}
          >
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-4 gap-8">
                {item.submenu?.map((subItem, index) => (
                  <Link
                    key={index}
                    href={subItem.href}
                    className="group p-4 rounded-lg hover:bg-primary-50 transition-colors"
                    onClick={onMouseLeave}
                  >
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {subItem.name}
                    </h3>
                    {subItem.description && (
                      <p className="text-sm text-gray-600">
                        {subItem.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
