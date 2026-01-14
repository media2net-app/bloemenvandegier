import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import TrustBar from '@/components/layout/TrustBar'
import HelpWidget from '@/components/shared/HelpWidget'
import { CartProvider } from '@/components/cart/CartProvider'
import { I18nProvider } from '@/lib/i18n/context'
import ConditionalLayout from '@/components/layout/ConditionalLayout'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Bloemen van De Gier - Verse Bloemen Online',
    template: '%s | Bloemen van De Gier',
  },
  description: 'Prachtige bloemen van topkwaliteit. Gegarandeerd meer bloemen voor je geld. 7 dagen versgarantie.',
  keywords: ['bloemen', 'rozen', 'boeketten', 'online bloemen bestellen', 'bloemen bezorgen'],
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://www.bloemenvandegier.nl',
    siteName: 'Bloemen van De Gier',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased font-sans">
        <I18nProvider>
          <CartProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
