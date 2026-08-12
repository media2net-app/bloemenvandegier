'use client'

import { usePathname } from 'next/navigation'
import { AlertTriangle, Package } from 'lucide-react'
import OrderDashboardSidebar from '@/components/order-dashboard/OrderDashboardSidebar'
import RequireAuth from '@/components/order-dashboard/RequireAuth'
import { isOrderDashboardTestMode } from '@/lib/order-dashboard/test-mode'

const PAGE_TITLES: Record<string, string> = {
  '/order-dashboard': 'Orders',
  '/order-dashboard/order-formulier': 'Order formulier',
}

export default function OrderDashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPrint = pathname?.includes('/print/')
  const testMode = isOrderDashboardTestMode()
  const pageTitle =
    PAGE_TITLES[pathname ?? ''] ||
    (pathname?.match(/^\/order-dashboard\/\d+$/) ? 'Orderdetail' : 'Order dashboard')

  if (isPrint) {
    return <RequireAuth>{children}</RequireAuth>
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        {testMode && (
          <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-amber-950 shadow-md">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            <span>
              TESTMODUS AAN — veilig testen. Niets wordt doorgeschreven naar WooCommerce of
              Pakketpartner.
            </span>
          </div>
        )}
        <OrderDashboardSidebar testMode={testMode} />
        <main className={`ml-64 min-h-screen ${testMode ? 'pt-10' : ''}`}>
          <header
            className={`sticky z-30 border-b border-gray-200 bg-white px-8 py-5 ${
              testMode ? 'top-10' : 'top-0'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <Package className="h-4 w-4 text-primary-600" />
              {testMode ? 'WooCommerce (alleen lezen)' : 'Live WooCommerce shop'}
              {testMode && (
                <span className="rounded bg-amber-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-950">
                  Testmodus
                </span>
              )}
            </div>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">{pageTitle}</h1>
          </header>
          <div className="p-8">{children}</div>
        </main>
      </div>
    </RequireAuth>
  )
}
