import { notFound } from 'next/navigation'
import { getProductsByCategorySlug, getCategoryBySlug } from '@/lib/data/products'
import CategoryClient from './CategoryClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  
  const category = getCategoryBySlug(slug)
  if (!category) {
    notFound()
  }

  const products = getProductsByCategorySlug(slug)

  return <CategoryClient category={category} products={products} />
}
