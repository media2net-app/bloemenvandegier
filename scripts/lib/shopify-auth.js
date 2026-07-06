const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '../..')
const STORE = process.env.SHOPIFY_STORE || 'xn68xb-0f.myshopify.com'
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01'
const TOKEN_CACHE_PATH = path.join(ROOT, 'data/import/.shopify-token-cache.json')

function readTokenCache() {
  if (!fs.existsSync(TOKEN_CACHE_PATH)) return null
  try {
    return JSON.parse(fs.readFileSync(TOKEN_CACHE_PATH, 'utf-8'))
  } catch {
    return null
  }
}

function writeTokenCache(accessToken, expiresIn) {
  const dir = path.dirname(TOKEN_CACHE_PATH)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    TOKEN_CACHE_PATH,
    JSON.stringify(
      {
        accessToken,
        expiresAt: Date.now() + expiresIn * 1000 - 60_000,
        fetchedAt: new Date().toISOString(),
      },
      null,
      2
    )
  )
}

async function fetchAccessToken(clientId, clientSecret) {
  const response = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = payload.error_description || payload.error || JSON.stringify(payload)
    throw new Error(`Shopify token request mislukt (${response.status}): ${message}`)
  }

  if (!payload.access_token) {
    throw new Error('Shopify token response bevat geen access_token')
  }

  writeTokenCache(payload.access_token, payload.expires_in || 86_400)
  return payload.access_token
}

async function getAccessToken() {
  if (process.env.SHOPIFY_ADMIN_API_TOKEN) {
    return process.env.SHOPIFY_ADMIN_API_TOKEN
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error(
      'Shopify credentials ontbreken.\n' +
        'Zet SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET in .env,\n' +
        'of gebruik SHOPIFY_ADMIN_API_TOKEN voor een handmatig token.'
    )
  }

  const cache = readTokenCache()
  if (cache?.accessToken && cache.expiresAt > Date.now()) {
    return cache.accessToken
  }

  return fetchAccessToken(clientId, clientSecret)
}

async function getCredentials() {
  return {
    store: STORE,
    token: await getAccessToken(),
    apiVersion: API_VERSION,
  }
}

module.exports = {
  STORE,
  API_VERSION,
  getAccessToken,
  getCredentials,
}
