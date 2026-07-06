export interface AgreementItem {
  id: string
  text: string
  scope?: 'migratie' | 'extra' | 'post-oplevering' | 'info'
  note?: string
  taskId?: string
  taskStatus?: 'todo' | 'in_progress' | 'done'
}

export interface AgreementSection {
  id: string
  title: string
  author: 'chiel' | 'sam' | 'roald'
  date?: string
  intro?: string
  items: AgreementItem[]
}

export const MIGRATION_AGREEMENTS: AgreementSection[] = [
  {
    id: 'chiel-kader',
    title: 'Kaderafspraken migratie',
    author: 'chiel',
    intro:
      'Samenvatting na het gesprek met Rolf/Sam — heldere verwachtingen en scope voor de WooCommerce → Shopify migratie.',
    items: [
      {
        id: 'chiel-1',
        text: 'WooCommerce wordt 1:1 omgezet naar Shopify (originele plan).',
        scope: 'migratie',
        taskId: 'migratie-1to1',
      },
      {
        id: 'chiel-2',
        text: 'Extra functies waar mogelijk: lint toevoegen en custom dashboard voor orders picken. Overige wensen graag per e-mail, zodat scope helder blijft en er een eindproduct is.',
        scope: 'extra',
        taskId: 'order-picker-dashboard',
        note: 'Lint UI in Shopify theme (bezig). Order picker prototype op /admin/order-picker.',
      },
      {
        id: 'chiel-3',
        text: 'Samenwerking stopt na oplevering van de Shopify shop. Geen uitvoerende development daarna; Chiel blijft wel bereikbaar voor vragen.',
        scope: 'post-oplevering',
      },
      {
        id: 'chiel-4',
        text: 'Komende maand: shop volledig bouwen, alle data overzetten en een complete Shopify storefront opleveren.',
        scope: 'migratie',
        taskId: 'shop-oplevering',
      },
      {
        id: 'chiel-5',
        text: 'Nieuwe wensen of uitbreidingen na oplevering vallen buiten deze opdracht — eerst afspreken per mail voordat er gebouwd wordt.',
        scope: 'post-oplevering',
      },
    ],
  },
  {
    id: 'sam-wensen',
    title: 'Wensen nieuwe shop',
    author: 'sam',
    intro: 'Genoteerde punten voor de nieuwe shop. Niet alles valt binnen de 1:1 migratie; per punt scope bepalen.',
    items: [
      {
        id: 'sam-1',
        text: 'Directe koppeling met koeriers (geen PakketPartner meer).',
        scope: 'extra',
        taskId: 'sam-1-courier',
        taskStatus: 'todo',
      },
      {
        id: 'sam-2',
        text: 'Kaartjes, pakbon en labels uit één systeem.',
        scope: 'extra',
        taskId: 'sam-2-fulfillment-system',
        taskStatus: 'in_progress',
        note: 'Kaartje + lint in Shopify theme; order-picker apart in Next.js.',
      },
      {
        id: 'sam-3',
        text: 'Snelle trace-link op de site met koppeling naar koerier.',
        scope: 'extra',
        taskId: 'sam-3-trace-link',
        taskStatus: 'todo',
      },
      {
        id: 'sam-4',
        text: 'Klanteninlog met duidelijke bestelgeschiedenis en zelf bezorgdatum kunnen aanpassen.',
        scope: 'extra',
        taskId: 'sam-4-customer-account',
        taskStatus: 'todo',
      },
      {
        id: 'sam-5',
        text: 'Zakelijke klanteninlog met afgesproken kortingsbedragen en achteraf betalen op factuur.',
        scope: 'extra',
        taskId: 'sam-5-business-account',
        taskStatus: 'todo',
      },
      {
        id: 'sam-6',
        text: 'Abonnementen.',
        scope: 'extra',
        taskId: 'sam-6-subscriptions',
        taskStatus: 'todo',
      },
      {
        id: 'sam-7',
        text: "Eenvoudig labels bij producten toevoegen (bijv. 'nieuw', 'valentijnstip').",
        scope: 'extra',
        taskId: 'sam-7-product-labels',
        taskStatus: 'todo',
      },
      {
        id: 'sam-8',
        text: 'Lint toevoegen (Brandsoft EasyRibbon v4.14 — oud programma, als het lukt).',
        scope: 'extra',
        taskId: 'sam-8-ribbon',
        taskStatus: 'in_progress',
        note: 'Theme UI klaar; EasyRibbon print-koppeling nog open.',
      },
      {
        id: 'sam-9',
        text: 'Limiet bezorgdatum per product instellen (bijv. max. 7 dagen vooruit i.v.m. inkoopprijzen).',
        scope: 'extra',
        taskId: 'sam-9-delivery-limit',
        taskStatus: 'todo',
      },
      {
        id: 'sam-10',
        text: 'Rozen: voorraden los per steel tellen (niet alleen globale toevoegingen), zoals nu in het dashboard.',
        scope: 'extra',
        taskId: 'sam-10-rose-inventory',
        taskStatus: 'todo',
      },
      {
        id: 'sam-11',
        text: 'Voorraadbeheer filterbaar op afleverdatum (bijv. verkochte aantallen tussen 2–6 april).',
        scope: 'extra',
        taskId: 'sam-11-inventory-by-date',
        taskStatus: 'todo',
      },
      {
        id: 'sam-12',
        text: 'Countdown product van de week.',
        scope: 'extra',
        taskId: 'sam-12-weekdeal',
        taskStatus: 'done',
        note: 'Deal-sectie live op Shopify homepage.',
      },
      {
        id: 'sam-13',
        text: 'Adreschecker in checkout.',
        scope: 'extra',
        taskId: 'sam-13-address-check',
        taskStatus: 'todo',
      },
      {
        id: 'sam-14',
        text: 'Producten in eigen volgorde plaatsen binnen categorieën.',
        scope: 'extra',
        taskId: 'sam-14-collection-sort',
        taskStatus: 'in_progress',
        note: 'Producten gekoppeld; handmatige volgorde in Admin nog instellen.',
      },
      {
        id: 'sam-15',
        text: 'Pakbon duidelijker inrichten zodat toevoegingen overzichtelijk zijn.',
        scope: 'extra',
        taskId: 'sam-15-packing-slip',
        taskStatus: 'todo',
      },
      {
        id: 'sam-16',
        text: 'Werkende cadeaubonnen.',
        scope: 'extra',
        taskId: 'sam-16-gift-cards',
        taskStatus: 'todo',
      },
      {
        id: 'sam-17',
        text: 'Emojis kunnen schrijven op kaartjes.',
        scope: 'extra',
        taskId: 'sam-17-card-emojis',
        taskStatus: 'in_progress',
        note: 'Kaartje-textarea in theme; emoji-ondersteuning nog testen.',
      },
      {
        id: 'sam-18',
        text: 'Koppeling social media kanalen.',
        scope: 'extra',
        taskId: 'sam-18-social-media',
        taskStatus: 'todo',
      },
      {
        id: 'sam-19',
        text: "Slider bovenin de site met USP's.",
        scope: 'extra',
        taskId: 'sam-19-usp-slider',
        taskStatus: 'in_progress',
        note: 'USP-sectie bestaat; nog verplaatsen naar bovenkant homepage.',
      },
    ],
  },
  {
    id: 'roald-seo',
    title: 'SEO & content (Roald)',
    author: 'roald',
    items: [
      {
        id: 'roald-1',
        text: 'Redirects goed instellen voor producten, categorieën en pagina\'s.',
        scope: 'migratie',
        taskId: 'upload-redirects',
        taskStatus: 'done',
        note: '1.944 pagina-redirects geïmporteerd; steekproef 30/30 OK. Hub-redirects naar /pages/.',
      },
      {
        id: 'roald-2',
        text: 'Teksten 1-op-1 overnemen uit WooCommerce.',
        scope: 'migratie',
        taskId: 'content-1to1',
        note: 'Producten + 181 pagina\'s + 7 blogposts gedaan. Collectie-SEO-teksten, hub-styling en interne links nog nalopen.',
      },
      {
        id: 'roald-3',
        text: 'Ga je de afbeeldingen ook redirecten? (/wp-content/uploads/...)',
        scope: 'migratie',
        taskId: 'image-url-redirects',
        taskStatus: 'in_progress',
        note: 'Nog geen image-redirects. ~400 WC media-URL\'s; foto\'s staan op Shopify CDN via productpagina\'s. Afstemmen: uploads tijdelijk online vs. batch-redirects.',
      },
    ],
  },
]

export const SCOPE_LABELS: Record<NonNullable<AgreementItem['scope']>, string> = {
  migratie: 'Migratie',
  extra: 'Extra (binnen scope indien haalbaar)',
  'post-oplevering': 'Na oplevering',
  info: 'Toelichting',
}

export const SCOPE_COLORS: Record<NonNullable<AgreementItem['scope']>, string> = {
  migratie: 'bg-green-50 text-green-700 ring-green-200',
  extra: 'bg-amber-50 text-amber-700 ring-amber-200',
  'post-oplevering': 'bg-gray-100 text-gray-600 ring-gray-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
}

export const TASK_STATUS_LABELS = {
  todo: 'Te doen',
  in_progress: 'Bezig',
  done: 'Afgerond',
} as const

export const TASK_STATUS_COLORS = {
  todo: 'bg-gray-100 text-gray-600 ring-gray-200',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-200',
  done: 'bg-green-50 text-green-700 ring-green-200',
} as const

export const AUTHOR_LABELS = {
  chiel: 'Chiel',
  sam: 'Sam',
  roald: 'Roald',
} as const
