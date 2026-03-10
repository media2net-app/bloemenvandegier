#!/bin/bash
# Shopify CLI setup voor xn68xb-0f.myshopify.com
# Voer uit in je terminal: cd SHOPIFY && ./setup-cli.sh

set -e

cd "$(dirname "$0")"
STORE="xn68xb-0f.myshopify.com"

echo "=== Stap 1: Shopify CLI installeren ==="
npm install -g @shopify/cli @shopify/theme 2>/dev/null || true

if ! command -v shopify &> /dev/null; then
  SHOPIFY_CMD="npx --yes @shopify/cli"
else
  SHOPIFY_CMD="shopify"
fi

echo ""
echo "=== Stap 2: Inloggen op Shopify ==="
echo "Er opent een browser - log in en kies je winkel."
$SHOPIFY_CMD auth login

echo ""
echo "=== Stap 3: Live thema ophalen ==="
$SHOPIFY_CMD theme pull --store "$STORE" --live --path .

echo ""
echo "Klaar! Je thema staat lokaal."
echo ""
echo "Handige commando's:"
echo "  $SHOPIFY_CMD theme pull --store $STORE --live"
echo "  $SHOPIFY_CMD theme push --store $STORE"
echo "  $SHOPIFY_CMD theme dev --store $STORE"
