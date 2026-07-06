#!/usr/bin/env node
/**
 * Genereert shopify-redirects.csv voor WooCommerce → Shopify migratie.
 * Bronnen: live WooCommerce sitemaps + lokale categories/products data.
 *
 * Usage: node scripts/generate-shopify-redirects.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BLOG_HANDLE = 'nieuws';

const PAGE_MAPPINGS = {
  '/': '/',
  '/shop/': '/collections/all',
  '/webshop/': '/collections/all',
  '/checkout/': '/cart',
  '/bloemenmand/': '/cart',
  '/bloemenmand-2/': '/cart',
  '/mijn-account/': '/account',
  '/winkelwagen/': '/cart',
  '/cart/': '/cart',
  '/home/': '/',
  '/zakelijk/': '/pages/zakelijk-bloemen-bestellen',
  '/zakelijk': '/pages/zakelijk-bloemen-bestellen',
  '/blog/': `/blogs/${BLOG_HANDLE}`,
  '/blog': `/blogs/${BLOG_HANDLE}`,
};

// WordPress-overzichtspagina's met keuzeblokken: altijd /pages/ ook bij slug-collision met collectie
const PAGE_OVERVIEW_SLUGS = new Set([
  'alle-groen-decoratief',
  'bloemenbundels',
  'bloemenpakketten',
  'bruiloft-bundels',
  'droogbloemen',
  'groen-decoratief',
  'herfstbloemen',
  'moederdag-cadeau',
  'olijfbomen',
  'pasen',
  'voorjaarsbloemen',
  'weekdeals',
]);

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetch(res.headers.location).then(resolve).catch(reject);
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function addRedirect(redirects, from, to) {
  if (!from || !to || from === to) return;

  const normalizedFrom = from.startsWith('/') ? from : `/${from}`;
  const normalizedTo = to.startsWith('/') ? to : `/${to}`;

  redirects.set(normalizedFrom, normalizedTo);

  if (normalizedFrom.endsWith('/') && normalizedFrom.length > 1) {
    redirects.set(normalizedFrom.slice(0, -1), normalizedTo);
  } else if (!normalizedFrom.endsWith('/')) {
    redirects.set(`${normalizedFrom}/`, normalizedTo);
  }
}

async function main() {
  const categories = require(path.join(ROOT, 'lib/data/categories.json'));
  const products = require(path.join(ROOT, 'lib/data/products.json'));
  const categorySlugs = new Set(categories.map((c) => c.slug));
  const redirects = new Map();
  const categoryOverlapPages = [];

  function categoryPathToHandle(catPath) {
    if (categorySlugs.has(catPath)) return catPath;
    const hyphenated = catPath.replace(/\//g, '-');
    if (categorySlugs.has(hyphenated)) return hyphenated;
    const last = catPath.split('/').pop();
    if (categorySlugs.has(last)) return last;
    return catPath.replace(/\//g, '-');
  }

  function pageToShopify(slug) {
    if (PAGE_OVERVIEW_SLUGS.has(slug)) return `/pages/${slug}`;
    if (categorySlugs.has(slug)) return `/collections/${slug}`;
    return `/pages/${slug}`;
  }

  for (const cat of categories) {
    addRedirect(redirects, `/product-categorie/${cat.slug}/`, `/collections/${cat.slug}`);
  }

  const catXml = await fetch('https://www.bloemenvandegier.nl/product_cat-sitemap.xml');
  for (const url of extractLocs(catXml)) {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/^\/product-categorie\/(.+?)\/?$/);
    if (!match) continue;
    addRedirect(redirects, pathname, `/collections/${categoryPathToHandle(match[1])}`);
  }

  const productsJson = fs.readFileSync(path.join(ROOT, 'lib/data/products.json'), 'utf8');
  const nestedPattern = /https?:\/\/www\.bloemenvandegier\.nl\/product-categorie\/([a-z0-9\-\/]+)\/?/gi;
  let nestedMatch;
  while ((nestedMatch = nestedPattern.exec(productsJson)) !== null) {
    const catPath = nestedMatch[1].replace(/\/$/, '');
    addRedirect(redirects, `/product-categorie/${catPath}/`, `/collections/${categoryPathToHandle(catPath)}`);
  }

  for (const product of products) {
    addRedirect(redirects, product.permalink, `/products/${product.slug}`);
  }

  const prodXml = await fetch('https://www.bloemenvandegier.nl/product-sitemap.xml');
  for (const url of extractLocs(prodXml)) {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/^\/product\/(.+?)\/?$/);
    if (!match) continue;
    addRedirect(redirects, pathname, `/products/${match[1]}`);
  }

  const pageXml = await fetch('https://www.bloemenvandegier.nl/page-sitemap.xml');
  for (const url of extractLocs(pageXml)) {
    const pathname = new URL(url).pathname;
    if (PAGE_MAPPINGS[pathname]) {
      addRedirect(redirects, pathname, PAGE_MAPPINGS[pathname]);
      continue;
    }
    const match = pathname.match(/^\/([^/]+)\/?$/);
    if (!match) continue;
    const slug = match[1];
    if (categorySlugs.has(slug)) categoryOverlapPages.push(slug);
    addRedirect(redirects, pathname, pageToShopify(slug));
  }

  const postXml = await fetch('https://www.bloemenvandegier.nl/post-sitemap.xml');
  for (const url of extractLocs(postXml)) {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/^\/([^/]+)\/?$/);
    if (!match) continue;
    addRedirect(redirects, pathname, `/blogs/${BLOG_HANDLE}/${match[1]}`);
  }

  const catBlogXml = await fetch('https://www.bloemenvandegier.nl/category-sitemap.xml');
  for (const url of extractLocs(catBlogXml)) {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/^\/category\/(.+?)\/?$/);
    if (!match) continue;
    addRedirect(redirects, pathname, `/blogs/${BLOG_HANDLE}/tagged/${match[1]}`);
  }

  const sorted = [...redirects.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const rows = [['Redirect from', 'Redirect to'], ...sorted];
  const csv = rows.map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');

  fs.writeFileSync(path.join(ROOT, 'shopify-redirects.csv'), `${csv}\n`);

  const stats = {
    total: sorted.length,
    categories: sorted.filter(([from]) => from.includes('product-categorie')).length,
    products: sorted.filter(([from]) => from.startsWith('/product/')).length,
    blogs: sorted.filter(([, to]) => to.startsWith('/blogs/')).length,
    pages: sorted.filter(
      ([from, to]) =>
        !from.includes('product-categorie') &&
        !from.startsWith('/product/') &&
        !to.startsWith('/blogs/')
    ).length,
    categoryOverlapPages: [...new Set(categoryOverlapPages)].sort(),
  };

  const readme = `# Shopify Redirects

Gegenereerd: ${new Date().toISOString().split('T')[0]}

## Statistieken

| Type | Aantal redirects |
|------|-----------------|
| Totaal | ${stats.total} |
| Categorieën (\`/product-categorie/\`) | ${stats.categories} |
| Producten (\`/product/\`) | ${stats.products} |
| Pagina's & overig | ${stats.pages} |
| Blog | ${stats.blogs} |

## Bronnen

- WooCommerce sitemaps (live): product_cat, product, page, post, category
- Lokale data: \`lib/data/categories.json\` (85 categorieën), \`lib/data/products.json\` (709 producten)
- Geneste categorie-URLs uit productbeschrijvingen (bijv. \`/product-categorie/kerst/kerstgroen/\`)

## Importeren in Shopify

1. Shopify Admin → **Online Store** → **Navigation** → **URL Redirects**
2. Klik **Import** en upload \`shopify-redirects.csv\`
3. Test een steekproef van 20–30 belangrijke URLs

## Aandachtspunten

### Blog handle
Blogposts redirecten naar \`/blogs/${BLOG_HANDLE}/{slug}\`. Pas dit aan als de blog in Shopify een andere handle krijgt.

### Pagina's die overlappen met collecties
Deze slugs bestaan zowel als WordPress-pagina als collectie. Overzichtspagina's met keuzeblokken redirecten naar \`/pages/\`; overige naar \`/collections/\`:

${stats.categoryOverlapPages
  .map((s) => {
    const target = PAGE_OVERVIEW_SLUGS.has(s) ? `/pages/${s}` : `/collections/${s}`;
    return `- \`/${s}/\` → \`${target}\``;
  })
  .join('\n')}

### Vaste mappings
| Oud | Nieuw |
|-----|-------|
| \`/shop/\`, \`/webshop/\` | \`/collections/all\` |
| \`/bloemenmand/\` | \`/cart\` |
| \`/mijn-account/\` | \`/account\` |
| \`/checkout/\` | \`/cart\` |

### Opnieuw genereren
\`\`\`bash
node scripts/generate-shopify-redirects.js
\`\`\`
`;

  fs.writeFileSync(path.join(ROOT, 'shopify-redirects-README.md'), readme);

  console.log('shopify-redirects.csv geschreven');
  console.log(JSON.stringify(stats, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
