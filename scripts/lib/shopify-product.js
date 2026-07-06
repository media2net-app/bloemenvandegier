const { shopifyGraphql } = require('./shopify-client')

let cachedLocationId = null

async function getDefaultLocationId(credentials) {
  if (cachedLocationId) return cachedLocationId

  const data = await shopifyGraphql(
    `{ locations(first: 1) { nodes { id } } }`,
    {},
    credentials
  )

  cachedLocationId = data.locations?.nodes?.[0]?.id
  if (!cachedLocationId) {
    throw new Error('Geen Shopify locatie gevonden voor voorraad')
  }

  return cachedLocationId
}

function toProductSetInput(product, locationId) {
  const input = {
    title: product.title,
    handle: product.handle,
    descriptionHtml: product.descriptionHtml,
    vendor: product.vendor,
    productType: product.productType,
    tags: product.tags,
    status: product.status,
  }

  if (product.options.length) {
    input.productOptions = product.options.map((option) => ({
      name: option.name,
      values: option.values.map((value) => ({ name: value })),
    }))
  } else {
    input.productOptions = [{ name: 'Title', values: [{ name: 'Default Title' }] }]
  }

  input.variants = product.variants.map((variant) => {
    const mapped = {
      price: variant.price || '0.00',
      compareAtPrice: variant.compareAtPrice || undefined,
      sku: variant.sku,
      inventoryPolicy: variant.inventoryPolicy,
    }

    if (variant.optionValues?.length) {
      mapped.optionValues = variant.optionValues
    } else {
      mapped.optionValues = [{ optionName: 'Title', name: 'Default Title' }]
    }

    if (typeof variant.inventoryQuantity === 'number' && locationId) {
      mapped.inventoryQuantities = [
        {
          locationId,
          name: 'available',
          quantity: variant.inventoryQuantity,
        },
      ]
    }

    return mapped
  })

  if (product.images.length) {
    input.files = product.images.map((url) => ({ originalSource: url }))
  }

  return input
}

async function importProduct(product, credentials) {
  const locationId = await getDefaultLocationId(credentials)
  const mutation = `
    mutation productSet($input: ProductSetInput!, $identifier: ProductSetIdentifiers) {
      productSet(input: $input, identifier: $identifier) {
        product {
          id
          handle
          title
          status
          media(first: 5) {
            nodes {
              ... on MediaImage {
                image {
                  url
                }
              }
            }
          }
          variants(first: 100) {
            nodes {
              id
              price
              selectedOptions {
                name
                value
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const data = await shopifyGraphql(
    mutation,
    {
      identifier: { handle: product.handle },
      input: toProductSetInput(product, locationId),
    },
    credentials
  )

  const result = data.productSet
  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map((error) => error.message).join('; '))
  }

  return result.product
}

async function getOnlineStorePublicationId(credentials) {
  const data = await shopifyGraphql(
    `{
      publications(first: 20) {
        nodes { id name }
      }
    }`,
    {},
    credentials
  )

  const publication = data.publications.nodes.find((node) =>
    node.name.toLowerCase().includes('online store')
  )

  if (!publication) {
    throw new Error('Online Store publication niet gevonden')
  }

  return publication.id
}

async function getProductByHandle(handle, credentials, publicationId) {
  const query = publicationId
    ? `query($handle: String!, $publicationId: ID!) {
        productByHandle(handle: $handle) {
          id
          handle
          status
          onlineStoreUrl
          publishedOnPublication(publicationId: $publicationId)
        }
      }`
    : `query($handle: String!) {
        productByHandle(handle: $handle) {
          id
          handle
          status
          onlineStoreUrl
        }
      }`

  const variables = publicationId ? { handle, publicationId } : { handle }
  const data = await shopifyGraphql(query, variables, credentials)
  return data.productByHandle
}

async function publishProduct(productId, publicationId, credentials) {
  const data = await shopifyGraphql(
    `mutation($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        publishable {
          ... on Product {
            id
            handle
            onlineStoreUrl
          }
        }
        userErrors { field message }
      }
    }`,
    {
      id: productId,
      input: [{ publicationId }],
    },
    credentials
  )

  const result = data.publishablePublish
  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map((error) => error.message).join('; '))
  }

  return result.publishable
}

async function isPublishedOnOnlineStore(productId, publicationId, credentials) {
  const data = await shopifyGraphql(
    `query($id: ID!, $publicationId: ID!) {
      product(id: $id) {
        publishedOnPublication(publicationId: $publicationId)
      }
    }`,
    { id: productId, publicationId },
    credentials
  )
  return Boolean(data.product?.publishedOnPublication)
}

module.exports = {
  toProductSetInput,
  importProduct,
  getDefaultLocationId,
  getOnlineStorePublicationId,
  getProductByHandle,
  publishProduct,
  isPublishedOnOnlineStore,
}
