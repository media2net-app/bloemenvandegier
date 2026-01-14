import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug, getAllProducts } from '@/lib/data/products'
import ProductDetailClient from './ProductDetailClient'

// Generate static params for all products
export async function generateStaticParams() {
  const products = getAllProducts()
  return products.map((product) => ({
    slug: product.slug,
  }))
}

// Generate metadata for each product
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    return {
      title: 'Product niet gevonden',
    }
  }

  const imageUrl = product.images[0]?.src || '/images/logo.svg'
  const price = parseFloat(product.price).toFixed(2)

  return {
    title: `${product.name} | Bloemen van De Gier`,
    description: product.short_description || product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.short_description || product.description.substring(0, 160),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.short_description || product.description.substring(0, 160),
      images: [imageUrl],
    },
    other: {
      'product:price:amount': price,
      'product:price:currency': 'EUR',
      'product:availability': product.stock_status === 'instock' ? 'in stock' : 'out of stock',
    },
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params

  // Get product from data
  const product = getProductBySlug(slug)
  
  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} />
}
