export const SITE_NAME = 'Bloemen van De Gier'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const NAVIGATION = [
  { name: 'Valentijnsdag', href: '/categorie/valentijnsdag' },
  { name: 'Rozen', href: '/rozen' },
  { name: 'Voorjaarsbloemen', href: '/categorie/voorjaarsbloemen' },
  { name: 'Boeketten', href: '/boeketten' },
  { name: 'Groen & Decoratief', href: '/groen-decoratief' },
  { name: 'Bloemen per soort', href: '/categorie/bloemen-per-soort' },
  { name: 'Bloemenpakketten', href: '/categorie/bloemenpakketten' },
  { name: 'Pioenrozen', href: '/categorie/pioenrozen' },
  { name: 'Olijfbomen', href: '/categorie/olijfbomen' },
  { name: 'Bruiloft Bundels', href: '/categorie/bruiloft-bundels' },
  { name: 'Krans maken', href: '/categorie/krans-maken' },
  { name: 'Abonnementen', href: '/abonnementen' },
  { name: 'Zakelijk', href: '/zakelijk' },
]

export const DELIVERY_INFO = {
  guarantee: '7 dagen versgarantie',
  areas: ['Nederland', 'België'],
}
