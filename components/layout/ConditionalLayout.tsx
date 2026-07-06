'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import TrustBar from '@/components/layout/TrustBar'
import HelpWidget from '@/components/shared/HelpWidget'
import LanguageWrapper from '@/components/layout/LanguageWrapper'
import ExitIntentDiscount from '@/components/shared/ExitIntentDiscount'

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Hide header and footer on admin login page
  const isAdminLogin = pathname?.startsWith('/admin/login')
  const isCustomerLogin = pathname === '/login'
  const isAdminDashboard = pathname?.startsWith('/admin') && !isAdminLogin
  const isMigratie = pathname?.startsWith('/migratie')
  const isMiddelbareScholenLogin = pathname?.startsWith('/middelbare-scholen/login')
  const isMiddelbareScholenValentijn = pathname?.startsWith('/middelbare-scholen/valentijn')

  if (isAdminLogin || isCustomerLogin || isMiddelbareScholenLogin || isMiddelbareScholenValentijn) {
    // Admin login page, middelbare scholen login, or middelbare scholen valentijn - no header, footer, trustbar, or help widget
    // Return children directly without wrapper to avoid CSS conflicts
    return <>{children}</>
  }

  if (isAdminDashboard || isMigratie) {
    // Admin dashboard / migratie - no trustbar, footer, or help widget
    return <>{children}</>
  }

  // Regular pages - show everything
  return (
    <>
      <LanguageWrapper />
      <TrustBar />
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <HelpWidget />
      <ExitIntentDiscount />
    </>
  )
}
