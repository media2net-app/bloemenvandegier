'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, Search, ShoppingCart, User, Truck } from 'lucide-react'
import { NAVIGATION } from '@/lib/utils/constants'
import { useCartStore } from '@/lib/cart/store'
import { useCart } from '@/components/cart/CartProvider'
import { useAuthStore } from '@/lib/auth/store'
import { useI18n } from '@/lib/i18n/context'
import Button from '@/components/ui/Button'
import MobileMenu from './MobileMenu'
import SearchModal from './SearchModal'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const itemCount = useCartStore((state) => state.getItemCount())
  const { openCart } = useCart()
  const { isAuthenticated } = useAuthStore()
  const { t } = useI18n()

  // Map navigation items with translations
  const navigationItems = [
    { name: t('nav.roses'), href: '/rozen' },
    { name: t('nav.springFlowers'), href: '/categorie/voorjaarsbloemen' },
    { name: t('nav.bouquets'), href: '/boeketten' },
    { name: t('nav.greenDecorative'), href: '/groen-decoratief' },
    { name: t('nav.flowersByType'), href: '/categorie/bloemen-per-soort' },
    { name: t('nav.flowerPackages'), href: '/categorie/bloemenpakketten' },
    { name: t('nav.peonies'), href: '/categorie/pioenrozen' },
    { name: t('nav.oliveTrees'), href: '/categorie/olijfbomen' },
    { name: t('nav.weddingBundles'), href: '/categorie/bruiloft-bundels' },
    { name: t('nav.wreathMaking'), href: '/categorie/krans-maken' },
    { name: t('nav.subscriptions'), href: '/abonnementen' },
    { name: t('nav.business'), href: '/zakelijk' },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 bg-primary-500 border-b border-primary-600 shadow-sm">
        <div className="container mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.svg"
                alt="Bloemen van De Gier"
                width={200}
                height={50}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navigationItems.slice(0, 4).map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-white hover:text-primary-100 transition-colors font-medium"
                >
                  {item.name}
                </Link>
              ))}
              {/* Abonnementen en Zakelijk achteraan als buttons */}
              {navigationItems.slice(-2).map((item, index) => (
                <Button
                  key={index}
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white hover:text-primary-500"
                >
                  <Link href={item.href}>{item.name}</Link>
                </Button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Zoeken"
                className="p-2 text-white hover:text-primary-100 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
              
              <Link
                href="/track"
                aria-label={t('header.trackOrder')}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-white hover:text-primary-100 transition-colors text-sm font-medium"
                title={t('header.trackOrder')}
              >
                <Truck className="h-5 w-5" />
                <span className="hidden lg:inline">{t('header.trackOrder')}</span>
              </Link>
              
              <Link
                href={isAuthenticated ? '/account' : '/login'}
                aria-label={t('header.account')}
                className="p-2 text-white hover:text-primary-100 transition-colors"
              >
                <User className="h-5 w-5" />
              </Link>

                    <button
                      onClick={openCart}
                      className="relative p-2 text-white hover:text-primary-100 transition-colors"
                      aria-label={t('header.cart')}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {itemCount > 0 && (
                        <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-primary-600">
                          {itemCount > 9 ? '9+' : itemCount}
                        </span>
                      )}
                    </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-primary-100 transition-colors"
                aria-label={t('header.menu')}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
