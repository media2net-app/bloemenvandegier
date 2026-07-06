const { API_VERSION } = require('./shopify-auth')

async function shopifyGraphql(query, variables, credentials) {
  const response = await fetch(
    `https://${credentials.store}/admin/api/${credentials.apiVersion || API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': credentials.token,
      },
      body: JSON.stringify({ query, variables }),
    }
  )

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(`Shopify API HTTP ${response.status}: ${JSON.stringify(payload)}`)
  }
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '))
  }
  return payload.data
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = {
  shopifyGraphql,
  delay,
}
