import { SHOPIFY_ADMIN_URL, SHOPIFY_STOREFRONT_URL } from '@/lib/migration/sam-onboarding'

export type GoliveOwner = 'sam' | 'chiel' | 'roald' | 'both'

export interface GoliveStep {
  id: string
  title: string
  description: string
  owner: GoliveOwner
  adminPath?: string
  adminUrl?: string
  storefrontUrl?: string
  doneWhen?: string
}

export interface DemoUrl {
  label: string
  url: string
  note?: string
}

export const BLOCK_B_INTRO =
  'Blok B is de livegang met Sam: betalingen, cadeaubonnen, testbestelling en (later) domeinwissel. Technisch is de shop klaar — nu moet de Shopify Admin worden ingericht en getest.'

export const SAM_CALL_AGENDA = [
  { time: '10 min', topic: 'Demo storefront', who: 'chiel' as const },
  { time: '15 min', topic: 'Shopify Payments + iDEAL activeren', who: 'sam' as const },
  { time: '10 min', topic: 'Cadeaubonnen (Gift Cards) inschakelen', who: 'sam' as const },
  { time: '10 min', topic: 'Verzendzones & tarieven nalopen', who: 'sam' as const },
  { time: '15 min', topic: 'Testbestelling plaatsen + pakbon controleren', who: 'both' as const },
  { time: '10 min', topic: 'Pakbon-template plakken in Admin', who: 'sam' as const },
  { time: '10 min', topic: 'Top-collecties handmatig sorteren', who: 'sam' as const },
  { time: '10 min', topic: 'Domeinwissel plannen (niet vandaag doen tenzij alles groen)', who: 'both' as const },
]

export const DEMO_URLS: DemoUrl[] = [
  { label: 'Homepage', url: `${SHOPIFY_STOREFRONT_URL}/`, note: 'USP direct onder hero, weekdeal' },
  { label: 'Rozen collectie', url: `${SHOPIFY_STOREFRONT_URL}/collections/rozen`, note: 'Grijze achtergrond, SEO-tekst' },
  { label: 'Hub Rozen', url: `${SHOPIFY_STOREFRONT_URL}/pages/rozen-bestellen-bij-de-gier`, note: 'Keuzeblokken i.p.v. collectie' },
  { label: 'Product (kaartje + lint)', url: `${SHOPIFY_STOREFRONT_URL}/collections/rozen`, note: 'Kies een rozenboeket' },
  { label: 'Trace-pagina', url: `${SHOPIFY_STOREFRONT_URL}/pages/track` },
  { label: 'Migratie dashboard Sam', url: '/migratie/sam' },
  { label: 'Go-live checklist', url: '/migratie/golive' },
]

export const PAYMENT_SETUP: GoliveStep[] = [
  {
    id: 'shopify-payments',
    title: 'Shopify Payments activeren',
    description:
      'Koppel bankrekening en bedrijfsgegevens. Zonder actieve betalingen werkt checkout niet voor echte klanten.',
    owner: 'sam',
    adminPath: 'Settings → Payments',
    adminUrl: `${SHOPIFY_ADMIN_URL}/settings/payments`,
    doneWhen: 'Shopify Payments status = Active',
  },
  {
    id: 'ideal',
    title: 'iDEAL inschakelen',
    description: 'Onder Shopify Payments → Payment methods → iDEAL aanzetten. Dit is de belangrijkste betaalmethode in NL.',
    owner: 'sam',
    adminUrl: `${SHOPIFY_ADMIN_URL}/settings/payments`,
    doneWhen: 'iDEAL zichtbaar bij checkout',
  },
  {
    id: 'paypal-optional',
    title: 'PayPal / creditcard (optioneel)',
    description: 'Creditcard zit vaak al in Shopify Payments. PayPal apart activeren als gewenst.',
    owner: 'sam',
    adminUrl: `${SHOPIFY_ADMIN_URL}/settings/payments`,
  },
  {
    id: 'test-mode-off',
    title: 'Testmodus uit (bij livegang)',
    description: 'Bogus Gateway of testmodus uitzetten zodra echte betalingen live gaan.',
    owner: 'sam',
    adminUrl: `${SHOPIFY_ADMIN_URL}/settings/payments`,
  },
]

export const GIFT_CARD_SETUP: GoliveStep[] = [
  {
    id: 'gift-cards-enable',
    title: 'Gift Cards activeren',
    description: 'Settings → Gift cards → Enable. Daarna kun je bonnen aanmaken en versturen.',
    owner: 'sam',
    adminPath: 'Settings → Gift cards',
    adminUrl: `${SHOPIFY_ADMIN_URL}/settings/gift_cards`,
    doneWhen: 'Gift cards enabled in shop settings',
  },
  {
    id: 'gift-card-product',
    title: 'Cadeaubon-product aanmaken (optioneel)',
    description:
      'Products → Add product → Gift card product, of handmatig bonnen uitgeven via Customers → Issue gift card.',
    owner: 'sam',
    adminUrl: `${SHOPIFY_ADMIN_URL}/gift_cards`,
  },
]

export const SHIPPING_SETUP: GoliveStep[] = [
  {
    id: 'shipping-zones',
    title: 'Bezorgzones Nederland',
    description: 'Settings → Shipping and delivery → General shipping rates. Minimaal NL-zone met koerier/post tarieven.',
    owner: 'sam',
    adminUrl: `${SHOPIFY_ADMIN_URL}/settings/shipping`,
    doneWhen: 'Minstens 1 zone met Nederland (NL)',
  },
  {
    id: 'free-shipping',
    title: 'Gratis bezorging vanaf €50',
    description: 'Zelfde tarief als WooCommerce: gratis verzending boven drempelbedrag instellen.',
    owner: 'sam',
    adminUrl: `${SHOPIFY_ADMIN_URL}/settings/shipping`,
  },
  {
    id: 'packing-slip',
    title: 'Pakbon-template plakken',
    description:
      'Kopieer data/shopify/packing-slip-template.liquid naar Settings → Shipping → Packing slip template. Kaartje en lint staan in orderregels.',
    owner: 'sam',
    adminUrl: `${SHOPIFY_ADMIN_URL}/settings/shipping/packing_slip`,
    doneWhen: 'Template geplakt en test-print OK',
  },
]

export const CARD_PRINT_SETUP: GoliveStep[] = [
  {
    id: 'card-print-format',
    title: 'Formaat kaartje (zoals WooCommerce)',
    description:
      'Liggend 3:2 — zelfde als de kaartpreview op de productpagina. Print: A6 landscape (148 × 105 mm). Max 150 tekens, gecentreerd, serif-lettertype.',
    owner: 'sam',
  },
  {
    id: 'card-print-optie-b',
    title: 'Order Printer Pro — template "Kaartje" aanmaken',
    description:
      'Manage Templates → Create Template → naam: Kaartje. Paper size: A6 Landscape. Plak volledige code uit data/shopify/order-printer-pro-kaartje-template.liquid. Save.',
    owner: 'sam',
    adminUrl: `${SHOPIFY_ADMIN_URL}/apps`,
    doneWhen: 'Template Kaartje in lijst + proefprint #1001 OK',
  },
  {
    id: 'kaartje-test-print',
    title: 'Proefprint met order #1001',
    description:
      'Tekst moet zijn: "Testbestelling migratie 🌷", lint Roze, order #1001.',
    owner: 'sam',
    adminUrl: `${SHOPIFY_ADMIN_URL}/orders/12938193764683`,
    doneWhen: 'A6-kaartje print correct',
  },
  {
    id: 'kaartje-daily',
    title: 'Dagelijks gebruik',
    description:
      'Optie A: Print packing slip → gebruik kaartje-pagina. Optie B: Print → Kaartje in Order Printer Pro.',
    owner: 'sam',
    adminUrl: `${SHOPIFY_ADMIN_URL}/orders`,
  },
]

export const TEST_ORDER_CHECKLIST: GoliveStep[] = [
  {
    id: 'test-add-cart',
    title: 'Product in winkelwagen met kaartje + lint',
    description:
      'Kies een boeket → vul kaartje in → kies lintkleur en -tekst → toevoegen aan winkelwagen. Controleer cart line item properties.',
    owner: 'both',
    storefrontUrl: `${SHOPIFY_STOREFRONT_URL}/collections/boeket-bloemen`,
  },
  {
    id: 'test-checkout',
    title: 'Checkout doorlopen',
    description: 'Adres NL invullen, verzendmethode kiezen, betaling afronden (test of echte betaling).',
    owner: 'both',
    storefrontUrl: `${SHOPIFY_STOREFRONT_URL}/cart`,
  },
  {
    id: 'test-order-admin',
    title: 'Order in Admin controleren',
    description:
      'Orders → open order. Kaartje, Lint kleur en Lint tekst moeten zichtbaar zijn bij line items.',
    owner: 'both',
    adminUrl: `${SHOPIFY_ADMIN_URL}/orders`,
  },
  {
    id: 'test-packing-slip',
    title: 'Pakbon printen',
    description: 'Order → More actions → Print packing slip. Layout en properties controleren.',
    owner: 'sam',
    adminUrl: `${SHOPIFY_ADMIN_URL}/orders`,
  },
  {
    id: 'test-kaartje-print',
    title: 'Kaartje printen',
    description: 'Via packing slip (laatste pagina) of Order Printer Pro template Kaartje. Los A6-veld met kaartjetekst.',
    owner: 'sam',
    adminUrl: `${SHOPIFY_ADMIN_URL}/orders/12938193764683`,
  },
  {
    id: 'test-email',
    title: 'Bevestigingsmail',
    description: 'Order confirmation e-mail ontvangen en controleren (afzender, bedrijfsnaam, link).',
    owner: 'sam',
    adminPath: 'Settings → Notifications',
    adminUrl: `${SHOPIFY_ADMIN_URL}/settings/notifications`,
  },
  {
    id: 'test-fulfill',
    title: 'Fulfillment + tracking (optioneel)',
    description: 'Markeer als fulfilled, voeg tracking toe. Trace-link op /pages/track testen.',
    owner: 'sam',
    storefrontUrl: `${SHOPIFY_STOREFRONT_URL}/pages/track`,
  },
]

export const DOMAIN_SWITCH: GoliveStep[] = [
  {
    id: 'domain-connect',
    title: 'Domein koppelen in Shopify',
    description: 'Settings → Domains → Connect existing domain → bloemenvandegier.nl',
    owner: 'sam',
    adminUrl: `${SHOPIFY_ADMIN_URL}/settings/domains`,
  },
  {
    id: 'dns-records',
    title: 'DNS-records aanpassen',
    description:
      'Bij domain provider: A-record naar Shopify IP, CNAME www naar shops.myshopify.com. Shopify toont exacte waarden.',
    owner: 'sam',
    doneWhen: 'SSL actief + primary domain = bloemenvandegier.nl',
  },
  {
    id: 'domain-primary',
    title: 'Primair domein instellen',
    description: 'Maak bloemenvandegier.nl het primary domain. myshopify.com blijft redirecten.',
    owner: 'sam',
    adminUrl: `${SHOPIFY_ADMIN_URL}/settings/domains`,
  },
  {
    id: 'domain-wc-off',
    title: 'WooCommerce offline',
    description: 'Pas na succesvolle DNS-propagation: WC op onderhoud, redirects valideren, hosting opzeggen plannen.',
    owner: 'both',
    doneWhen: 'Steekproef redirects 30/30 OK op nieuw domein',
  },
]

export const POST_GOLIVE: GoliveStep[] = [
  {
    id: 'search-console',
    title: 'Google Search Console sitemap',
    description: 'Nieuwe sitemap indienen: https://bloemenvandegier.nl/sitemap.xml. Crawl errors 4–6 weken monitoren.',
    owner: 'roald',
  },
  {
    id: 'social-channels',
    title: 'Facebook / Instagram / Google kanalen',
    description: 'Sales channels in Admin koppelen voor catalogus-sync (geen advertentiebudget vandaag nodig).',
    owner: 'sam',
    adminUrl: `${SHOPIFY_ADMIN_URL}/settings/channels`,
  },
  {
    id: 'collection-sort',
    title: 'Handmatige productvolgorde top-collecties',
    description: 'Products → Collections → rozen, boeketten, weekdeals → Sort: Manual.',
    owner: 'sam',
    adminUrl: `${SHOPIFY_ADMIN_URL}/collections`,
  },
]

export const OWNER_LABELS: Record<GoliveOwner, string> = {
  sam: 'Sam',
  chiel: 'Chiel',
  roald: 'Roald',
  both: 'Sam + Chiel',
}
