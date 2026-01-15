'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product } from '@/lib/data/products'

interface WishlistStore {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: number) => void
  isInWishlist: (productId: number) => boolean
  toggleItem: (product: Product) => void
  clearWishlist: () => void
  getItemCount: () => number
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const existingItem = get().items.find(item => item.id === product.id)
        if (!existingItem) {
          set({ items: [...get().items, product] })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.id !== productId) })
      },
      isInWishlist: (productId) => {
        return get().items.some(item => item.id === productId)
      },
      toggleItem: (product) => {
        const isInWishlist = get().isInWishlist(product.id)
        if (isInWishlist) {
          get().removeItem(product.id)
        } else {
          get().addItem(product)
        }
      },
      clearWishlist: () => set({ items: [] }),
      getItemCount: () => get().items.length,
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }),
    }
  )
)
