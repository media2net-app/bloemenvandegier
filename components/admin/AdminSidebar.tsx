'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  BarChart3,
  FileText,
  Image as ImageIcon,
  Tag,
  Truck,
  Mail,
  Bell,
  Repeat,
  Megaphone,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Search,
  TrendingUp,
  Facebook,
  Music,
  Calendar,
  ClipboardList,
  FileEdit
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface MenuItem {
  name: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  children?: MenuItem[]
  isNew?: boolean
}

// Define which pages are implemented
const implementedPages = [
  '/admin',
  '/admin/paginas',
  '/admin/paginas/nieuw',
  '/admin/producten',
  '/admin/bestellingen',
  '/admin/order-picker',
  '/admin/klanten',
  '/admin/abonnementen',
  '/admin/berichten',
  '/admin/categorieen',
  '/admin/afbeeldingen',
  '/admin/verzending',
  '/admin/statistieken',
  '/admin/instellingen',
  '/admin/marketing',
  '/admin/marketing/google-adwords',
  '/admin/marketing/organisch',
  '/admin/marketing/meta',
  '/admin/marketing/tiktok',
  '/admin/marketing/content-kalender',
  '/admin/taken',
  '/admin/notificaties',
  '/admin/rapporten',
  '/admin/activity-log',
]

const menuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Pagina\'s', href: '/admin/paginas', icon: FileEdit },
  { name: 'Producten', href: '/admin/producten', icon: Package },
  { name: 'Bestellingen', href: '/admin/bestellingen', icon: ShoppingCart },
  { name: 'Order Picker', href: '/admin/order-picker', icon: ClipboardList, isNew: true },
  { name: 'Klanten', href: '/admin/klanten', icon: Users },
  { name: 'Abonnementen', href: '/admin/abonnementen', icon: Repeat },
  { name: 'Categorieën', href: '/admin/categorieen', icon: Tag },
  { name: 'Afbeeldingen', href: '/admin/afbeeldingen', icon: ImageIcon },
  { name: 'Verzending', href: '/admin/verzending', icon: Truck },
  { name: 'Statistieken', href: '/admin/statistieken', icon: BarChart3 },
  { 
    name: 'Marketing', 
    href: '/admin/marketing', 
    icon: Megaphone,
    children: [
      { name: 'Overzicht', href: '/admin/marketing', icon: BarChart3 },
      { name: 'Google Adwords', href: '/admin/marketing/google-adwords', icon: Search },
      { name: 'Organisch', href: '/admin/marketing/organisch', icon: TrendingUp },
      { name: 'META', href: '/admin/marketing/meta', icon: Facebook },
      { name: 'TikTok', href: '/admin/marketing/tiktok', icon: Music },
      { name: 'Content Kalender', href: '/admin/marketing/content-kalender', icon: Calendar },
    ]
  },
  { name: 'Taken', href: '/admin/taken', icon: CheckSquare },
  { name: 'Berichten', href: '/admin/berichten', icon: Mail },
  { name: 'Notificaties', href: '/admin/notificaties', icon: Bell },
  { name: 'Rapporten', href: '/admin/rapporten', icon: FileText },
  { name: 'Instellingen', href: '/admin/instellingen', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  useEffect(() => {
    // Auto-expand Marketing menu if on a marketing page
    if (pathname?.startsWith('/admin/marketing')) {
      setExpandedMenus(prev => {
        if (!prev.includes('Marketing')) {
          return [...prev, 'Marketing']
        }
        return prev
      })
    }

    // Calculate unread messages count
    // In a real app, this would be an API call or from a store
    const calculateUnreadCount = () => {
      // Mock tickets data matching the berichten page
      // In a real app, this would come from an API or shared store
      const mockTickets = [
        { unreadCount: 2 }, // TKT-2024-001
        { unreadCount: 0 }, // TKT-2024-002
        { unreadCount: 1 }, // TKT-2024-003
        { unreadCount: 0 }, // TKT-2024-004
        { unreadCount: 0 }, // TKT-2024-005
      ]
      const total = mockTickets.reduce((sum, ticket) => sum + ticket.unreadCount, 0)
      return total
    }

    // Calculate initial count
    setUnreadCount(calculateUnreadCount())

    // In a real app, you would set up a subscription or polling here
    // For now, we'll use a simple interval to simulate updates
    const interval = setInterval(() => {
      setUnreadCount(calculateUnreadCount())
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [pathname])

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary-600 text-white shadow-xl z-40">
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-primary-500">
          <Link href="/" className="block mb-4 no-underline">
            <Image
              src="/images/logo.svg"
              alt="Bloemen van De Gier"
              width={200}
              height={50}
              className="h-10 w-auto brightness-0 invert"
              priority
            />
          </Link>
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          <p className="text-xs text-primary-200 mt-1">Bloemen van De Gier</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 sidebar-scrollbar">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon
              const hasChildren = item.children && item.children.length > 0
              const isMarketingActive = item.name === 'Marketing' && pathname?.startsWith('/admin/marketing')
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && item.href && pathname?.startsWith(item.href)) ||
                isMarketingActive
              const isExpanded = expandedMenus.includes(item.name)
              const isImplemented = item.href ? implementedPages.includes(item.href) : true
              const showUnreadBadge = item.href === '/admin/berichten' && unreadCount > 0
              const showNewBadge = item.isNew
              
              return (
                <li key={item.name}>
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => {
                          setExpandedMenus(prev => {
                            if (isExpanded) {
                              return prev.filter(m => m !== item.name)
                            } else {
                              return [...prev, item.name]
                            }
                          })
                        }}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors no-underline",
                          isMarketingActive
                            ? "bg-primary-500 text-white shadow-md"
                            : "text-primary-100 hover:bg-primary-500/50 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="font-medium">{item.name}</span>
                          {showNewBadge && (
                            <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                              NIEUW
                            </span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                      </button>
                      {isExpanded && item.children && (
                        <ul className="ml-4 mt-1 space-y-1 border-l-2 border-primary-400/30 pl-2">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon
                            const isChildActive = child.href && (pathname === child.href ||
                              (child.href !== '/admin/marketing' && pathname?.startsWith(child.href)))
                            const isChildImplemented = child.href ? implementedPages.includes(child.href) : true
                            
                            return (
                              <li key={child.name}>
                                {isChildImplemented ? (
                                  <Link
                                    href={child.href || '#'}
                                    className={cn(
                                      "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm no-underline",
                                      isChildActive
                                        ? "bg-primary-500 text-white shadow-md"
                                        : "text-primary-100 hover:bg-primary-500/50 hover:text-white"
                                    )}
                                  >
                                    <ChildIcon className="h-4 w-4 flex-shrink-0" />
                                    <span>{child.name}</span>
                                  </Link>
                                ) : (
                                  <div
                                    className={cn(
                                      "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors cursor-not-allowed opacity-40 text-sm",
                                      isChildActive
                                        ? "bg-primary-500/30 text-white/50"
                                        : "text-primary-100/50"
                                    )}
                                    title="Binnenkort beschikbaar"
                                  >
                                    <ChildIcon className="h-4 w-4 flex-shrink-0" />
                                    <span>{child.name}</span>
                                  </div>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <>
                      {isImplemented ? (
                        <Link
                          href={item.href || '#'}
                          className={cn(
                            "flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors no-underline",
                            isActive
                              ? "bg-primary-500 text-white shadow-md"
                              : "text-primary-100 hover:bg-primary-500/50 hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <span className="font-medium">{item.name}</span>
                            {showNewBadge && (
                              <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                                NIEUW
                              </span>
                            )}
                          </div>
                          {showUnreadBadge && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <div
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-not-allowed opacity-40",
                            isActive
                              ? "bg-primary-500/30 text-white/50"
                              : "text-primary-100/50"
                          )}
                          title="Binnenkort beschikbaar"
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      )}
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-primary-500">
          <div className="text-xs text-primary-200 text-center">
            <p>Versie 1.0.0</p>
            <p className="mt-1">© 2026 Bloemen van De Gier</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
