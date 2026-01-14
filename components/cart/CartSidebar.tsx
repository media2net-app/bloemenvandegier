'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/lib/cart/store'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils/format'
import { getProductImage } from '@/lib/utils/getProductImage'
import { cn } from '@/lib/utils/cn'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore()

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const total = getTotal()
  const itemCount = getItemCount()

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Bloemenmand ({itemCount})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Sluit bloemenmand"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Je bloemenmand is leeg
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  Voeg producten toe aan je bloemenmand om verder te gaan
                </p>
                <Button onClick={onClose} variant="outline">
                  Verder winkelen
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.sku || ''}`}
                    className="flex gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    {/* Product Image */}
                    <Link
                      href={item.permalink}
                      onClick={onClose}
                      className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={getProductImage([{ src: item.image }])}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={item.permalink}
                        onClick={onClose}
                        className="block"
                      >
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-primary-600 transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatPrice(item.price)}
                      </p>

                      {/* Addons */}
                      {item.addons && item.addons.length > 0 && (
                        <div className="mb-2 space-y-1">
                          <p className="text-xs font-medium text-gray-700">Extra opties:</p>
                          <ul className="text-xs text-gray-600 space-y-0.5">
                            {item.addons.map((addon) => (
                              <li key={addon.id} className="flex items-center justify-between">
                                <span className="flex-1">• {addon.name}</span>
                                <span className="ml-2 text-primary-600 font-medium">
                                  {formatPrice(addon.price)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Card message indicator */}
                      {item.cardMessage && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Kaartje:</span> {item.cardMessage.length > 30 ? `${item.cardMessage.substring(0, 30)}...` : item.cardMessage}
                          </p>
                        </div>
                      )}

                      {/* Ribbon indicator */}
                      {item.ribbonText && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Lint:</span> {item.ribbonText} ({item.ribbonColor})
                          </p>
                        </div>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1)
                              } else {
                                removeItem(item.id)
                              }
                            }}
                            className="p-1.5 hover:bg-gray-100 transition-colors"
                            aria-label="Verminder aantal"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-1 min-w-[2.5rem] text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-100 transition-colors"
                            aria-label="Verhoog aantal"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          aria-label="Verwijder product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(
                          (
                            (item.price * item.quantity) +
                            (item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0) * item.quantity
                          ).toFixed(2)
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-gray-900">Totaal:</span>
                <span className="text-primary-600">{formatPrice(total.toFixed(2))}</span>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link href="/afrekenen" onClick={onClose}>
                    Afrekenen
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={onClose}
                >
                  Verder winkelen
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
