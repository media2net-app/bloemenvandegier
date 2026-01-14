'use client'

import ProductCard from './ProductCard'

interface Product {
  id: number
  name: string
  slug: string
  price: string
  regular_price?: string
  sale_price?: string
  images: Array<{ src: string; alt: string }>
  stock_status?: string
  average_rating?: string
  rating_count?: number
}

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3 | 4
}

export default function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          slug={product.slug}
          price={product.sale_price || product.price}
          regularPrice={product.regular_price}
          image={product.images[0]?.src || ''}
          onSale={!!product.sale_price}
          stockStatus={product.stock_status}
          averageRating={product.average_rating}
          ratingCount={product.rating_count}
        />
      ))}
    </div>
  )
}
