'use client'

import Link from 'next/link'
import { NAVIGATION } from '@/lib/utils/constants'
import { X, Truck } from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-lg font-bold text-primary-600">Menu</span>
            <button
              onClick={onClose}
              className="p-2 text-gray-700 hover:text-primary-600"
              aria-label="Sluit menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {NAVIGATION.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-500 rounded-lg transition-colors font-medium"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/track"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-500 rounded-lg transition-colors font-medium"
                >
                  <Truck className="h-5 w-5" />
                  Volg mijn bestelling
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}
