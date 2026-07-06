import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { getShopifyCliStatus, type ShopifyCliStatus } from './shopify-cli'
import {
  readGoliveAudit,
  isPaymentConfigured,
  isGiftCardsEnabled,
  isDomainLive,
} from './golive-audit'
import {
  applySnapshotOverlay,
  readMigrationSnapshot,
  shouldUseMigrationSnapshot,
} from './snapshot'

export type { ShopifyCliStatus }

const ROOT = process.cwd()

export type MigrationTaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked'

export interface MigrationTask {
  id: string
  title: string
  description: string
  status: MigrationTaskStatus
  phase: string
  assignee?: 'chiel' | 'sam' | 'roald'
  priority: 'low' | 'medium' | 'high' | 'critical'
  completedAt?: string
  link?: string
  command?: string
  /** Koppeling naar item in lib/migration/agreements.ts (bijv. sam-8, roald-2) */
  agreementId?: string
}

export interface MigrationPhase {
  id: string
  title: string
  description: string
  order: number
}

export interface MigrationStats {
  wcProducts: number
  wcProductsWithImages: number
  wcProductsWithoutImages: number
  shopifyImported: number
  shopifyPublished: number
  shopifyFailed: number
  redirectCount: number
  collectionCount: number
  shopifyStore: string
  wcStore: string
  lastImportAt: string | null
}

export interface MigrationStatus {
  overallProgress: number
  phases: MigrationPhase[]
  tasks: MigrationTask[]
  stats: MigrationStats
  shopifyCli: ShopifyCliStatus
  updatedAt: string
}

const PHASES: MigrationPhase[] = [
  {
    id: 'prep',
    title: 'Voorbereiding & export',
    description: 'WooCommerce data exporteren en valideren',
    order: 1,
  },
  {
    id: 'transform',
    title: 'Data transformatie',
    description: 'WC CSV omzetten naar Shopify-formaat',
    order: 2,
  },
  {
    id: 'import',
    title: 'Product import',
    description: 'Producten, varianten en afbeeldingen naar Shopify',
    order: 3,
  },
  {
    id: 'seo',
    title: 'SEO & URL\'s',
    description: 'Redirects, collecties en metadata',
    order: 4,
  },
  {
    id: 'theme',
    title: 'Thema & storefront',
    description: 'Shopify theme en productpagina\'s',
    order: 5,
  },
  {
    id: 'extra',
    title: 'Extra wensen (Sam)',
    description: 'Functionaliteiten buiten standaard 1:1 migratie',
    order: 6,
  },
  {
    id: 'golive',
    title: 'Livegang',
    description: 'Domein, betalingen en definitieve switch',
    order: 7,
  },
]

function fileExists(relativePath: string) {
  return fs.existsSync(path.join(ROOT, relativePath))
}

function fileContains(relativePath: string, needle: string) {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return false
  return fs.readFileSync(fullPath, 'utf-8').includes(needle)
}

function readJson<T>(relativePath: string): T | null {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return null
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as T
  } catch {
    return null
  }
}

function countCsvRows(relativePath: string) {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return 0
  const content = fs.readFileSync(fullPath, 'utf-8')
  const lines = content.split('\n').filter((line) => line.trim())
  return Math.max(0, lines.length - 1)
}

function countImportLogSuccesses() {
  const logPath = path.join(ROOT, 'data/import/shopify-import-all.log')
  if (!fs.existsSync(logPath)) return null
  const content = fs.readFileSync(logPath, 'utf-8')
  const liveMatches = content.match(/publish\.\.\. live/g)
  return liveMatches?.length ?? 0
}

function getImportStats(wcTotal: number) {
  const importReport = readJson<{
    imported?: number
    published?: number
    failed?: number
    finishedAt?: string
    results?: Array<{ handle: string; imported?: boolean; published?: boolean }>
  }>('data/import/shopify-import-all-report.json')

  const logSuccesses = countImportLogSuccesses()
  const reportPublished = importReport?.results?.filter((r) => r.published).length ?? 0

  let published = logSuccesses ?? importReport?.published ?? reportPublished

  // Kleine retry-batch (bijv. 25 fixes) optellen bij eerdere log-run
  if (
    logSuccesses &&
    reportPublished > 0 &&
    reportPublished < wcTotal &&
    reportPublished <= 50
  ) {
    published = logSuccesses + reportPublished
  }

  if (wcTotal > 0) {
    published = Math.min(published, wcTotal)
  }

  const importComplete = wcTotal > 0 && published >= wcTotal

  return {
    imported: published,
    published,
    failed: importReport?.failed ?? 0,
    lastImportAt: importReport?.finishedAt ?? null,
    importComplete,
    hasImportReport: Boolean(importReport),
  }
}

function getWcProductStats() {
  const csvPath = path.join(ROOT, 'data/import/wc-export-latest.csv')
  if (!fs.existsSync(csvPath)) {
    return { total: 0, withImages: 0, withoutImages: 0 }
  }

  const records = parse(fs.readFileSync(csvPath, 'utf-8'), {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
    bom: true,
  }) as Array<Record<string, string>>

  let total = 0
  let withImages = 0

  records.forEach((row) => {
    const parentId = row['Parent Product ID']
    if (row.Status !== 'publish' || (parentId && parentId !== '0')) return
    total++
    const image = row['Image Featured'] || row['Image URL'] || ''
    if (image.startsWith('http')) withImages++
  })

  return { total, withImages, withoutImages: total - withImages }
}

function buildTasks(detect: {
  hasWcExport: boolean
  hasShopifyCsv: boolean
  hasRedirects: boolean
  hasCollectionsCsv: boolean
  hasImportReport: boolean
  hasTheme: boolean
  hasImportScripts: boolean
  hasApiApp: boolean
  cliConnected: boolean
  importComplete: boolean
  importFailed: number
  lastImportAt: string | null
  hasRibbonUi: boolean
  hasCardUi: boolean
  hasDealSection: boolean
  hasUspSection: boolean
  hasOrderPicker: boolean
  collectionsAssigned: boolean
  hasBreadcrumbs: boolean
  hasPageParity: boolean
  hubRedirectsFixed: boolean
  hasProductLabels: boolean
  hasStructuredData: boolean
  hasTrackPage: boolean
  hasUspTop: boolean
  hasPackingSlipTemplate: boolean
  hasCardEmoji: boolean
  collectionSeoImported: boolean
  redirectSteekproefDone: boolean
  goliveAudit: ReturnType<typeof readGoliveAudit>
}): MigrationTask[] {
  const golive = detect.goliveAudit
  const paymentOk = isPaymentConfigured(golive)
  const giftCardsOk = isGiftCardsEnabled(golive)
  const domainOk = isDomainLive(golive)
  const shippingOk = golive?.checks?.find((c) => c.id === 'shipping-nl')?.passed === true
  const pagesReport = readJson<{
    mode?: string
    created?: number
    skipped?: number
    finishedAt?: string
  }>('data/import/shopify-pages-report.json')
  const parityReport = readJson<{
    summary?: { missingInShopify?: number; navigationOk?: number; navigationTotal?: number }
  }>('data/import/page-parity-report.json')
  const hubReport = readJson<{ method?: string; updated?: number }>('data/import/shopify-redirects-report.json')

  const pagesDone =
    Boolean(pagesReport?.finishedAt) &&
    (pagesReport?.mode === 'redirect-targets' || pagesReport?.mode === 'all') &&
    (pagesReport?.created ?? 0) + (pagesReport?.skipped ?? 0) >= 150 &&
    parityReport?.summary?.missingInShopify === 0

  const parityDone =
    parityReport?.summary?.missingInShopify === 0 &&
    parityReport?.summary?.navigationOk === parityReport?.summary?.navigationTotal

  const hubRedirectsDone =
    detect.hubRedirectsFixed ||
    (hubReport?.method === 'fix-hubs' && (hubReport?.updated ?? 0) >= 12) ||
    (fileExists('shopify-redirects.csv') &&
      fileContains('shopify-redirects.csv', '"/groen-decoratief","/pages/groen-decoratief"'))

  const headerMenuDone =
    fileExists('SHOPIFY/sections/header.liquid') &&
    fileContains('SHOPIFY/sections/header.liquid', '/pages/rozen-bestellen-bij-de-gier') &&
    !fileContains('SHOPIFY/sections/header.liquid', '{{ routes.collections_url }}">{{ \'header.nav.roses\'')

  const migratie1to1Done =
    detect.importComplete &&
    pagesDone &&
    parityDone &&
    headerMenuDone &&
    detect.collectionsAssigned

  const tasks: MigrationTask[] = [
    {
      id: 'migratie-1to1',
      title: 'WooCommerce 1:1 naar Shopify',
      description:
        'Kernafspraak: volledige shop met zelfde structuur, pagina\'s, producten en navigatie als bloemenvandegier.nl.',
      status: migratie1to1Done ? 'done' : detect.importComplete ? 'in_progress' : 'todo',
      phase: 'import',
      assignee: 'chiel',
      priority: 'critical',
      agreementId: 'chiel-1',
    },
    {
      id: 'wc-api-fetch',
      title: 'WooCommerce data ophalen via REST API',
      description: 'Producten, categorieën, tags, pagina\'s en blogposts naar data/import/wc-api/.',
      status: fileExists('data/import/wc-api/manifest.json') ? 'done' : 'todo',
      phase: 'prep',
      assignee: 'chiel',
      priority: 'high',
      command: 'npm run wc:fetch-all',
    },
    {
      id: 'wc-export',
      title: 'WooCommerce productexport',
      description: 'WP All Export CSV met alle gepubliceerde producten en varianten.',
      status: detect.hasWcExport ? 'done' : 'todo',
      phase: 'prep',
      assignee: 'chiel',
      priority: 'critical',
      completedAt: detect.hasWcExport ? '2026-07-04' : undefined,
      command: 'Handmatig via WooCommerce → Producten → Exporteren',
    },
    {
      id: 'import-plan',
      title: 'Importplan & architectuur',
      description: 'Lokaal importplan zonder Supabase — MacBook als tijdelijke opslag.',
      status: fileExists('shopify-import-plan.md') ? 'done' : 'todo',
      phase: 'prep',
      assignee: 'chiel',
      priority: 'medium',
      link: '/shopify-import-plan.md',
    },
    {
      id: 'shopify-cli',
      title: 'Shopify CLI & theme setup',
      description: 'CLI gekoppeld aan xn68xb-0f.myshopify.com, live theme bloemenvandegier.',
      status: detect.cliConnected ? 'done' : detect.hasTheme ? 'in_progress' : 'todo',
      phase: 'prep',
      assignee: 'chiel',
      priority: 'high',
      command: 'npx @shopify/cli auth login',
    },
    {
      id: 'api-app',
      title: 'Shopify Dev App + API credentials',
      description: 'Custom app met volledige scopes, client credentials grant voor scripts.',
      status: detect.hasApiApp ? 'done' : 'todo',
      phase: 'prep',
      assignee: 'chiel',
      priority: 'critical',
      link: 'https://admin.shopify.com',
    },
    {
      id: 'wc-to-shopify-csv',
      title: 'WC → Shopify CSV transform',
      description: 'Script converteert export naar shopify-products.csv (421 producten).',
      status: detect.hasShopifyCsv ? 'done' : 'todo',
      phase: 'transform',
      assignee: 'chiel',
      priority: 'high',
      command: 'npm run import:shopify-csv',
    },
    {
      id: 'collections-csv',
      title: 'Collecties CSV gegenereerd',
      description: '89 WooCommerce categorieën omgezet naar Shopify collecties.',
      status: detect.hasCollectionsCsv ? 'done' : 'todo',
      phase: 'transform',
      assignee: 'chiel',
      priority: 'medium',
    },
    {
      id: 'redirects-csv',
      title: '301 redirects CSV gegenereerd',
      description: '1.944 URL-redirects van /product-categorie/ naar /collections/.',
      status: detect.hasRedirects ? 'done' : 'todo',
      phase: 'seo',
      assignee: 'chiel',
      priority: 'critical',
      command: 'node scripts/generate-shopify-redirects.js',
      link: '/shopify-seo.md',
    },
    {
      id: 'import-scripts',
      title: 'Import & publish scripts',
      description: 'shopify-import-all.js, shopify-get-token.js en publish script.',
      status: detect.hasImportScripts ? 'done' : 'todo',
      phase: 'import',
      assignee: 'chiel',
      priority: 'high',
      command: 'npm run import:shopify-all',
    },
    {
      id: 'test-import',
      title: 'Testimport (20 producten)',
      description: 'Eerste test inclusief variabele producten zoals witte-tulpen.',
      status: fileExists('data/import/shopify-import-test-report.json') ? 'done' : 'todo',
      phase: 'import',
      assignee: 'chiel',
      priority: 'high',
      command: 'npm run import:shopify-test',
    },
    {
      id: 'full-import',
      title: 'Volledige productimport',
      description: 'Alle 421 producten importeren met afbeeldingen via GraphQL productSet.',
      status: detect.importComplete ? 'done' : detect.hasImportReport ? 'in_progress' : 'todo',
      phase: 'import',
      assignee: 'chiel',
      priority: 'critical',
      completedAt: detect.importComplete ? detect.lastImportAt ?? undefined : undefined,
      command: 'npm run import:shopify-all',
    },
    {
      id: 'publish-online-store',
      title: 'Publiceren naar Online Store',
      description: 'Producten beschikbaar maken op de storefront (niet alleen Admin).',
      status: detect.importComplete ? 'done' : detect.importFailed > 0 ? 'in_progress' : 'todo',
      phase: 'import',
      assignee: 'chiel',
      priority: 'critical',
      command: 'npm run import:shopify-publish:all',
    },
    {
      id: 'variant-price-fix',
      title: 'Variant prijs-update in theme',
      description: 'JavaScript fix zodat prijs meeverandert bij variantselectie.',
      status: detect.hasTheme ? 'done' : 'todo',
      phase: 'theme',
      assignee: 'chiel',
      priority: 'high',
    },
    {
      id: 'upload-redirects',
      title: 'Redirects uploaden in Shopify',
      description: '1.944 URL-redirects importeren via API (shopify-import-redirects.js).',
      status: (() => {
        if (!fileExists('data/import/shopify-redirects-report.json')) return 'todo'
        try {
          const report = JSON.parse(
            fs.readFileSync(path.join(ROOT, 'data/import/shopify-redirects-report.json'), 'utf-8')
          )
          if (report.finishedAt && report.created + report.skipped >= 1900) return 'done'
          if (report.progress > 0) return 'in_progress'
          return 'todo'
        } catch {
          return 'todo'
        }
      })(),
      phase: 'seo',
      assignee: 'chiel',
      priority: 'critical',
      command: 'npm run import:shopify-redirects',
      agreementId: 'roald-1',
    },
    {
      id: 'create-collections',
      title: 'Collecties aanmaken in Shopify',
      description: '89 collecties importeren en publiceren op Online Store.',
      status: (() => {
        if (!fileExists('data/import/shopify-collections-report.json')) return 'todo'
        try {
          const report = JSON.parse(
            fs.readFileSync(path.join(ROOT, 'data/import/shopify-collections-report.json'), 'utf-8')
          )
          return report.created + report.skipped >= 89 ? 'done' : 'in_progress'
        } catch {
          return 'todo'
        }
      })(),
      phase: 'seo',
      assignee: 'chiel',
      priority: 'high',
      command: 'npm run import:shopify-collections',
    },
    {
      id: 'cleanup-duplicates',
      title: 'Dubbele producten opruimen',
      description: 'Shopify-producten verwijderen die niet in WC-export voorkomen.',
      status:
        fileExists('data/import/shopify-cleanup-report.json') &&
        (() => {
          try {
            const report = JSON.parse(
              fs.readFileSync(path.join(ROOT, 'data/import/shopify-cleanup-report.json'), 'utf-8')
            )
            return report.mode === 'execute' && report.deleted?.length > 0
          } catch {
            return false
          }
        })()
          ? 'done'
          : 'todo',
      phase: 'import',
      assignee: 'chiel',
      priority: 'medium',
      command: 'npm run import:shopify-cleanup -- --execute',
    },
    {
      id: 'blog-migration',
      title: 'Blog/nieuws migreren',
      description: 'WordPress posts importeren als Shopify blog (handle: nieuws).',
      status: (() => {
        if (!fileExists('data/import/shopify-blog-report.json')) return 'todo'
        try {
          const report = JSON.parse(
            fs.readFileSync(path.join(ROOT, 'data/import/shopify-blog-report.json'), 'utf-8')
          )
          return report.finishedAt && report.created + report.skipped >= report.total ? 'done' : 'in_progress'
        } catch {
          return 'todo'
        }
      })(),
      phase: 'seo',
      assignee: 'chiel',
      priority: 'medium',
      command: 'npm run import:shopify-blog',
    },
    {
      id: 'pages-migration',
      title: 'Statische pagina\'s migreren',
      description: 'WC/WordPress pagina\'s naar Shopify Pages — incl. hub-pagina\'s (rozen, boeketten) met keuzeblokken.',
      status: pagesDone ? 'done' : pagesReport ? 'in_progress' : 'todo',
      phase: 'seo',
      assignee: 'chiel',
      priority: 'critical',
      command: 'npm run import:shopify-pages:redirects',
      completedAt: pagesDone ? pagesReport?.finishedAt?.split('T')[0] : undefined,
    },
    {
      id: 'page-parity-audit',
      title: 'Pagina-pariteit WC ↔ Shopify controleren',
      description: 'Vergelijk menu- en hub-pagina\'s (rozen, boeketten, groen) met live WooCommerce. Rapport in data/import/page-parity-report.json.',
      status: parityDone ? 'done' : parityReport ? 'in_progress' : 'todo',
      phase: 'seo',
      assignee: 'chiel',
      priority: 'critical',
      command: 'npm run audit:page-parity',
      completedAt: parityDone ? new Date().toISOString().split('T')[0] : undefined,
    },
    {
      id: 'shopify-header-menu',
      title: 'Shopify menu 1:1 met WooCommerce',
      description: 'Header-navigatie met juiste URLs en dropdowns (niet meer alles naar /collections). SHOPIFY/sections/header.liquid.',
      status: headerMenuDone ? 'done' : fileExists('SHOPIFY/sections/header.liquid') ? 'in_progress' : 'todo',
      phase: 'theme',
      assignee: 'chiel',
      priority: 'critical',
      completedAt: headerMenuDone ? '2026-07-04' : undefined,
    },
    {
      id: 'hub-page-redirects',
      title: 'Hub-pagina redirects naar /pages/',
      description: 'Overzichtspagina\'s (groen-decoratief, voorjaarsbloemen, etc.) redirecten naar /pages/ i.p.v. /collections/ voor keuzeblokken.',
      status: hubRedirectsDone ? 'done' : 'todo',
      phase: 'seo',
      assignee: 'chiel',
      priority: 'high',
      command: 'npm run generate:shopify-redirects && npm run import:shopify-redirects:fix-hubs',
      completedAt: hubRedirectsDone ? '2026-07-04' : undefined,
    },
    {
      id: 'hub-page-styling',
      title: 'Keuzeblokken styling op hub-pagina\'s',
      description:
        'Hub-pagina\'s (rozen, boeketten, groen) in collectie-stijl: breadcrumbs, SEO intro, categorieblokken en productgrid. Template page.hub + scripts/generate-hub-pages-config.js.',
      status: (() => {
        const hasHubSection = fileExists('SHOPIFY/sections/main-page-hub.liquid')
        const hasHubSnippet = fileExists('SHOPIFY/snippets/hub-pages-content.liquid')
        const hasHubConfig = fileExists('data/hub-pages.json')
        if (!hasHubSection || !hasHubSnippet || !hasHubConfig) return 'todo'
        if (!fileExists('data/import/shopify-hub-templates-report.json')) return 'in_progress'
        try {
          const report = JSON.parse(
            fs.readFileSync(path.join(ROOT, 'data/import/shopify-hub-templates-report.json'), 'utf-8')
          )
          return report.finishedAt && report.updated + report.skipped >= 20 ? 'done' : 'in_progress'
        } catch {
          return 'in_progress'
        }
      })(),
      phase: 'theme',
      assignee: 'chiel',
      priority: 'high',
      command: 'npm run generate:hub-pages && npm run import:shopify-hub-templates',
    },
    {
      id: 'internal-links-fix',
      title: 'Interne links in pagina-content bijwerken',
      description:
        'Geïmporteerde WP-HTML bevat nog /product-categorie/ en oude WC-URLs. Links in pagina\'s omzetten naar /collections/ en /pages/.',
      status: (() => {
        if (!fileExists('data/import/shopify-internal-links-report.json')) return pagesDone ? 'todo' : 'todo'
        try {
          const report = JSON.parse(
            fs.readFileSync(path.join(ROOT, 'data/import/shopify-internal-links-report.json'), 'utf-8')
          )
          return report.finishedAt && !report.dryRun && report.errors?.length === 0 && (report.updated ?? 0) >= 100
            ? 'done'
            : 'in_progress'
        } catch {
          return 'todo'
        }
      })(),
      phase: 'seo',
      assignee: 'chiel',
      priority: 'high',
      agreementId: 'roald-2',
      command: 'npm run fix:internal-links',
    },
    {
      id: 'content-1to1',
      title: 'Teksten 1-op-1 overnemen uit WooCommerce',
      description:
        'Productbeschrijvingen, categorie-SEO-teksten, hub-pagina\'s en blogposts gelijk aan WC. Producten + 181 pagina\'s + 7 blogs gedaan; collectie-teksten en styling nog nalopen.',
      status: (() => {
        if (!fileExists('data/import/full-content-audit.json')) {
          return detect.importComplete && pagesDone ? 'in_progress' : detect.importComplete ? 'in_progress' : 'todo'
        }
        try {
          const audit = JSON.parse(
            fs.readFileSync(path.join(ROOT, 'data/import/full-content-audit.json'), 'utf-8')
          )
          const s = audit.summary
          const collectionsOk = s.collectionIssues <= 3 && s.collectionsOk >= 99
          const productsOk = s.productMetaIssues === 0 && s.productBodyIssues === 0
          return collectionsOk && productsOk && pagesDone ? 'done' : 'in_progress'
        } catch {
          return 'in_progress'
        }
      })(),
      phase: 'seo',
      assignee: 'chiel',
      priority: 'high',
      agreementId: 'roald-2',
      command: 'npm run audit:full-content',
    },
    {
      id: 'collection-seo-texts',
      title: 'SEO-teksten op collectiepagina\'s',
      description: 'Categorie-omschrijvingen onder producten overzetten vanuit WooCommerce (zoals op /product-categorie/rozen/).',
      status: detect.collectionSeoImported ? 'done' : detect.collectionsAssigned ? 'in_progress' : 'todo',
      phase: 'seo',
      assignee: 'chiel',
      priority: 'high',
      agreementId: 'roald-2',
      command: 'npm run import:shopify-collection-seo',
      completedAt: detect.collectionSeoImported ? '2026-07-05' : undefined,
    },
    {
      id: 'handles-verify',
      title: 'Shopify handles gelijk met WC-slugs',
      description: 'Controleren dat alle product- en collectie-handles overeenkomen met WooCommerce-slugs voor SEO en redirects.',
      status: (() => {
        if (!fileExists('data/import/handles-verify-report.json')) return 'todo'
        try {
          const report = JSON.parse(
            fs.readFileSync(path.join(ROOT, 'data/import/handles-verify-report.json'), 'utf-8')
          )
          return report.passed ? 'done' : 'in_progress'
        } catch {
          return 'todo'
        }
      })(),
      phase: 'seo',
      assignee: 'chiel',
      priority: 'medium',
      agreementId: 'roald-1',
      command: 'npm run audit:handles',
    },
    {
      id: 'assign-collections',
      title: 'Producten aan collecties koppelen',
      description: 'Producten toewijzen aan collecties op basis van WC-categorieën/tags.',
      status: (() => {
        if (!fileExists('data/import/shopify-assign-collections-report.json')) return 'todo'
        try {
          const report = JSON.parse(
            fs.readFileSync(path.join(ROOT, 'data/import/shopify-assign-collections-report.json'), 'utf-8')
          )
          return report.finishedAt && report.assigned > 0 ? 'done' : 'in_progress'
        } catch {
          return 'todo'
        }
      })(),
      phase: 'seo',
      assignee: 'chiel',
      priority: 'high',
      command: 'npm run import:shopify-assign-collections',
    },
    {
      id: 'homepage-parity',
      title: 'Homepage 1:1 met WooCommerce',
      description: 'Homepage-secties (hero, deal van de week, categorieën, trust bar) afstemmen op live WC. Deal-sectie live; USP-sectie direct onder hero.',
      status: detect.hasUspTop ? 'done' : detect.hasDealSection ? 'in_progress' : 'todo',
      phase: 'theme',
      assignee: 'chiel',
      priority: 'high',
      completedAt: detect.hasUspTop ? '2026-07-05' : undefined,
    },
    {
      id: 'product-page-options',
      title: 'Productpagina opties (kaartje, lint, bezorgdatum)',
      description: 'WC-productpagina heeft kaartje, lint, bezorgdatum en extras. Theme panels bestaan; bezorgdatum-picker en checkout-koppeling nog bouwen.',
      status: detect.hasCardUi && detect.hasRibbonUi ? 'in_progress' : 'todo',
      phase: 'theme',
      assignee: 'chiel',
      priority: 'critical',
      agreementId: 'chiel-2',
    },
    {
      id: 'structured-data',
      title: 'Structured data (Product, BreadcrumbList)',
      description: 'JSON-LD voor producten en breadcrumbs controleren/aanvullen in Shopify theme voor SEO.',
      status: detect.hasStructuredData ? 'done' : 'todo',
      phase: 'seo',
      assignee: 'chiel',
      priority: 'medium',
      agreementId: 'roald-2',
      completedAt: detect.hasStructuredData ? '2026-07-05' : undefined,
    },
    {
      id: 'tulpen-landing',
      title: 'Tulpen-landingspagina in navigatie',
      description: 'WC heeft /tulpen-bestellen/ als landingspagina. Pagina geïmporteerd; nog opnemen in menu indien gewenst op WC.',
      status: pagesDone ? 'done' : 'todo',
      phase: 'theme',
      assignee: 'chiel',
      priority: 'low',
      completedAt: pagesDone ? '2026-07-04' : undefined,
    },
    {
      id: 'order-picker-dashboard',
      title: 'Order picker dashboard',
      description: 'Custom dashboard voor orders picken (besproken met Sam). Next.js prototype op /admin/order-picker — nog koppelen aan Shopify orders.',
      status: detect.hasOrderPicker ? 'in_progress' : 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'high',
      link: '/admin/order-picker',
      agreementId: 'chiel-2',
    },
    {
      id: 'sam-1-courier',
      title: 'Directe koppeling met koeriers',
      description: 'Wens Sam: geen PakketPartner meer, directe koerier-integratie voor verzending en tracking.',
      status: 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'high',
      agreementId: 'sam-1',
    },
    {
      id: 'sam-2-fulfillment-system',
      title: 'Kaartjes, pakbon & labels uit één systeem',
      description: 'Wens Sam: kaartjes, pakbonnen en labels vanuit één systeem. Kaartje + lint in Shopify theme; order-picker in Next.js — nog niet één geheel.',
      status: detect.hasCardUi && detect.hasRibbonUi ? 'in_progress' : 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'high',
      agreementId: 'sam-2',
    },
    {
      id: 'sam-3-trace-link',
      title: 'Snelle trace-link op de site',
      description: 'Wens Sam: trace-link met koppeling naar koerier. Track-pagina op /pages/track; koerier-URL instelbaar in theme.',
      status: detect.hasTrackPage ? 'in_progress' : 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'medium',
      link: '/pages/track',
      agreementId: 'sam-3',
    },
    {
      id: 'sam-4-customer-account',
      title: 'Klanteninlog met bestelgeschiedenis',
      description: 'Wens Sam: inlog, bestelgeschiedenis en zelf bezorgdatum aanpassen. Shopify customer accounts basis beschikbaar; bezorgdatum-wijziging nog bouwen.',
      status: 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'high',
      agreementId: 'sam-4',
    },
    {
      id: 'sam-5-business-account',
      title: 'Zakelijke klanteninlog',
      description: 'Wens Sam: zakelijke login met afgesproken kortingen en achteraf betalen op factuur. Next.js /zakelijk prototype; nog niet in Shopify.',
      status: 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'high',
      agreementId: 'sam-5',
    },
    {
      id: 'sam-6-subscriptions',
      title: 'Abonnementen',
      description: 'Wens Sam: bloemenabonnementen. Next.js admin /admin/abonnementen als prototype; Shopify subscription app of custom build nodig.',
      status: 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'medium',
      agreementId: 'sam-6',
    },
    {
      id: 'sam-7-product-labels',
      title: 'Productlabels (nieuw, valentijnstip)',
      description: 'Wens Sam: eenvoudig labels bij producten via tags (nieuw, valentijnstip, weekdeal). Zichtbaar op productkaarten.',
      status: detect.hasProductLabels ? 'done' : 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'medium',
      agreementId: 'sam-7',
      completedAt: detect.hasProductLabels ? '2026-07-05' : undefined,
    },
    {
      id: 'sam-8-ribbon',
      title: 'Lint toevoegen (EasyRibbon)',
      description: 'Wens Sam: lint op boeketten. Shopify theme UI klaar (kleur + tekst); koppeling met Brandsoft EasyRibbon v4.14 voor print ontbreekt.',
      status: detect.hasRibbonUi ? 'in_progress' : 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'high',
      agreementId: 'sam-8',
    },
    {
      id: 'sam-9-delivery-limit',
      title: 'Limiet bezorgdatum per product',
      description: 'Wens Sam: per product max. X dagen vooruit bestellen (bijv. 7 dagen) i.v.m. inkoopprijzen. Nog niet in Shopify checkout.',
      status: 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'high',
      agreementId: 'sam-9',
    },
    {
      id: 'sam-10-rose-inventory',
      title: 'Rozen voorraad per steel',
      description: 'Wens Sam: rozen-telling per steel i.p.v. alleen globale toevoegingen, zoals nu in het dashboard.',
      status: 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'medium',
      agreementId: 'sam-10',
    },
    {
      id: 'sam-11-inventory-by-date',
      title: 'Voorraadbeheer op afleverdatum',
      description: 'Wens Sam: verkochte aantallen filteren op afleverdatum (bijv. 2–6 april).',
      status: 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'medium',
      agreementId: 'sam-11',
    },
    {
      id: 'sam-12-weekdeal',
      title: 'Countdown deal van de week',
      description: 'Wens Sam: product van de week met countdown/voorraad. Deal-sectie live op Shopify homepage (deal.liquid).',
      status: detect.hasDealSection ? 'done' : 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'medium',
      completedAt: detect.hasDealSection ? '2026-07-04' : undefined,
      agreementId: 'sam-12',
    },
    {
      id: 'sam-13-address-check',
      title: 'Adreschecker in checkout',
      description: 'Wens Sam: adresvalidatie in checkout. Shopify app of checkout extensie nog instellen.',
      status: 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'medium',
      agreementId: 'sam-13',
    },
    {
      id: 'sam-14-collection-sort',
      title: 'Productvolgorde in collecties',
      description: 'Wens Sam: producten in eigen volgorde binnen categorieën. 1.028 koppelingen gedaan; handmatige sortering per collectie in Shopify Admin nog instellen.',
      status: detect.collectionsAssigned ? 'in_progress' : 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'medium',
      command: 'npm run import:shopify-assign-collections',
      agreementId: 'sam-14',
    },
    {
      id: 'sam-15-packing-slip',
      title: 'Pakbon duidelijker inrichten',
      description: 'Wens Sam: pakbon met overzichtelijke toevoegingen (kaartje, lint, extras). Template in data/shopify/packing-slip-template.liquid — plakken in Shopify Admin.',
      status: detect.hasPackingSlipTemplate ? 'in_progress' : 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'medium',
      agreementId: 'sam-15',
    },
    {
      id: 'sam-16-gift-cards',
      title: 'Werkende cadeaubonnen',
      description: 'Wens Sam: cadeaubonnen in de shop. Shopify Gift Cards activeren en configureren.',
      status: giftCardsOk ? 'done' : golive ? 'in_progress' : 'todo',
      phase: 'extra',
      assignee: 'sam',
      priority: 'high',
      agreementId: 'sam-16',
      link: '/migratie/golive',
      command: 'npm run audit:golive',
    },
    {
      id: 'sam-17-card-emojis',
      title: 'Emojis op kaartjes',
      description: 'Wens Sam: emojis kunnen schrijven op kaartjes. Kaartje-textarea ondersteunt emoji-invoer.',
      status: detect.hasCardEmoji ? 'done' : detect.hasCardUi ? 'in_progress' : 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'low',
      agreementId: 'sam-17',
      completedAt: detect.hasCardEmoji ? '2026-07-05' : undefined,
    },
    {
      id: 'sam-18-social-media',
      title: 'Koppeling social media kanalen',
      description: 'Wens Sam: social media integratie (Instagram/Facebook shop, pixels, feeds).',
      status: 'todo',
      phase: 'extra',
      assignee: 'sam',
      priority: 'low',
      agreementId: 'sam-18',
    },
    {
      id: 'sam-19-usp-slider',
      title: "USP's bovenin de site",
      description: 'Wens Sam: USP\'s bovenaan homepage. USP-balk in header + USP-sectie direct onder hero.',
      status: detect.hasUspTop ? 'done' : detect.hasUspSection ? 'in_progress' : 'todo',
      phase: 'extra',
      assignee: 'chiel',
      priority: 'medium',
      agreementId: 'sam-19',
      completedAt: detect.hasUspTop ? '2026-07-05' : undefined,
    },
    {
      id: 'seo-meta',
      title: 'SEO metadata controleren',
      description: 'Titles, descriptions en structured data per product/collectie nalopen.',
      status: 'todo',
      phase: 'seo',
      assignee: 'chiel',
      priority: 'high',
      link: '/shopify-seo.md',
    },
    {
      id: 'redirect-steekproef',
      title: 'Redirect steekproef testen',
      description: '20–30 belangrijke URLs (top categorieën, bestsellers, hub-pagina\'s) testen op 301 → juiste Shopify-pagina. Geen 404\'s of redirect chains.',
      status: detect.redirectSteekproefDone ? 'done' : 'todo',
      phase: 'golive',
      assignee: 'chiel',
      priority: 'critical',
      agreementId: 'roald-1',
      link: '/shopify-seo.md',
      command: 'npm run audit:redirect-steekproef',
      completedAt: detect.redirectSteekproefDone ? '2026-07-05' : undefined,
    },
    {
      id: 'image-url-redirects',
      title: 'Afbeelding-URL\'s redirecten? (vraag Roald)',
      description:
        'Roald (6 jul): "Ga je de afbeeldingen ook redirecten?" — 1.944 redirects dekken pagina\'s/producten/collecties, niet /wp-content/uploads/ (~400 unieke media-URL\'s). Shopify heeft geen wildcard. Keuze: WC-uploads tijdelijk online houden, batch image-redirects naar Shopify CDN, of monitoren via Search Console.',
      status: 'in_progress',
      phase: 'seo',
      assignee: 'chiel',
      priority: 'medium',
      agreementId: 'roald-3',
      link: '/shopify-seo.md',
    },
    {
      id: 'shop-oplevering',
      title: 'Shop volledig bouwen en opleveren',
      description:
        'Kernafspraak: deze maand complete Shopify storefront met alle data, werkend menu, checkout en redirects klaar voor livegang.',
      status: migratie1to1Done ? 'in_progress' : 'in_progress',
      phase: 'golive',
      assignee: 'chiel',
      priority: 'critical',
      agreementId: 'chiel-4',
    },
    {
      id: 'payment-shipping',
      title: 'Betaling & verzending configureren',
      description: 'Shopify Payments, iDEAL en bezorgzones instellen voor Nederland.',
      status: paymentOk && shippingOk ? 'done' : golive ? 'in_progress' : 'todo',
      phase: 'golive',
      assignee: 'sam',
      priority: 'critical',
      link: '/migratie/golive',
      command: 'npm run audit:golive',
    },
    {
      id: 'domain-switch',
      title: 'Domein bloemenvandegier.nl koppelen',
      description: 'DNS omzetten van WooCommerce naar Shopify en SSL verifiëren.',
      status: domainOk ? 'done' : paymentOk && giftCardsOk ? 'in_progress' : 'todo',
      phase: 'golive',
      assignee: 'sam',
      priority: 'critical',
      link: '/migratie/golive',
    },
    {
      id: 'search-console',
      title: 'Google Search Console + sitemap',
      description: 'Na livegang nieuwe sitemap indienen, crawl errors monitoren 4–6 weken. Bing Webmaster Tools optioneel.',
      status: 'todo',
      phase: 'golive',
      assignee: 'roald',
      priority: 'high',
      agreementId: 'roald-1',
      link: '/shopify-seo.md',
    },
    {
      id: 'golive-checklist',
      title: 'Go-live checklist doorlopen',
      description: 'Testbestelling, checkout, e-mailnotificaties en Google Search Console.',
      status:
        paymentOk && giftCardsOk && shippingOk
          ? domainOk
            ? 'done'
            : 'in_progress'
          : 'todo',
      phase: 'golive',
      assignee: 'sam',
      priority: 'high',
      link: '/migratie/golive',
    },
    {
      id: 'wc-decommission',
      title: 'WooCommerce shop uitfaseren',
      description: 'Oude site op onderhoud, redirects valideren, WC hosting opzeggen.',
      status: 'todo',
      phase: 'golive',
      assignee: 'sam',
      priority: 'medium',
    },
  ]

  return tasks
}

export function getMigrationStatus(): MigrationStatus {
  const wcStats = getWcProductStats()
  const importStats = getImportStats(wcStats.total)

  const cliStatus = getShopifyCliStatus()

  const detect = {
    hasWcExport: fileExists('data/import/wc-export-latest.csv'),
    hasShopifyCsv: fileExists('data/import/shopify-products.csv'),
    hasRedirects: fileExists('shopify-redirects.csv'),
    hasCollectionsCsv: fileExists('data/import/shopify-collections.csv'),
    hasImportReport: importStats.hasImportReport,
    hasTheme: fileExists('SHOPIFY/sections/main-product.liquid'),
    hasImportScripts: fileExists('scripts/shopify-import-all.js'),
    hasApiApp: fileExists('.env') || fileExists('.env.example'),
    cliConnected: cliStatus.connected,
    importComplete: importStats.importComplete,
    importFailed: importStats.failed,
    lastImportAt: importStats.lastImportAt,
    hasRibbonUi: fileContains('SHOPIFY/sections/main-product.liquid', 'panel-ribbon'),
    hasCardUi: fileContains('SHOPIFY/sections/main-product.liquid', 'panel-card'),
    hasDealSection: fileContains('SHOPIFY/templates/index.json', '"deal"'),
    hasUspSection: fileContains('SHOPIFY/templates/index.json', '"usp"'),
    hasOrderPicker: fileExists('app/admin/order-picker/page.tsx'),
    collectionsAssigned: (() => {
      if (!fileExists('data/import/shopify-assign-collections-report.json')) return false
      try {
        const report = JSON.parse(
          fs.readFileSync(path.join(ROOT, 'data/import/shopify-assign-collections-report.json'), 'utf-8')
        )
        return report.finishedAt && report.assigned > 0
      } catch {
        return false
      }
    })(),
    hasBreadcrumbs: fileExists('SHOPIFY/snippets/breadcrumbs.liquid'),
    hasPageParity: fileExists('data/import/page-parity-report.json'),
    hubRedirectsFixed: (() => {
      try {
        const report = JSON.parse(
          fs.readFileSync(path.join(ROOT, 'data/import/shopify-redirects-report.json'), 'utf-8')
        )
        return report.method === 'fix-hubs' && report.updated >= 12
      } catch {
        return false
      }
    })(),
    hasProductLabels: fileExists('SHOPIFY/snippets/product-labels.liquid'),
    hasStructuredData: fileExists('SHOPIFY/snippets/structured-data.liquid'),
    hasTrackPage:
      fileExists('SHOPIFY/templates/page.track.json') ||
      fileExists('data/import/shopify-track-page-report.json'),
    hasUspTop: fileContains('SHOPIFY/templates/index.json', '"hero",\n    "usp"'),
    hasPackingSlipTemplate: fileExists('data/shopify/packing-slip-template.liquid'),
    hasCardEmoji: fileContains('SHOPIFY/sections/main-product.liquid', "emoji's zijn toegestaan"),
    collectionSeoImported: (() => {
      try {
        const report = JSON.parse(
          fs.readFileSync(path.join(ROOT, 'data/import/shopify-collection-seo-report.json'), 'utf-8')
        )
        return report.updated > 20 || report.finishedAt
      } catch {
        return false
      }
    })(),
    redirectSteekproefDone: (() => {
      try {
        const report = JSON.parse(
          fs.readFileSync(path.join(ROOT, 'data/import/redirect-steekproef-report.json'), 'utf-8')
        )
        return report.failed === 0 && report.passed > 0
      } catch {
        return false
      }
    })(),
    goliveAudit: readGoliveAudit(),
  }

  const baseStats: MigrationStats = {
    wcProducts: wcStats.total,
    wcProductsWithImages: wcStats.withImages,
    wcProductsWithoutImages: wcStats.withoutImages,
    shopifyImported: importStats.imported,
    shopifyPublished: importStats.published,
    shopifyFailed: importStats.failed,
    redirectCount: countCsvRows('shopify-redirects.csv'),
    collectionCount: countCsvRows('data/import/shopify-collections.csv'),
    shopifyStore: 'xn68xb-0f.myshopify.com',
    wcStore: 'bloemenvandegier.nl',
    lastImportAt: detect.lastImportAt,
  }

  let tasks = buildTasks(detect)
  let stats = baseStats

  if (shouldUseMigrationSnapshot()) {
    const snapshot = readMigrationSnapshot()!
    const overlaid = applySnapshotOverlay(tasks, stats, snapshot)
    tasks = overlaid.tasks
    stats = overlaid.stats
  }

  const doneCount = tasks.filter((task) => task.status === 'done').length
  const overallProgress = Math.round((doneCount / tasks.length) * 100)

  return {
    overallProgress,
    phases: PHASES,
    tasks,
    shopifyCli: getShopifyCliStatus(),
    stats,
    updatedAt: new Date().toISOString(),
  }
}

/** Live status voor afspraken-items met taskId */
export function getAgreementTaskStatus(
  tasks: MigrationTask[],
  taskId: string
): MigrationTaskStatus | undefined {
  const task = tasks.find((t) => t.id === taskId)
  return task?.status
}
