import { NextResponse } from 'next/server'
import { getAllProducts, getFeaturedProducts, searchProducts } from '@/lib/data/products'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const featured = searchParams.get('featured')
  const search = searchParams.get('search')
  const limit = searchParams.get('limit')

  if (featured === 'true') {
    const limitNum = limit ? parseInt(limit) : 8
    const products = getFeaturedProducts(limitNum)
    return NextResponse.json(products)
  }

  if (search) {
    const products = searchProducts(search)
    return NextResponse.json(products)
  }

  const products = getAllProducts()
  const limitNum = limit ? parseInt(limit) : undefined
  
  return NextResponse.json(
    limitNum ? products.slice(0, limitNum) : products
  )
}
