import type { Metadata } from 'next'
import MigratieAppShell from '@/components/migratie/MigratieAppShell'

export const metadata: Metadata = {
  title: 'Migratie Dashboard | Bloemen van De Gier',
  description: 'Overzicht WooCommerce naar Shopify migratie',
}

export default function MigratieLayout({ children }: { children: React.ReactNode }) {
  return <MigratieAppShell>{children}</MigratieAppShell>
}
