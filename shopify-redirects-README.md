# Shopify Redirects

Gegenereerd: 2026-07-04

## Statistieken

| Type | Aantal redirects |
|------|-----------------|
| Totaal | 1944 |
| Categorieën (`/product-categorie/`) | 222 |
| Producten (`/product/`) | 1330 |
| Pagina's & overig | 370 |
| Blog | 22 |

## Bronnen

- WooCommerce sitemaps (live): product_cat, product, page, post, category
- Lokale data: `lib/data/categories.json` (85 categorieën), `lib/data/products.json` (709 producten)
- Geneste categorie-URLs uit productbeschrijvingen (bijv. `/product-categorie/kerst/kerstgroen/`)

## Importeren in Shopify

1. Shopify Admin → **Online Store** → **Navigation** → **URL Redirects**
2. Klik **Import** en upload `shopify-redirects.csv`
3. Test een steekproef van 20–30 belangrijke URLs

## Aandachtspunten

### Blog handle
Blogposts redirecten naar `/blogs/nieuws/{slug}`. Pas dit aan als de blog in Shopify een andere handle krijgt.

### Pagina's die overlappen met collecties
Deze slugs bestaan zowel als WordPress-pagina als collectie. Overzichtspagina's met keuzeblokken redirecten naar `/pages/`; overige naar `/collections/`:

- `/alle-groen-decoratief/` → `/pages/alle-groen-decoratief`
- `/bloemenbundels/` → `/pages/bloemenbundels`
- `/bloemenpakketten/` → `/pages/bloemenpakketten`
- `/bruiloft-bundels/` → `/pages/bruiloft-bundels`
- `/droogbloemen/` → `/pages/droogbloemen`
- `/groen-decoratief/` → `/pages/groen-decoratief`
- `/herfstbloemen/` → `/pages/herfstbloemen`
- `/moederdag-cadeau/` → `/pages/moederdag-cadeau`
- `/olijfbomen/` → `/pages/olijfbomen`
- `/pasen/` → `/pages/pasen`
- `/voorjaarsbloemen/` → `/pages/voorjaarsbloemen`
- `/weekdeals/` → `/pages/weekdeals`

### Vaste mappings
| Oud | Nieuw |
|-----|-------|
| `/shop/`, `/webshop/` | `/collections/all` |
| `/bloemenmand/` | `/cart` |
| `/mijn-account/` | `/account` |
| `/checkout/` | `/cart` |

### Opnieuw genereren
```bash
node scripts/generate-shopify-redirects.js
```
