'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X, Search, ShoppingCart, User, Truck, Heart, Scale } from 'lucide-react'
import { NAVIGATION } from '@/lib/utils/constants'
import { useCartStore } from '@/lib/cart/store'
import { useCart } from '@/components/cart/CartProvider'
import { useAuthStore } from '@/lib/auth/store'
import { useWishlistStore } from '@/lib/wishlist/store'
import { useComparisonStore } from '@/lib/comparison/store'
import { useI18n } from '@/lib/i18n/context'
import Button from '@/components/ui/Button'
import MobileMenu from './MobileMenu'
import SearchModal from './SearchModal'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import CategoryDropdown from './CategoryDropdown'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const itemCount = useCartStore((state) => state.getItemCount())
  const wishlistCount = useWishlistStore((state) => state.getItemCount())
  const comparisonCount = useComparisonStore((state) => state.getProductCount())
  const { openCart } = useCart()
  const { isAuthenticated } = useAuthStore()
  const { t } = useI18n()

  const handleDropdownEnter = (itemName: string) => {
    // Clear any pending timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    setActiveDropdown(itemName)
  }

  const handleDropdownLeave = () => {
    // Add a small delay before closing to allow movement to dropdown
    const timeout = setTimeout(() => {
      setActiveDropdown(null)
    }, 150) // 150ms delay
    setHoverTimeout(timeout)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
      }
    }
  }, [hoverTimeout])

  // Map navigation items with translations and submenus
  const navigationItems = [
    { 
      name: t('nav.roses'), 
      href: '/rozen',
      submenu: [
        { name: 'Rode Rozen', href: '/rozen?color=rood', description: 'Klassieke rode rozen voor elke gelegenheid' },
        { name: 'Roze Rozen', href: '/rozen?color=roze', description: 'Zachte roze rozen in verschillende tinten' },
        { name: 'Witte Rozen', href: '/rozen?color=wit', description: 'Elegante witte rozen voor speciale momenten' },
        { name: 'Gele Rozen', href: '/rozen?color=geel', description: 'Vrolijke gele rozen om te verrassen' },
        { name: 'Regenboog Rozen', href: '/rozen?color=regenboog', description: 'Kleurrijke regenboog rozen' },
        { name: 'Rozen Boeketten', href: '/categorie/rozen-boeketten', description: 'Prachtig samengestelde rozen boeketten' },
        { name: 'Alle Rozen', href: '/rozen', description: 'Bekijk ons volledige assortiment rozen' },
      ]
    },
    { name: t('nav.springFlowers'), href: '/categorie/voorjaarsbloemen' },
    { 
      name: t('nav.bouquets'), 
      href: '/boeketten',
      submenu: [
        { name: 'Klassieke Boeketten', href: '/categorie/klassieke-boeketten', description: 'Tijdloze klassieke boeketten' },
        { name: 'Plukboeketten', href: '/categorie/plukboeketten', description: 'Zelf te plukken boeketten' },
        { name: 'Rozen Boeketten', href: '/categorie/rozen-boeketten', description: 'Boeketten met rozen' },
        { name: 'Alle Boeketten', href: '/boeketten', description: 'Bekijk alle boeketten' },
      ]
    },
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
      <header className="sticky top-0 z-[60] bg-primary-500 border-b border-primary-600 shadow-sm">
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
                <CategoryDropdown
                  key={index}
                  item={item}
                  isActive={activeDropdown === item.name}
                  onMouseEnter={() => handleDropdownEnter(item.name)}
                  onMouseLeave={handleDropdownLeave}
                  renderDropdownOutside={true}
                />
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
                href="/wishlist"
                aria-label="Favorieten"
                className="relative p-2 text-white hover:text-primary-100 transition-colors"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-primary-600">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {comparisonCount > 0 && (
                <Link
                  href="#comparison"
                  aria-label="Product vergelijking"
                  className="relative p-2 text-white hover:text-primary-100 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById('comparison')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <Scale className="h-5 w-5" />
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-primary-600">
                    {comparisonCount > 9 ? '9+' : comparisonCount}
                  </span>
                </Link>
              )}
              
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

      {/* Render dropdowns outside header to ensure correct positioning */}
      {navigationItems.slice(0, 4).map((item, index) => (
        item.submenu && activeDropdown === item.name && (
          <CategoryDropdown
            key={`dropdown-${index}`}
            item={item}
            isActive={true}
            onMouseEnter={() => handleDropdownEnter(item.name)}
            onMouseLeave={handleDropdownLeave}
            renderDropdownOnly={true}
          />
        )
      ))}

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
