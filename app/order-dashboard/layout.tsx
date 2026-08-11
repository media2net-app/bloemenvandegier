import type { Metadata } from 'next'
import OrderDashboardShell from '@/components/order-dashboard/OrderDashboardShell'

export const metadata: Metadata = {
  title: 'Order dashboard | Bloemen van De Gier',
  description: 'Live WooCommerce orders, pakbonnen, facturen en kaartjes',
}

export default function OrderDashboardLayout({ children }: { children: React.ReactNode }) {
  return <OrderDashboardShell>{children}</OrderDashboardShell>
}
