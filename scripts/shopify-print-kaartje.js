#!/usr/bin/env node
/**
 * Genereer een printbaar HTML-bestand met kaartje(s) voor een order.
 * Geen Shopify-app nodig — open het bestand in de browser en print.
 *
 * Usage:
 *   node --env-file=.env scripts/shopify-print-kaartje.js --order 1001
 *   node --env-file=.env scripts/shopify-print-kaartje.js --order 1001 --open
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql } = require('./lib/shopify-client')

const ROOT = path.join(__dirname, '..')
const PRINTS_DIR = path.join(ROOT, 'data/import/prints')

const orderArg = process.argv.find((a) => a.startsWith('--order='))
  ? process.argv.find((a) => a.startsWith('--order=')).split('=')[1]
  : process.argv[process.argv.indexOf('--order') + 1]

const shouldOpen = process.argv.includes('--open')

if (!orderArg) {
  console.error('Gebruik: node --env-file=.env scripts/shopify-print-kaartje.js --order 1001')
  process.exit(1)
}

const orderName = orderArg.startsWith('#') ? orderArg : `#${orderArg}`

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildHtml(order, shopName) {
  const cards = []

  for (const item of order.lineItems?.nodes || []) {
    const attrs = Object.fromEntries(
      (item.customAttributes || []).map((a) => [a.key, a.value])
    )
    const cardText = attrs.Kaartje || attrs.kaartje
    if (!cardText) continue

    cards.push({
      text: cardText,
      ribbonColor: attrs['Lint kleur'] || '',
      ribbonText: attrs['Lint tekst'] || '',
      product: item.title,
      variant: item.variantTitle,
    })
  }

  const ship = order.shippingAddress || {}

  const cardHtml =
    cards.length === 0
      ? `<div class="no-cards"><h1>Geen kaartje bij ${escapeHtml(order.name)}</h1></div>`
      : cards
          .map(
            (c) => `
    <div class="card-sheet">
      <div class="card-frame">
        <div class="card-header">
          <span class="card-logo">${escapeHtml(shopName)}</span>
          <span class="card-order">${escapeHtml(order.name)}</span>
        </div>
        <div class="card-body"><p class="card-message">${escapeHtml(c.text)}</p></div>
        <div class="card-footer">
          <p class="card-product">${escapeHtml(c.product)}${c.variant && c.variant !== 'Default Title' ? ` — ${escapeHtml(c.variant)}` : ''}</p>
          ${c.ribbonColor || c.ribbonText ? `<p class="card-ribbon">Lint: ${escapeHtml(c.ribbonColor)}${c.ribbonText ? ` — "${escapeHtml(c.ribbonText)}"` : ''}</p>` : ''}
          <p class="card-ship">Voor: ${escapeHtml(ship.name || '')}, ${escapeHtml(ship.city || '')}</p>
        </div>
      </div>
    </div>`
          )
          .join('\n')

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <title>Kaartje ${escapeHtml(order.name)}</title>
  <style>
    @page { size: A6 portrait; margin: 8mm; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 10mm; font-family: Georgia, serif; background: #f3f4f6; }
    .card-sheet { width: 105mm; min-height: 148mm; margin: 0 auto 10mm; page-break-after: always; display: flex; align-items: center; justify-content: center; }
    .card-frame { width: 100%; min-height: 130mm; border: 1.5px solid #d1d5db; border-radius: 4mm; padding: 8mm 10mm; background: #fff; display: flex; flex-direction: column; }
    .card-header { display: flex; justify-content: space-between; font-family: Arial, sans-serif; font-size: 9pt; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding-bottom: 4mm; margin-bottom: 6mm; }
    .card-logo { font-weight: 600; color: #059669; text-transform: uppercase; font-size: 8pt; }
    .card-body { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; }
    .card-message { margin: 0; font-size: 14pt; line-height: 1.55; white-space: pre-wrap; }
    .card-footer { border-top: 1px solid #e5e7eb; padding-top: 4mm; font-family: Arial, sans-serif; font-size: 7.5pt; color: #6b7280; }
    .card-footer p { margin: 0 0 2mm; }
    .no-cards { text-align: center; padding: 40mm; font-family: Arial, sans-serif; }
    @media print { body { background: #fff; padding: 0; } .card-sheet { margin: 0 auto; } }
  </style>
</head>
<body>
${cardHtml}
<script>window.addEventListener('load', () => { /* window.print() */ })</script>
</body>
</html>`
}

async function main() {
  const credentials = await getCredentials()

  const data = await shopifyGraphql(
    `query($query: String!) {
      orders(first: 1, query: $query) {
        nodes {
          id name
          shippingAddress { name city }
          lineItems(first: 20) {
            nodes {
              title
              variantTitle
              customAttributes { key value }
            }
          }
        }
      }
      shop { name }
    }`,
    { query: `name:${orderName}` },
    credentials
  )

  const order = data.orders?.nodes?.[0]
  if (!order) {
    throw new Error(`Order ${orderName} niet gevonden`)
  }

  const html = buildHtml(order, data.shop.name)
  const fileName = `kaartje-${orderName.replace('#', '')}.html`
  fs.mkdirSync(PRINTS_DIR, { recursive: true })
  const filePath = path.join(PRINTS_DIR, fileName)
  fs.writeFileSync(filePath, html)

  const cardCount = (order.lineItems?.nodes || []).filter((item) =>
    item.customAttributes?.some((a) => a.key?.toLowerCase().includes('kaartje') && a.value)
  ).length

  console.log(`Kaartje(s) gegenereerd: ${cardCount}`)
  console.log(`Bestand: ${filePath}`)
  console.log('Open in browser → Cmd+P om te printen')

  if (shouldOpen) {
    try {
      execSync(`open "${filePath}"`)
    } catch {
      // ignore on non-mac
    }
  }
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
