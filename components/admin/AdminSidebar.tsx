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
  CheckSquare
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

// Define which pages are implemented
const implementedPages = [
  '/admin',
  '/admin/producten',
  '/admin/bestellingen',
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
]

const menuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Producten', href: '/admin/producten', icon: Package },
  { name: 'Bestellingen', href: '/admin/bestellingen', icon: ShoppingCart },
  { name: 'Klanten', href: '/admin/klanten', icon: Users },
  { name: 'Abonnementen', href: '/admin/abonnementen', icon: Repeat },
  { name: 'Categorieën', href: '/admin/categorieen', icon: Tag },
  { name: 'Afbeeldingen', href: '/admin/afbeeldingen', icon: ImageIcon },
  { name: 'Verzending', href: '/admin/verzending', icon: Truck },
  { name: 'Statistieken', href: '/admin/statistieken', icon: BarChart3 },
  { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
  { name: 'Taken', href: '/admin/taken', icon: CheckSquare },
  { name: 'Berichten', href: '/admin/berichten', icon: Mail },
  { name: 'Notificaties', href: '/admin/notificaties', icon: Bell },
  { name: 'Rapporten', href: '/admin/rapporten', icon: FileText },
  { name: 'Instellingen', href: '/admin/instellingen', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
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
  }, [])

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary-600 text-white shadow-xl z-40">
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-primary-500">
          <Link href="/" className="block mb-4">
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
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname?.startsWith(item.href))
              const isImplemented = implementedPages.includes(item.href)
              const showUnreadBadge = item.href === '/admin/berichten' && unreadCount > 0
              
              return (
                <li key={item.name}>
                  {isImplemented ? (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors",
                        isActive
                          ? "bg-primary-500 text-white shadow-md"
                          : "text-primary-100 hover:bg-primary-500/50 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium">{item.name}</span>
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
