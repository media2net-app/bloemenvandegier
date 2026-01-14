import { NextResponse } from 'next/server'
import { getAllCategories, getProductsByCategorySlug } from '@/lib/data/products'
import categoriesData from '@/lib/data/categories.json'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (slug) {
    const products = getProductsByCategorySlug(slug)
    return NextResponse.json(products)
  }

  // Return categories from JSON file
  return NextResponse.json(categoriesData)
}
