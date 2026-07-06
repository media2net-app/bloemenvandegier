#!/usr/bin/env node
/**
 * Controleer go-live readiness: betalingen, gift cards, verzending, domein.
 *
 * Usage:
 *   node --env-file=.env scripts/shopify-golive-audit.js
 */

const fs = require('fs')
const path = require('path')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql } = require('./lib/shopify-client')

const ROOT = path.join(__dirname, '..')
const REPORT = path.join(ROOT, 'data/import/shopify-golive-audit.json')

async function main() {
  const credentials = await getCredentials()

  const data = await shopifyGraphql(
    `query {
      shop {
        name
        myshopifyDomain
        currencyCode
        primaryDomain { host url sslEnabled }
        features { giftCards }
        plan { displayName }
      }
      deliveryProfiles(first: 10) {
        nodes {
          name
          profileLocationGroups {
            locationGroupZones(first: 10) {
              nodes {
                zone {
                  name
                  countries { code { countryCode } name }
                }
                methodDefinitions(first: 10) {
                  nodes { name active rateProvider { __typename } }
                }
              }
            }
          }
        }
      }
      shopifyPaymentsAccount {
        activated
        country
      }
    }`,
    {},
    credentials
  )

  const shop = data.shop
  const payments = data.shopifyPaymentsAccount
  const profiles = data.deliveryProfiles?.nodes || []

  const countries = new Set()
  let shippingMethods = 0
  for (const profile of profiles) {
    for (const group of profile.profileLocationGroups || []) {
      for (const zoneNode of group.locationGroupZones?.nodes || []) {
        for (const c of zoneNode.zone?.countries || []) {
          const code = c.code?.countryCode || c.code
          if (code) countries.add(code)
        }
        shippingMethods += zoneNode.methodDefinitions?.nodes?.length || 0
      }
    }
  }

  const primaryHost = shop.primaryDomain?.host || shop.myshopifyDomain
  const isCustomDomain = primaryHost.includes('bloemenvandegier.nl')
  const giftCardsEnabled = Boolean(shop.features?.giftCards)

  const checks = [
    {
      id: 'shopify-payments',
      label: 'Shopify Payments geactiveerd',
      passed: Boolean(payments?.activated),
      detail: payments?.activated ? `Actief (${payments.country || 'NL'})` : 'Nog niet geactiveerd — Sam moet instellen',
      owner: 'sam',
    },
    {
      id: 'gift-cards',
      label: 'Gift Cards ingeschakeld',
      passed: giftCardsEnabled,
      detail: giftCardsEnabled ? 'Ingeschakeld' : 'Uit — Settings → Gift cards',
      owner: 'sam',
    },
    {
      id: 'shipping-nl',
      label: 'Verzending naar Nederland',
      passed: countries.has('NL'),
      detail: countries.has('NL')
        ? `${shippingMethods} verzendmethode(s), zones: ${[...countries].join(', ')}`
        : `Geen NL-zone gevonden (${[...countries].join(', ') || 'geen zones'})`,
      owner: 'sam',
    },
    {
      id: 'custom-domain',
      label: 'Primair domein bloemenvandegier.nl',
      passed: isCustomDomain,
      detail: isCustomDomain
        ? `${primaryHost} (SSL: ${shop.primaryDomain?.sslEnabled ? 'ja' : 'nee'})`
        : `Nog ${primaryHost} — domeinwissel nog niet gedaan`,
      owner: 'sam',
    },
    {
      id: 'ssl',
      label: 'SSL op primair domein',
      passed: shop.primaryDomain?.sslEnabled !== false,
      detail: shop.primaryDomain?.sslEnabled ? 'SSL actief' : 'SSL nog niet actief',
      owner: 'sam',
    },
  ]

  const report = {
    generatedAt: new Date().toISOString(),
    shop: {
      name: shop.name,
      myshopifyDomain: shop.myshopifyDomain,
      primaryDomain: shop.primaryDomain,
      plan: shop.plan?.displayName,
      currency: shop.currencyCode,
    },
    checks,
    passed: checks.filter((c) => c.passed).length,
    total: checks.length,
    readyForDomainSwitch: checks.find((c) => c.id === 'shopify-payments')?.passed && giftCardsEnabled && countries.has('NL'),
  }

  fs.mkdirSync(path.dirname(REPORT), { recursive: true })
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))

  console.log(`Go-live audit: ${report.passed}/${report.total} checks geslaagd\n`)
  for (const check of checks) {
    console.log(`${check.passed ? '✓' : '✗'} ${check.label}`)
    console.log(`  ${check.detail}`)
  }
  console.log(`\nRapport: ${REPORT}`)
  if (report.readyForDomainSwitch) {
    console.log('\n→ Betaling + verzending + gift cards OK — domeinwissel kan gepland worden.')
  } else {
    console.log('\n→ Eerst betalingen, gift cards en verzending afronden (Blok B met Sam).')
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
