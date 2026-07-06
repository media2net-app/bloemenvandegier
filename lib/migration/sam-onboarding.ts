export type WishStatus = 'ready' | 'partial' | 'app' | 'custom' | 'done'

export interface ShopifyAppRecommendation {
  name: string
  url: string
  pricing: string
  pricingNote?: string
  recommended?: boolean
}

export interface DailyWorkflowStep {
  title: string
  path: string
  description: string
}

export interface SamWish {
  id: string
  text: string
  status: WishStatus
  how: string
  owner?: 'sam' | 'chiel'
  apps?: ShopifyAppRecommendation[]
}

export const SHOPIFY_ADMIN_URL = 'https://admin.shopify.com/store/xn68xb-0f'
export const SHOPIFY_STOREFRONT_URL = 'https://xn68xb-0f.myshopify.com'

export const WISH_STATUS_LABELS: Record<WishStatus, string> = {
  ready: 'Klaar in Shopify Admin',
  partial: 'Deels klaar',
  app: 'Shopify-app nodig',
  custom: 'Maatwerk nodig',
  done: 'Afgerond',
}

export const WISH_STATUS_COLORS: Record<WishStatus, string> = {
  ready: 'bg-green-50 text-green-700 ring-green-200',
  partial: 'bg-amber-50 text-amber-700 ring-amber-200',
  app: 'bg-blue-50 text-blue-700 ring-blue-200',
  custom: 'bg-purple-50 text-purple-700 ring-purple-200',
  done: 'bg-green-50 text-green-800 ring-green-300',
}

export const DAILY_WORKFLOW: DailyWorkflowStep[] = [
  {
    title: 'Nieuwe bestellingen bekijken',
    path: 'Orders',
    description: 'Orders → filter op “Unfulfilled”. Open een order voor klantgegevens, kaartje, lint en bezorgdatum.',
  },
  {
    title: 'Bestelling picken & verzenden',
    path: 'Orders → Fulfill',
    description: 'Markeer items als gepickt, voeg tracking toe en markeer als fulfilled. Pakbon print je vanuit de order.',
  },
  {
    title: 'Pakbon printen',
    path: 'Orders → Print',
    description: 'Bij een order: More actions → Print packing slip. Kaartje- en linttekst staan op de pakbon én als los kaartje (A6).',
  },
  {
    title: 'Kaartje printen',
    path: 'Orders → Print packing slip',
    description: 'Kaartje op aparte A6-pagina in packing slip template (geen app nodig). Of Order Printer Pro voor alleen kaartje.',
  },
  {
    title: 'Producten & voorraad',
    path: 'Products',
    description: 'Producten bewerken, prijzen aanpassen, voorraad bijwerken per variant.',
  },
  {
    title: 'Volgorde in categorieën',
    path: 'Products → Collections',
    description: 'Open een collectie → Sort: Manual → sleep producten in de gewenste volgorde.',
  },
  {
    title: 'Klanten',
    path: 'Customers',
    description: 'Klantgegevens, bestelgeschiedenis en notities. Zakelijke klanten nog via aparte flow (in ontwikkeling).',
  },
  {
    title: 'Cadeaubonnen',
    path: 'Products → Gift cards',
    description: 'Cadeaubonnen aanmaken en versturen zodra de functie is geactiveerd.',
  },
]

export const SAM_WISHES: SamWish[] = [
  {
    id: 'sam-1',
    text: 'Directe koppeling met koeriers (geen PakketPartner)',
    status: 'custom',
    how: 'Shipping-app of maatwerk-koppeling. PakketPartner vervalt na livegang.',
    owner: 'chiel',
  },
  {
    id: 'sam-2',
    text: 'Kaartjes, pakbon en labels uit één systeem',
    status: 'partial',
    how: 'Kaartje + lint worden in de webshop vastgelegd en zijn zichtbaar in Orders. Pakbon-template wordt aangepast. Lint-print via EasyRibbon is apart.',
    owner: 'chiel',
  },
  {
    id: 'sam-3',
    text: 'Snelle trace-link op de site',
    status: 'partial',
    how: 'Tracking-URL in order + tracepagina op de storefront (in ontwikkeling).',
    owner: 'chiel',
  },
  {
    id: 'sam-4',
    text: 'Klanteninlog met bestelgeschiedenis en bezorgdatum wijzigen',
    status: 'partial',
    how: 'Shopify Customer Accounts voor inlog en historie. Zelf bezorgdatum wijzigen = maatwerk.',
    owner: 'chiel',
  },
  {
    id: 'sam-5',
    text: 'Zakelijke klanteninlog met korting en factuur',
    status: 'app',
    how: 'Shopify B2B (ingebouwd) voor bedrijfsaccounts, staffelkortingen en betaling op factuur. Extra app alleen nodig bij complexere wholesale-flows.',
    owner: 'chiel',
    apps: [
      {
        name: 'Shopify B2B (ingebouwd)',
        url: 'https://help.shopify.com/nl/manual/b2b',
        pricing: 'Gratis',
        pricingNote: 'Inbegrepen in elk betaald Shopify-abonnement (sinds april 2026). Tot 3 B2B-catalogi, betalingstermijnen (net 30/60), staffelprijzen.',
        recommended: true,
      },
      {
        name: 'BSS B2B & Wholesale Solution',
        url: 'https://apps.shopify.com/b2b-solution-custom-pricing',
        pricing: 'Gratis (dev) · $29/maand · $49/maand · $99/maand',
        pricingNote: 'Als ingebouwde B2B niet volstaat: klantspecifieke prijzen, net terms, wholesale-formulier. 14 dagen proef.',
      },
      {
        name: 'Wholesale Gorilla',
        url: 'https://apps.shopify.com/wholesale-gorilla',
        pricing: 'Vanaf ~$39/maand',
        pricingNote: 'Eenvoudige wholesale-kortingen en quick-order voor zakelijke klanten.',
      },
    ],
  },
  {
    id: 'sam-6',
    text: 'Abonnementen',
    status: 'app',
    how: 'Start met gratis Shopify Subscriptions. Bij groei of bloemenabonnementen met meer opties: Appstle of Recharge.',
    owner: 'chiel',
    apps: [
      {
        name: 'Shopify Subscriptions',
        url: 'https://apps.shopify.com/shopify-subscriptions',
        pricing: 'Gratis',
        pricingNote: 'Officieel van Shopify. Wekelijks/maandelijks/jaarlijks, pauzeren, overslaan. Geen transactiekosten bovenop Shopify Payments.',
        recommended: true,
      },
      {
        name: 'Appstle Subscriptions',
        url: 'https://apps.shopify.com/subscriptions-by-appstle',
        pricing: 'Gratis tot $500/maand omzet · $10/maand · $30/maand · $100/maand',
        pricingNote: '0% transactiekosten. Gratis plan tot €500 abonnementsomzet/maand. 14 dagen proef op betaalde plannen.',
      },
      {
        name: 'Recharge Subscriptions',
        url: 'https://apps.shopify.com/subscription-payments',
        pricing: '$25/maand (≤50 abonnees) · $99/maand + 1,49% + $0,19/tx',
        pricingNote: 'Marktleider. 60 dagen proef. Na 50 abonnees automatisch naar $99-plan. Plus-plan $499/maand bij grote volumes.',
      },
    ],
  },
  {
    id: 'sam-7',
    text: "Productlabels ('nieuw', 'valentijnstip')",
    status: 'ready',
    how: 'Tags of metafields op product → zichtbaar op productkaarten in de shop.',
    owner: 'chiel',
  },
  {
    id: 'sam-8',
    text: 'Lint toevoegen (EasyRibbon)',
    status: 'partial',
    how: 'Lint-kleur en -tekst in webshop UI. Print naar EasyRibbon v4.14 nog te koppelen.',
    owner: 'chiel',
  },
  {
    id: 'sam-9',
    text: 'Limiet bezorgdatum per product',
    status: 'custom',
    how: 'Checkout-extensie of app per product max. X dagen vooruit.',
    owner: 'chiel',
  },
  {
    id: 'sam-10',
    text: 'Rozen voorraad per steel',
    status: 'custom',
    how: 'Unieke WC-dashboard-logica. Shopify standaard telt per variant, niet per steel.',
    owner: 'chiel',
  },
  {
    id: 'sam-11',
    text: 'Voorraadbeheer op afleverdatum',
    status: 'custom',
    how: 'Rapportage op leverdatum (bijv. verkocht 2–6 april) vereist maatwerk.',
    owner: 'chiel',
  },
  {
    id: 'sam-12',
    text: 'Countdown product van de week',
    status: 'done',
    how: 'Deal-sectie live op homepage.',
    owner: 'chiel',
  },
  {
    id: 'sam-13',
    text: 'Adreschecker in checkout',
    status: 'app',
    how: 'Adresvalidatie bij checkout voorkomt foutieve postcodes en ontbrekende huisnummers — belangrijk voor koerierbezorging.',
    owner: 'chiel',
    apps: [
      {
        name: 'Address Ninja',
        url: 'https://apps.shopify.com/address-ninja',
        pricing: '$4,99/maand · $9,99/maand · $14,99/maand',
        pricingNote: 'Huisnummer-, postcode- en PO Box-check. Werkt op alle Shopify-plannen (niet alleen Plus). 14 dagen proef.',
        recommended: true,
      },
      {
        name: 'InStijl Postcode Check',
        url: 'https://apps.shopify.com/postcode-check',
        pricing: '$15/maand',
        pricingNote: 'Nederlandse postcode + huisnummer via Postcode.nl API. Mogelijk apart Postcode.nl-abonnement (~€0,05/check). 14 dagen proef.',
      },
      {
        name: 'Clearer.io Address Validator',
        url: 'https://apps.shopify.com/address-validator',
        pricing: 'Gratis (100 orders) · daarna $0,06/order',
        pricingNote: 'Pay-per-use. Goedkoop bij lager volume, duurder bij veel orders.',
      },
    ],
  },
  {
    id: 'sam-14',
    text: 'Productvolgorde in categorieën',
    status: 'ready',
    how: 'Collectie openen → handmatig sorteren in Shopify Admin.',
    owner: 'sam',
  },
  {
    id: 'sam-15',
    text: 'Pakbon duidelijker inrichten',
    status: 'partial',
    how: 'Packing slip template aanpassen zodat kaartje, lint en extras overzichtelijk staan.',
    owner: 'chiel',
  },
  {
    id: 'sam-16',
    text: 'Werkende cadeaubonnen',
    status: 'partial',
    how: 'Gift Cards zijn ingeschakeld in Shopify. Vandaag: eerste bon aanmaken en testen bij checkout.',
    owner: 'sam',
  },
  {
    id: 'sam-17',
    text: 'Emojis op kaartjes',
    status: 'partial',
    how: 'Kaartje-veld in webshop; emoji-ondersteuning wordt getest.',
    owner: 'chiel',
  },
  {
    id: 'sam-18',
    text: 'Koppeling social media kanalen',
    status: 'app',
    how: 'Facebook, Instagram en Google zijn gratis ingebouwd in Shopify Admin. Geen aparte app nodig voor basis-koppeling.',
    owner: 'chiel',
    apps: [
      {
        name: 'Facebook & Instagram (Meta)',
        url: 'https://apps.shopify.com/facebook',
        pricing: 'Gratis',
        pricingNote: 'Ingebouwd kanaal in Shopify Admin → Sales channels. Productcatalogus sync, pixel, Instagram shop. Advertentiebudget apart.',
        recommended: true,
      },
      {
        name: 'Google & YouTube',
        url: 'https://apps.shopify.com/google',
        pricing: 'Gratis',
        pricingNote: 'Google Merchant Center, Shopping-ads en YouTube-koppeling. Advertentiebudget apart.',
      },
      {
        name: 'Shopify Collabs',
        url: 'https://apps.shopify.com/collabs',
        pricing: 'Gratis',
        pricingNote: 'Influencer- en creator-samenwerkingen. Geen maandelijkse kosten.',
      },
    ],
  },
  {
    id: 'sam-19',
    text: "USP-slider bovenin de site",
    status: 'partial',
    how: 'USP-balk staat in header; definitieve positie wordt afgestemd.',
    owner: 'chiel',
  },
]

export const ARCHITECTURE_POINTS = [
  {
    role: 'Klanten',
    system: 'Shopify webshop (bloemenvandegier.nl)',
    note: 'De nieuwe frontend — producten bestellen, kaartje en lint kiezen.',
  },
  {
    role: 'Sam (dagelijks)',
    system: 'Shopify Admin',
    note: 'Bestellingen, producten, voorraad, pakbonnen, klanten. Dit is je werkplek.',
  },
  {
    role: 'Chiel (technisch)',
    system: 'Theme + scripts',
    note: 'Shopify CLI voor de webshop, API-scripts voor import en onderhoud.',
  },
]

export const NOT_FOR_SAM = [
  'De Next.js webshop op localhost:3000 — dat was een prototype, niet de live shop.',
  'Het /admin dashboard op localhost — prototypes voor order picker en abonnementen, niet voor dagelijks gebruik.',
  'Shopify CLI — alleen voor Chiel bij theme-onderhoud.',
]

export const APP_PRICING_DISCLAIMER =
  'Prijzen uit de Shopify App Store (juli 2026), gefactureerd in USD. Wisselkoers en Shopify-abonnementskosten komen daar nog bij.'
