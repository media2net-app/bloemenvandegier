'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product } from '@/lib/data/products'

interface ComparisonStore {
  products: Product[]
  addProduct: (product: Product) => void
  removeProduct: (productId: number) => void
  clearComparison: () => void
  isInComparison: (productId: number) => boolean
  toggleProduct: (product: Product) => void
  getProductCount: () => number
}

const MAX_COMPARISON_ITEMS = 4

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      products: [],
      addProduct: (product) => {
        const currentProducts = get().products
        if (currentProducts.length >= MAX_COMPARISON_ITEMS) {
          // Remove oldest product
          const newProducts = [...currentProducts.slice(1), product]
          set({ products: newProducts })
        } else if (!currentProducts.find(p => p.id === product.id)) {
          set({ products: [...currentProducts, product] })
        }
      },
      removeProduct: (productId) => {
        set({ products: get().products.filter(p => p.id !== productId) })
      },
      clearComparison: () => set({ products: [] }),
      isInComparison: (productId) => {
        return get().products.some(p => p.id === productId)
      },
      toggleProduct: (product) => {
        const isInComparison = get().isInComparison(product.id)
        if (isInComparison) {
          get().removeProduct(product.id)
        } else {
          get().addProduct(product)
        }
      },
      getProductCount: () => get().products.length,
    }),
    {
      name: 'comparison-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }),
    }
  )
)
