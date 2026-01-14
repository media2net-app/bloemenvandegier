'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import TrustBar from '@/components/layout/TrustBar'
import HelpWidget from '@/components/shared/HelpWidget'

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Hide header and footer on admin login page
  const isAdminLogin = pathname?.startsWith('/admin/login')
  const isAdminDashboard = pathname?.startsWith('/admin') && !isAdminLogin

  if (isAdminLogin) {
    // Admin login page - no header, footer, trustbar, or help widget
    return <>{children}</>
  }

  if (isAdminDashboard) {
    // Admin dashboard - no trustbar, footer, or help widget (but has its own header)
    return <>{children}</>
  }

  // Regular pages - show everything
  return (
    <>
      <TrustBar />
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <HelpWidget />
    </>
  )
}
