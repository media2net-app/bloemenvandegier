'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  FileText,
  ExternalLink,
  CheckSquare,
  Globe,
  Settings,
  Terminal,
  ScrollText,
  User,
  Rocket,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { ShopifyCliStatus } from '@/lib/migration/shopify-cli'

const menuItems = [
  { name: 'Overzicht', href: '/migratie', icon: LayoutDashboard, exact: true },
  { name: 'Voor Sam', href: '/migratie/sam', icon: User },
  { name: 'Blok B — Livegang', href: '/migratie/golive', icon: Rocket },
  { name: 'Taken', href: '/migratie/taken', icon: CheckSquare },
  { name: 'Afspraken', href: '/migratie/afspraken', icon: ScrollText },
  { name: 'Fases', href: '/migratie/fases', icon: ArrowLeftRight },
]

const externalLinks = [
  {
    name: 'Shopify Admin',
    href: 'https://admin.shopify.com/store/xn68xb-0f',
    icon: Globe,
  },
  {
    name: 'Shopify Storefront',
    href: 'https://xn68xb-0f.myshopify.com',
    icon: ExternalLink,
  },
  {
    name: 'WooCommerce (oud)',
    href: 'https://www.bloemenvandegier.nl/wp-admin',
    icon: Package,
  },
  {
    name: 'SEO migratiedoc',
    href: '/shopify-seo.md',
    icon: FileText,
  },
  {
    name: 'Admin dashboard',
    href: '/admin',
    icon: Settings,
  },
]

export default function MigratieSidebar() {
  const pathname = usePathname()
  const [cliStatus, setCliStatus] = useState<ShopifyCliStatus | null>(null)
  const [wcStatus, setWcStatus] = useState<{
    connected: boolean
    message: string
    productTotal: number | null
    lastFetchAt: string | null
  } | null>(null)

  useEffect(() => {
    fetch('/api/migratie/status')
      .then((res) => res.json())
      .then((data) => {
        setCliStatus(data.shopifyCli ?? null)
        setWcStatus(data.woocommerce ?? null)
      })
      .catch(() => {
        setCliStatus(null)
        setWcStatus(null)
      })
  }, [])

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-primary-800 text-white">
      <div className="border-b border-primary-700 p-6">
        <Link href="/migratie" className="mb-4 block no-underline">
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
          <p className="text-sm font-semibold leading-tight text-white">Migratie</p>
          <p className="text-xs text-primary-200">WC → Shopify</p>
        </div>
      </div>

      <nav className="sidebar-scrollbar flex-1 overflow-y-auto p-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-primary-300">
          Dashboard
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
          Status
        </p>
        <div className="mx-1 space-y-2">
          <div className="rounded-lg border border-primary-700 bg-primary-900/40 px-3 py-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 shrink-0 text-primary-300" />
              <span className="text-sm text-primary-100">Shopify CLI</span>
              {cliStatus ? (
                <span
                  className={cn(
                    'ml-auto rounded-full px-2 py-0.5 text-xs font-semibold',
                    cliStatus.connected
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  )}
                >
                  {cliStatus.connected ? 'Ja' : 'Nee'}
                </span>
              ) : (
                <span className="ml-auto text-xs text-primary-400">...</span>
              )}
            </div>
            {cliStatus && (
              <p className="mt-2 text-xs leading-relaxed text-primary-300">{cliStatus.message}</p>
            )}
          </div>

          <div className="rounded-lg border border-primary-700 bg-primary-900/40 px-3 py-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 shrink-0 text-primary-300" />
              <span className="text-sm text-primary-100">WooCommerce API</span>
              {wcStatus ? (
                <span
                  className={cn(
                    'ml-auto rounded-full px-2 py-0.5 text-xs font-semibold',
                    wcStatus.connected
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  )}
                >
                  {wcStatus.connected ? 'Ja' : 'Nee'}
                </span>
              ) : (
                <span className="ml-auto text-xs text-primary-400">...</span>
              )}
            </div>
            {wcStatus && (
              <>
                <p className="mt-2 text-xs leading-relaxed text-primary-300">{wcStatus.message}</p>
                {wcStatus.lastFetchAt && (
                  <p className="mt-1 text-xs text-primary-400">
                    Laatste fetch: {new Date(wcStatus.lastFetchAt).toLocaleString('nl-NL')}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-primary-300">
          Snelkoppelingen
        </p>
        <ul className="space-y-1">
          {externalLinks.map((item) => {
            const Icon = item.icon
            const isExternal = item.href.startsWith('http')
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-primary-100 transition-colors hover:bg-primary-700 hover:text-white"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {isExternal && <ExternalLink className="h-3 w-3 opacity-60" />}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-primary-700 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-200 transition-colors hover:bg-primary-700 hover:text-white"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Terug naar webshop
        </Link>
      </div>
    </aside>
  )
}
