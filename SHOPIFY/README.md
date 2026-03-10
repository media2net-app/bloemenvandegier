# Bloemen van De Gier – Shopify Theme

Shopify-thema met layout en styling overgenomen van het originele Next.js project. Alleen layout; geen WooCommerce/API-integratie.

## Uploaden naar Shopify

1. **ZIP het thema**: Maak een ZIP van de inhoud van de map `SHOPIFY` (niet de SHOPIFY-map zelf). Alle bestanden moeten in de root van de ZIP staan.
2. **Shopify Admin** → Online Store → Themes → Add theme → Upload ZIP file

## Structuur

```
SHOPIFY/
├── layout/
│   └── theme.liquid          # Hoofdlayout
├── sections/
│   ├── header.liquid
│   ├── footer.liquid
│   ├── trust-bar.liquid
│   ├── hero.liquid
│   ├── usp.liquid
│   ├── main-product.liquid
│   ├── main-collection.liquid
│   ├── main-cart.liquid
│   ├── main-page.liquid
│   └── main-404.liquid
├── snippets/
│   └── pagination.liquid
├── templates/
│   ├── index.json            # Homepage (hero + usp)
│   ├── product.json
│   ├── collection.json
│   ├── cart.json
│   ├── page.json
│   └── 404.json
├── assets/
│   ├── theme.css
│   └── theme.js
├── config/
│   ├── settings_schema.json
│   └── settings_data.json
└── locales/
    ├── nl.json
    └── en.json
```

## Design

- **Kleuren**: Primary green (#356443), accent amber (#f59e0b)
- **Fonts**: Inter, Playfair Display (Google Fonts)
