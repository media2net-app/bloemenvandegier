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

type ProductLabel = 'meest-verkocht' | 'nieuw' | 'dagtopper' | null

// Function to assign random labels to products (deterministic based on product ID)
function getProductLabel(productId: number): ProductLabel {
  // Use product ID as seed for consistent labeling
  const seed = productId * 7 + 13
  const random = (seed % 100) / 100
  
  // 30% chance of having a label (70% no label)
  if (random > 0.7) {
    const labelType = seed % 3
    if (labelType === 0) return 'meest-verkocht'
    if (labelType === 1) return 'nieuw'
    if (labelType === 2) return 'dagtopper'
  }
  
  return null
}

export default function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {products.map((product) => {
        const label = getProductLabel(product.id)
        return (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            price={product.sale_price || product.price}
            regularPrice={product.regular_price}
            image={product.images[0]?.src || ''}
            images={product.images}
            onSale={!!product.sale_price}
            stockStatus={product.stock_status}
            averageRating={product.average_rating}
            ratingCount={product.rating_count}
            label={label}
          />
        )
      })}
    </div>
  )
}
