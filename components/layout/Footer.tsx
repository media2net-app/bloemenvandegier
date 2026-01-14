'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SITE_NAME } from '@/lib/utils/constants'
import { useI18n } from '@/lib/i18n/context'

export default function Footer() {
  const { t } = useI18n()
  const currentYear = new Date().getFullYear()

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

  const footerLinks = {
    service: [
      { name: t('footer.faq'), href: '/veelgestelde-vragen' },
      { name: t('footer.businessOrder'), href: '/zakelijk' },
      { name: t('footer.shippingCosts'), href: '/verzendkosten' },
      { name: t('footer.returnPolicy'), href: '/retour' },
      { name: t('footer.terms'), href: '/algemene-voorwaarden' },
      { name: t('footer.contact'), href: '/contact' },
      { name: t('footer.privacy'), href: '/privacy' },
      { name: t('footer.complaints'), href: '/klachtenregeling' },
    ],
    categories: navigationItems,
    occasions: [
      { name: t('footer.easter'), href: '/categorie/pasen' },
      { name: t('footer.kingsDay'), href: '/categorie/koningsdag' },
      { name: t('footer.mothersDay'), href: '/categorie/moederdag' },
      { name: t('footer.fathersDay'), href: '/categorie/vaderdag' },
      { name: t('footer.sinterklaas'), href: '/categorie/sinterklaas' },
      { name: t('footer.christmas'), href: '/categorie/kerst' },
    ],
  }

  return (
    <footer className="bg-primary-500 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
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
            <h3 className="text-white text-lg font-bold mb-4">{t('footer.companyName')}</h3>
            <p className="text-sm mb-4 text-white/90">
              {t('footer.address')}
            </p>
            <p className="text-sm text-white/80">
              {t('footer.description')}
            </p>
          </div>

          {/* Service & Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.serviceContact')}</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.service.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorieën */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.categories')}</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.categories.slice(0, 6).map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Gelegenheden */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.seasonsHolidays')}</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.occasions.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-400/50 mt-8 pt-8 text-center text-sm text-white/80">
          <p>&copy; {currentYear} {t('footer.companyName')}. {t('footer.allRightsReserved')}.</p>
        </div>
      </div>
    </footer>
  )
}
