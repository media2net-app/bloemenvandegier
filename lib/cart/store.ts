'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItemAddon {
  id: string
  name: string
  price: number
}

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  permalink: string
  sku?: string
  addons?: CartItemAddon[]
  cardMessage?: string
  ribbonText?: string
  ribbonColor?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existingItem = get().items.find(i => i.id === item.id)
        if (existingItem) {
          set({
            items: get().items.map(i =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          set({ items: [...get().items, item] })
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter(i => i.id !== id) })
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set({
          items: get().items.map(i =>
            i.id === id ? { ...i, quantity } : i
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce(
          (total, item) => {
            const itemPrice = item.price * item.quantity
            const addonsPrice = (item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0) * item.quantity
            return total + itemPrice + addonsPrice
          },
          0
        )
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }),
    }
  )
)
