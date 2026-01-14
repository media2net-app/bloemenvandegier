import Link from 'next/link'
import Image from 'next/image'
import { NAVIGATION, SITE_NAME } from '@/lib/utils/constants'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    service: [
      { name: 'Veelgestelde vragen', href: '/veelgestelde-vragen' },
      { name: 'Zakelijk bloemen bestellen', href: '/zakelijk' },
      { name: 'Verzendkosten & Levertijden', href: '/verzendkosten' },
      { name: 'Retour beleid', href: '/retour' },
      { name: 'Algemene voorwaarden', href: '/algemene-voorwaarden' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy verklaring', href: '/privacy' },
      { name: 'Klachtenregeling', href: '/klachtenregeling' },
    ],
    categories: NAVIGATION,
    occasions: [
      { name: 'Pasen', href: '/categorie/pasen' },
      { name: 'Koningsdag', href: '/categorie/koningsdag' },
      { name: 'Moederdag', href: '/categorie/moederdag' },
      { name: 'Vaderdag', href: '/categorie/vaderdag' },
      { name: 'Sinterklaas', href: '/categorie/sinterklaas' },
      { name: 'Kerst', href: '/categorie/kerst' },
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
            <h3 className="text-white text-lg font-bold mb-4">{SITE_NAME}</h3>
            <p className="text-sm mb-4 text-white/90">
              Industrieweg 8<br />
              7921 JP Zuidwolde
            </p>
            <p className="text-sm text-white/80">
              Prachtige bloemen van topkwaliteit. Gegarandeerd meer bloemen voor je geld.
            </p>
          </div>

          {/* Service & Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Service & Contact</h4>
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
            <h4 className="text-white font-semibold mb-4">Categorieën</h4>
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
            <h4 className="text-white font-semibold mb-4">Seizoenen & Feestdagen</h4>
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
          <p>&copy; {currentYear} {SITE_NAME}. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  )
}
