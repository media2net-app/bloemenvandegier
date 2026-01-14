import { NextResponse } from 'next/server'
import { getAllCategories, getProductsByCategorySlug } from '@/lib/data/products'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (slug) {
    const products = getProductsByCategorySlug(slug)
    return NextResponse.json(products)
  }

  const categories = getAllCategories()
  return NextResponse.json(categories)
}
