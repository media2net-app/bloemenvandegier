'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  LayoutGrid,
  LogOut,
  ExternalLink,
  Package,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/lib/auth/store'

const menuItems = [
  { name: 'Overzicht', href: '/order-dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Order formulier', href: '/order-dashboard/order-formulier', icon: FileText },
]

export default function OrderDashboardSidebar({
  testMode = false,
}: {
  testMode?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)

  return (
    <aside
      className={`fixed left-0 z-40 flex w-64 flex-col bg-primary-800 text-white ${
        testMode ? 'top-10 h-[calc(100vh-2.5rem)]' : 'top-0 h-screen'
      }`}
    >
      <div className="border-b border-primary-700 p-6">
        <Link href="/kiezen" className="mb-4 block no-underline">
          <Image
            src="/images/logo.svg"
            alt="Bloemen van De Gier"
            width={200}
            height={50}
            className="h-10 w-auto brightness-0 invert"
            priority
          />
        </Link>
        <div>
          <p className="text-sm font-semibold leading-tight text-white">Order dashboard</p>
          {testMode ? (
            <p className="mt-1 inline-flex rounded bg-amber-500 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-950">
              Testmodus
            </p>
          ) : (
            <p className="text-xs text-primary-200">Live WooCommerce</p>
          )}
          {user?.email && (
            <p className="mt-1 truncate text-xs text-primary-300">{user.email}</p>
          )}
        </div>
      </div>

      <nav className="sidebar-scrollbar flex-1 overflow-y-auto p-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-primary-300">
          Orders
        </p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>

        <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-primary-300">
          Snelkoppelingen
        </p>
        <ul className="space-y-1">
          <li>
            <a
              href="https://www.bloemenvandegier.nl/wp-admin"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-primary-100 transition-colors hover:bg-primary-700 hover:text-white"
            >
              <Package className="h-4 w-4 shrink-0" />
              <span className="flex-1">WooCommerce Admin</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </li>
          <li>
            <Link
              href="/kiezen"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-primary-100 transition-colors hover:bg-primary-700 hover:text-white"
            >
              <LayoutGrid className="h-4 w-4 shrink-0" />
              Dashboards kiezen
            </Link>
          </li>
        </ul>
      </nav>

      <div className="border-t border-primary-700 p-4">
        <button
          type="button"
          onClick={() => {
            logout()
            router.push('/login')
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-200 transition-colors hover:bg-primary-700 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Uitloggen
        </button>
      </div>
    </aside>
  )
}
