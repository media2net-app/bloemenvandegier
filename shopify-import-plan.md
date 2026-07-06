# Importplan: WooCommerce → Shopify

**Project:** Bloemen van De Gier  
**Datum:** juli 2026  
**Doel:** Alle producten volledig en correct importeren naar Shopify — **zonder cloud-tussenstap, zonder edge/serverless kosten**.

---

## Samenvatting

Geen Supabase nodig. Shopify wordt na migratie de source of truth voor producten.

| Stap | Waar | Wat |
|------|------|-----|
| 1. Export | WooCommerce admin | Verse product-CSV |
| 2. Transform | **MacBook (lokaal)** | WC CSV → Shopify CSV / JSONL |
| 3. Import | Shopify | Admin CSV import of Bulk API |
| 4. Redirects | Shopify | `shopify-redirects.csv` (al klaar) |

**Tussenopslag = je MacBook.** Bestanden in `data/import/` (gitignored). Geen database, geen cloud, geen kosten.

---

## Architectuur

```
┌─────────────────────┐
│  WooCommerce (oud)  │
│  bloemenvandegier.nl│
└──────────┬──────────┘
           │
           │  ① CSV export (handmatig, 1×)
           │  ② optioneel: REST API voor validatie
           ▼
┌─────────────────────┐
│   MacBook (lokaal)  │  ← tijdelijke opslag
│                     │
│  data/import/       │
│  ├── wc-export.csv  │
│  ├── products.json  │  (getransformeerd)
│  ├── shopify.csv    │  (klaar voor import)
│  ├── shopify.jsonl  │  (voor bulk API)
│  └── import-log.json│  (status per product)
└──────────┬──────────┘
           │
           │  npm run scripts (lokaal, gratis)
           ▼
┌─────────────────────┐
│  Shopify (nieuw)    │  ← source of truth na livegang
│  xn68xb-0f...       │
└─────────────────────┘
```

**Na livegang:** Shopify admin is het enige systeem voor producten. De lokale bestanden op je MacBook zijn een backup / audit trail — geen live koppeling nodig.

---

## Waarom geen Supabase?

| | Supabase | MacBook lokaal |
|--|----------|----------------|
| Kosten | €0–25/maand | €0 |
| Complexiteit | Schema, migrations, client setup | CSV/JSON bestanden |
| Nodig voor? | Live multi-user admin | Eenmalige migratie |
| Na migratie | Overbodig — Shopify is leading | Bestanden archiveren |

Supabase zou alleen zinvol zijn als je een **eigen admin panel** naast Shopify wilt. Dat is niet nodig — Shopify admin doet dat al.

---

## Huidige datakwaliteit

Gebaseerd op `lib/data/products.json` (vorige export):

| Metriek | Aantal | Actie nodig |
|---------|--------|-------------|
| Producten | 709 | Verse WC export |
| Unieke slugs | 657 | Varianten fixen |
| Zonder afbeelding | 227 | Lokaal scrapen |
| Met afbeelding (WP CDN) | 482 | OK zolang oude site online |
| Categorieën | 85 | Collecties in Shopify |
| Redirects | 1.944 | Al klaar (`shopify-redirects.csv`) |

**Data-problemen vóór import:**
1. Dubbele slugs (27× abonnementen) → WC export met `Type` + `Parent` kolommen
2. 227 zonder afbeelding → `scrape-all-missing-images.js` (lokaal)
3. Categorie-slugs niet altijd correct → matchen tegen live sitemap

---

## Twee importroutes

### Route A — CSV (aanbevolen om mee te starten)

```
WC CSV → parse-products.js → shopify-products.csv → Shopify Admin Import
```

| | |
|--|--|
| **Geschikt voor** | Eerste test (50 producten), simpele producten |
| **Moeilijk voor** | Complexe varianten (10/30/50 rozen) |
| **Kosten** | €0 |
| **Tijd** | 30 min setup + import |

### Route B — Bulk GraphQL API (volledige catalogus)

```
WC CSV → transform script → shopify-products.jsonl → Shopify Bulk Operations API
```

| | |
|--|--|
| **Geschikt voor** | Alle 709 producten + varianten in één keer |
| **Voordeel** | Geen rate limits, varianten correct |
| **Kosten** | €0 (draait lokaal) |
| **Tijd** | ~15 minuten import na voorbereiding |

**Aanbeveling:** Route A voor test (50 producten), Route B voor de rest.

---

## Fases

### Fase 0 — Voorbereiding (½ dag)

**0.1 Verse WooCommerce export**

WooCommerce Admin → Producten → Exporteren → **alle producten**

Kolommen die erin moeten zitten:
- ID, Naam, SKU, Type, Parent
- Beschrijving, Korte beschrijving
- Reguliere prijs, Actieprijs
- Categorieën, Tags, Afbeeldingen
- Op voorraad?, Voorraad
- Aangepaste URI (slug)
- Uitgelicht?, Gepubliceerd

Opslaan op MacBook:
```
data/import/wc-export-latest.csv
```

**0.2 Shopify app credentials**

Shopify Admin → Settings → Apps → Develop apps → Custom app

Scopes: `write_products`, `read_products`, `write_inventory`

In `.env.local` (niet committen):
```env
SHOPIFY_STORE=xn68xb-0f.myshopify.com
SHOPIFY_ADMIN_API_TOKEN=shpat_...
```

**0.3 Lokale mapstructuur**

```
data/import/          ← gitignored, alle import-bestanden
├── wc-export-latest.csv
├── products.json     ← getransformeerd uit WC
├── shopify-products.csv
├── shopify-products.jsonl
└── import-report.json
```

---

### Fase 1 — Data transformeren op MacBook (1–2 dagen)

**1.1 WC CSV → shopify-products.csv** ✅

```bash
npm run import:shopify-csv
# Leest data/import/wc-export-latest.csv
# Schrijft data/import/shopify-products.csv + import-report.json
```

Script: `scripts/wc-to-shopify-csv.js` — ondersteunt beschrijvingen (HTML), afbeeldingen, categorieën, tags en varianten.

**1.2 Afbeeldingen aanvullen (lokaal)**

```bash
npm run import:images
# 227 producten zonder afbeelding
# Scraped bloemenvandegier.nl met 500ms delay
# Schrijft terug naar data/import/products.json
```

**Niet via Vercel** — gebruikt bestaand `scrape-all-missing-images.js` patroon.

**1.3 Validatie-checklist**

- [ ] Alle producten geparsed?
- [ ] Varianten gegroepeerd onder parent?
- [ ] Geen dubbele handles op parent-niveau?
- [ ] ≥95% producten met afbeelding?
- [ ] Handles = WooCommerce slugs (voor redirects)?

---

### Fase 2 — Collections in Shopify (1 dag)

**85 collecties** aanmaken met handles gelijk aan WC slugs.

```bash
npm run import:collections
# Leest categories uit products.json
# Maakt Shopify collections via Admin API
# Slaat shopify_collection_id op in import-report.json
```

Of handmatig in Shopify Admin als fallback (85 stuks is overzichtelijk).

Per collectie meenemen:
- Titel + beschrijving (SEO-tekst van WC categoriepagina)
- Handle = WC slug (bijv. `tulpen-boeketten`)

---

### Fase 3 — Producten importeren (1–2 dagen)

**Stap 1 — Test (50 producten via CSV)**

```bash
npm run import:shopify-csv -- --limit 50
# → data/import/shopify-products-test.csv
```

Shopify Admin → Producten → Importeren → upload CSV → controleer resultaat.

**Stap 2 — Volledige import (Bulk API)**

```bash
npm run import:shopify-bulk
# → data/import/shopify-products.jsonl
# → stagedUploadsCreate → upload → bulkOperationRunMutation
# → resultaat in import-report.json
```

Shopify CSV kolommen (Route A):

| Shopify kolom | Bron |
|---------------|------|
| Handle | slug |
| Title | name |
| Body (HTML) | description |
| Vendor | Bloemen van De Gier |
| Tags | categorie-namen |
| Published | true/false |
| Variant Price | price |
| Variant Compare At Price | regular_price (bij sale) |
| Variant SKU | sku |
| Variant Inventory Qty | stock_quantity |
| Image Src | images[].src |
| Collection | categorie-slug |

**Afbeeldingen:** Shopify downloadt van de URL bij import. WP URLs (`bloemenvandegier.nl/wp-content/uploads/...`) werken zolang de oude site online blijft.

---

### Fase 4 — Verificatie & livegang (1 dag)

**4.1 Redirects importeren**

`shopify-redirects.csv` (1.944 stuks, al klaar):
```
Shopify Admin → Online Store → Navigation → URL Redirects → Import
```

**4.2 Steekproef (20 producten + 10 categorieën)**

| Check | |
|-------|---|
| Redirect 301 werkt | `/product-categorie/tulpen-boeketten/` → `/collections/tulpen-boeketten` |
| Productpagina | Titel, prijs, beschrijving, afbeeldingen |
| Collectie | Juiste producten |
| Varianten | 10/30/50 rozen prijsopties |
| Uitverkocht | Sold out, niet bestelbaar |
| SEO | Title, meta, canonical |

**4.3 Volledigheid**

```bash
npm run import:verify
# Vergelijkt WC sitemap vs Shopify product count
# Logt ontbrekende producten in import-report.json
```

---

## Kostenbeheersing

Alles draait op je MacBook — **€0 importkosten**.

| Wat | Waar | Kosten |
|-----|------|--------|
| WC CSV export | WooCommerce admin | €0 |
| Data transform | MacBook CLI | €0 |
| Image scrape | MacBook CLI | €0 |
| Shopify import | Bulk API (lokaal) | €0 |
| Redirects | Shopify admin | €0 |
| Vercel / Edge | **Niet gebruiken voor import** | €0 |

### Wat je niet moet doen

- ❌ Producten importeren via Next.js `/api/` routes
- ❌ WooCommerce API pagineren vanuit Vercel (`/api/omzet-oude-shop?refresh=true`)
- ❌ Image scraping via `/api/scrape/website` in een loop
- ❌ Shopify REST API per product (rate limits)
- ❌ Supabase of andere cloud DB als tussenstap

---

## Scripts die we bouwen

| Script | Commando | Output |
|--------|----------|--------|
| WC parser | `npm run import:parse` | `data/import/products.json` |
| Images | `npm run import:images` | bijgewerkte `products.json` |
| Shopify CSV | `npm run import:shopify-csv` | `shopify-products.csv` |
| Collections | `npm run import:collections` | collections in Shopify |
| Bulk import | `npm run import:shopify-bulk` | producten in Shopify |
| Verificatie | `npm run import:verify` | `import-report.json` |

Bestaande scripts die we hergebruiken:
- `scripts/parse-products.js` — basis WC parser
- `scripts/scrape-all-missing-images.js` — image scraping
- `scripts/generate-shopify-redirects.js` — redirects (klaar)

---

## Tijdlijn

| Fase | Duur |
|------|------|
| 0 — Voorbereiding (WC export + Shopify app) | ½ dag |
| 1 — Transform + images op MacBook | 1–2 dagen |
| 2 — Collections in Shopify | 1 dag |
| 3 — Producten importeren | 1–2 dagen |
| 4 — Verificatie + redirects + livegang | 1 dag |
| **Totaal** | **~1 week** |

Plan livegang niet vlak voor Moederdag, Valentijn of Kerst.

---

## Beslispunten voor Sam

| # | Vraag | Aanbeveling |
|---|-------|-------------|
| 1 | Wanneer livegang? | Na seizoenspiek |
| 2 | Oude WC site online houden? | Ja, tot images geïmporteerd zijn |
| 3 | Uitverkochte producten importeren? | Ja, als "sold out" (SEO) |
| 4 | Reviews meenemen? | Nee — huidige ratings zijn demo-data |
| 5 | Abonnementen (27 varianten)? | Apart bespreken |

---

## Volgende stap

1. Sam akkoord op dit plan
2. Verse WooCommerce CSV exporteren → `data/import/wc-export-latest.csv`
3. Ik bouw de import-scripts (start met `import:parse` + `import:shopify-csv`)
