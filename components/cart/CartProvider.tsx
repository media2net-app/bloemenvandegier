'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import CartSidebar from './CartSidebar'

interface CartContextType {
  openCart: () => void
  closeCart: () => void
  isOpen: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  return (
    <CartContext.Provider value={{ openCart, closeCart, isOpen }}>
      {children}
      <CartSidebar isOpen={isOpen} onClose={closeCart} />
    </CartContext.Provider>
  )
}
