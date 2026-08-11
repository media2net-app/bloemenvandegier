'use client'

import { usePathname } from 'next/navigation'
import { Package } from 'lucide-react'
import OrderDashboardSidebar from '@/components/order-dashboard/OrderDashboardSidebar'
import RequireAuth from '@/components/order-dashboard/RequireAuth'

const PAGE_TITLES: Record<string, string> = {
  '/order-dashboard': 'Orders',
}

export default function OrderDashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPrint = pathname?.includes('/print/')
  const pageTitle =
    PAGE_TITLES[pathname ?? ''] ||
    (pathname?.match(/^\/order-dashboard\/\d+$/) ? 'Orderdetail' : 'Order dashboard')

  if (isPrint) {
    return <RequireAuth>{children}</RequireAuth>
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <OrderDashboardSidebar />
        <main className="ml-64 min-h-screen">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-8 py-5">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Package className="h-4 w-4 text-primary-600" />
              Live WooCommerce shop
            </div>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">{pageTitle}</h1>
          </header>
          <div className="p-8">{children}</div>
        </main>
      </div>
    </RequireAuth>
  )
}
