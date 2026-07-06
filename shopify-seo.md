# SEO & URL-structuur: migratie WooCommerce → Shopify

**Project:** Bloemen van De Gier  
**Huidige site:** [bloemenvandegier.nl](https://www.bloemenvandegier.nl/) (WooCommerce)  
**Nieuwe site:** [xn68xb-0f.myshopify.com](https://xn68xb-0f.myshopify.com/) (Shopify)  
**Datum:** juli 2026  
**Doel:** Besluitvorming over URL-structuur en SEO-impact bij de overstap

---

## Samenvatting

Bij de migratie naar Shopify veranderen de URL-prefixes van categorieën en producten. Dit is **normaal** en gebeurt bij vrijwel elke Shopify-migratie. Het is **niet mogelijk** om de WooCommerce-structuur (`/product-categorie/`) te behouden op standaard Shopify.

**Aanbeveling:** Accepteer de Shopify URL-structuur, houd de slugs (het deel na het prefix) identiek aan WooCommerce, en zet **301-redirects** op alle oude URLs. Daarmee behoud je het merendeel van je SEO-waarde.

| | WooCommerce (nu) | Shopify (straks) |
|---|---|---|
| Categorie | `/product-categorie/tulpen-boeketten/` | `/collections/tulpen-boeketten` |
| Product | `/product/rode-rozen/` | `/products/rode-rozen` |
| Pagina | `/onze-bloemenwinkel/` | `/pages/onze-bloemenwinkel` |
| Blog | `/blog/artikel-titel/` | `/blogs/nieuws/artikel-titel` |

**Schaal van de migratie (indicatie):**
- ~85 categorieën
- ~709 producten
- Plus statische pagina's, blogartikelen en seizoenspagina's

---

## De kernvraag: kunnen we `/product-categorie/` behouden?

**Nee.** Shopify dwingt vaste URL-prefixes af die niet aan te passen zijn:

| Prefix | Aanpasbaar? |
|---|---|
| `/collections/` | Nee — vast |
| `/products/` | Nee — vast |
| `/pages/` | Nee — vast |
| `/blogs/` | Alleen blog-naam, niet het prefix |

Dit geldt voor alle Shopify-winkels, inclusief Shopify Plus. Het is een architectuurbeslissing van Shopify (Ruby on Rails routing), geen thema- of instellingenprobleem.

### Wat wél kan

- **Handles (slugs) aanpassen** — het deel na het prefix, bijv. `tulpen-boeketten`
- **301-redirects** — oude URL automatisch doorsturen naar nieuwe URL
- **SEO-metadata** — titel, beschrijving en canonical per collectie/product instellen

### Wat technisch mogelijk is maar niet aanbevolen

| Optie | Complexiteit | Aanbeveling |
|---|---|---|
| Headless storefront (eigen frontend) | Zeer hoog | Niet nodig voor deze migratie |
| Cloudflare Workers / reverse proxy | Hoog, doorlopend onderhoud | Niet aanbevolen |
| Shopify-apps voor URL-rewriting | Beperkt, onbetrouwbaar | Vermijden |

---

## SEO-impact: hoe erg is dit?

### Kort antwoord: beheersbaar

Google indexeert `/collections/` en `/products/` prima. Miljoenen Shopify-winkels gebruiken deze structuur. Het prefix zelf is **geen rankingfactor**. Wat wél telt:

1. **301-redirects** op elke oude URL
2. **Identieke of vergelijkbare slugs** (handles)
3. **Behoud van content** (titels, beschrijvingen, afbeeldingen)
4. **Interne links** bijwerken naar nieuwe URLs
5. **Sitemap opnieuw indienen** in Google Search Console

### Verwachte impact

| Periode | Verwachting |
|---|---|
| Week 1–4 na livegang | Tijdelijke schommeling in rankings (normaal bij migratie) |
| Maand 2–3 | Herstel naar vergelijkbaar niveau bij goede redirects |
| Maand 3+ | Stabiel, mits content en techniek op orde |

### Risico's bij géén goede redirects

- 404-fouten op geïndexeerde pagina's
- Verlies van backlinks (externe sites linken naar oude URLs)
- Dalende posities op belangrijke zoektermen zoals "tulpen kopen", "rozen bezorgen"

---

## Concrete voorbeelden

### Categorieën

| WooCommerce (oud) | Shopify (nieuw) |
|---|---|
| `bloemenvandegier.nl/product-categorie/tulpen-boeketten/` | `bloemenvandegier.nl/collections/tulpen-boeketten` |
| `bloemenvandegier.nl/product-categorie/rozen/` | `bloemenvandegier.nl/collections/rozen` |
| `bloemenvandegier.nl/product-categorie/alle-boeketten/` | `bloemenvandegier.nl/collections/alle-boeketten` |
| `bloemenvandegier.nl/product-categorie/groen-decoratief/` | `bloemenvandegier.nl/collections/groen-decoratief` |

### Producten

| WooCommerce (oud) | Shopify (nieuw) |
|---|---|
| `bloemenvandegier.nl/product/rode-rozen/` | `bloemenvandegier.nl/products/rode-rozen` |
| `bloemenvandegier.nl/product/50-tulpen-verrassingskleur/` | `bloemenvandegier.nl/products/50-tulpen-verrassingskleur` |

### Geneste WooCommerce-categorieën

WooCommerce ondersteunt subcategorieën in de URL, bijvoorbeeld:
`bloemenvandegier.nl/product-categorie/kerst/kerstgroen/`

Shopify heeft **geen echte subcategorie-URLs**. Oplossingen:
- Aparte collectie aanmaken met handle `kerst-kerstgroen` (zoals nu al in de data staat)
- Redirect van oude geneste URL naar platte collectie-URL
- Hiërarchie tonen via menu/navigatie, niet via URL-pad

---

## Migratieplan: redirects

### Stap 1 — Inventarisatie

Exporteer alle bestaande URLs uit WooCommerce:
- Alle categorie-URLs (`/product-categorie/...`)
- Alle product-URLs (`/product/...`)
- Statische pagina's
- Blogartikelen
- Eventuele landingspagina's (seizoenen, campagnes)

### Stap 2 — Mapping

Maak een spreadsheet met twee kolommen:

```
Oude URL                                          →  Nieuwe URL
/product-categorie/tulpen-boeketten/              →  /collections/tulpen-boeketten
/product-categorie/tulpen-boeketten               →  /collections/tulpen-boeketten
/product/rode-rozen/                              →  /products/rode-rozen
/product/rode-rozen                               →  /products/rode-rozen
```

**Let op:** redirect zowel mét als zonder trailing slash (`/`).

### Stap 3 — Importeren in Shopify

Via **Shopify Admin → Online Store → Navigation → URL Redirects**:
- Handmatig voor kleine aantallen
- CSV bulk-import voor grote aantallen (~800+ redirects verwacht)

CSV-formaat:
```csv
Redirect from,Redirect to
/product-categorie/tulpen-boeketten/,/collections/tulpen-boeketten
/product-categorie/rozen/,/collections/rozen
/product/rode-rozen/,/products/rode-rozen
```

### Stap 4 — Testen vóór livegang

- Steekproef van 20–30 belangrijke URLs (top categorieën + bestsellers)
- Controleer dat elke oude URL een 301 geeft naar de juiste nieuwe pagina
- Geen 404's, geen redirect chains (A → B → C)

### Stap 5 — Na livegang

1. **Google Search Console:** nieuwe sitemap indienen (`bloemenvandegier.nl/sitemap.xml`)
2. **Bing Webmaster Tools:** idem
3. **Monitoring:** 4–6 weken rankings en crawl errors volgen
4. **Backlinks:** waar mogelijk externe links laten bijwerken (niet urgent dankzij 301's)

---

## Overige SEO-aandachtspunten bij migratie

### Content & metadata

| Element | Actie |
|---|---|
| Paginatitels (title tags) | Overnemen uit WooCommerce, per collectie/product controleren |
| Meta descriptions | Overnemen en optimaliseren |
| H1-koppen | Behouden (bijv. "Tulpen" op categoriepagina) |
| Categorie-teksten | SEO-teksten onder producten overzetten (nu aanwezig op WooCommerce) |
| Alt-teksten afbeeldingen | Meenemen bij productimport |
| Productbeschrijvingen | Volledig overzetten inclusief HTML |

### Technisch

| Element | Shopify-status |
|---|---|
| Canonical tags | Automatisch door Shopify |
| Structured data (Product, BreadcrumbList) | Thema moet dit ondersteunen — controleren |
| Sitemap | Automatisch gegenereerd |
| robots.txt | Standaard OK, controleren na livegang |
| HTTPS | Via Shopify + custom domain |
| Paginasnelheid | Shopify CDN is doorgaans sneller dan WooCommerce |
| Trailing slashes | Shopify redirect automatisch (zonder slash is canonical) |

### Duplicate content

Shopify kan producten via meerdere paden bereikbaar maken:
- `/products/rode-rozen`
- `/collections/rozen/products/rode-rozen`

**Oplossing:** Canonical wijst altijd naar `/products/...`. Interne links in het thema moeten naar de korte product-URL linken, niet via collectie-context.

### Belangrijke landingspagina's

Controleer apart (veel organisch verkeer):
- Homepage
- Top 10 categorieën (rozen, boeketten, tulpen, groen & decoratief)
- Top 20 producten (bestsellers)
- Seizoenspagina's (Moederdag, Valentijn, Kerst)
- "Onze bloemenwinkel" (lokale SEO)

---

## Checklist voor besluitvorming

### Besluiten die nodig zijn

- [ ] **Accepteren** dat URL-prefixes veranderen (`/product-categorie/` → `/collections/`)
- [ ] **Budget/tijd** voor redirect-import en SEO-controle na livegang
- [ ] **Timing livegang** — bij voorkeur buiten piekseizoen (niet vlak voor Moederdag/Valentijn/Kerst)
- [ ] **Wie monitort** rankings de eerste 6 weken na livegang?

### Wat wij kunnen leveren

- [x] Volledige redirect-CSV gegenereerd: `shopify-redirects.csv` (1.944 redirects, zie `shopify-redirects-README.md`)
- [ ] Handles in Shopify gelijk trekken met WooCommerce-slugs
- [ ] SEO-teksten op categoriepagina's overzetten
- [ ] Steekproef-testen van redirects vóór en na livegang
- [ ] Search Console setup en sitemap-indiening

---

## Veelgestelde vragen

**Kunnen we `/collections/` verbergen of weghalen?**  
Nee, dit is een vaste Shopify-beperking.

**Verliezen we onze Google-rankings?**  
Tijdelijk kunnen posities schommelen. Met correcte 301-redirects en behoud van content herstelt dit doorgaans binnen 2–3 maanden.

**Moeten we backlinks laten aanpassen?**  
Niet urgent. 301-redirects geven 90–99% van de linkwaarde door. Op termijn is bijwerken wel netter.

**Is Shopify slechter voor SEO dan WooCommerce?**  
Nee. Shopify scoort goed op snelheid, HTTPS en structured data. De URL-prefix is geen nadeel. WooCommerce biedt meer URL-flexibiliteit, maar dat voordeel weegt niet op tegen de andere Shopify-voordelen (snelheid, betrouwbaarheid, checkout).

**Wat als we later toch custom URLs willen?**  
Alleen met een headless setup (eigen frontend). Dat is een groot en duur project — niet zinvol puur voor URL-structuur.

---

## Conclusie & aanbeveling

| | |
|---|---|
| **Besluit** | Shopify URL-structuur accepteren |
| **Prioriteit 1** | 301-redirects op alle oude URLs |
| **Prioriteit 2** | Identieke slugs behouden |
| **Prioriteit 3** | SEO-content en metadata overzetten |
| **Niet doen** | Proberen `/product-categorie/` te behouden via workarounds |

De URL-wijziging is een eenmalige migratie-uitdaging, geen structureel SEO-nadeel. Met een goed redirect-plan is de impact beheersbaar en tijdelijk.

---

*Vragen of opmerkingen? Bespreekbaar in een vervolggesprek.*
