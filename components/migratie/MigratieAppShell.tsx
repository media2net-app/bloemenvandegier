'use client'

import { usePathname } from 'next/navigation'
import { ArrowLeftRight, AlertTriangle, RefreshCw } from 'lucide-react'
import MigratieSidebar from '@/components/migratie/MigratieSidebar'
import { MigrationStatusProvider, useMigrationStatusContext } from '@/components/migratie/MigrationStatusContext'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const PAGE_TITLES: Record<string, string> = {
  '/migratie': 'Migratie Dashboard',
  '/migratie/sam': 'Gids voor Sam',
  '/migratie/taken': 'Takenlijst',
  '/migratie/afspraken': 'Afspraken',
  '/migratie/fases': 'Migratiefases',
  '/migratie/golive': 'Blok B — Livegang',
}

function MigratieAppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { status, isLoading, error, loadStatus } = useMigrationStatusContext()
  const pageTitle = PAGE_TITLES[pathname ?? ''] ?? 'Migratie Dashboard'

  if (isLoading && !status) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary-500" />
          <p className="mt-4 text-gray-600">Migratiestatus laden...</p>
        </div>
      </div>
    )
  }

  if (error && !status) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-md p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-4 font-medium text-gray-900">Migratie laden mislukt</p>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <Button className="mt-4" onClick={loadStatus}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Opnieuw proberen
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MigratieSidebar />

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ArrowLeftRight className="h-4 w-4" />
                WooCommerce → Shopify
              </div>
              <h1 className="mt-1 text-2xl font-bold text-gray-900">{pageTitle}</h1>
              <p className="text-sm text-gray-500">
                {status?.stats.wcStore} → {status?.stats.shopifyStore}
              </p>
            </div>
            <Button variant="outline" onClick={loadStatus} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Vernieuwen
            </Button>
          </div>
        </header>

        <div className="space-y-8 p-8">
          {error && (
            <Card className="border-red-200 bg-red-50 p-4 text-red-700">{error}</Card>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}

export default function MigratieAppShell({ children }: { children: React.ReactNode }) {
  return (
    <MigrationStatusProvider>
      <MigratieAppShellInner>{children}</MigratieAppShellInner>
    </MigrationStatusProvider>
  )
}
