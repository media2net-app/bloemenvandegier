import ProductGrid from './ProductGrid'
import { Product } from '@/lib/data/products'

interface ProductRecommendationsProps {
  products: Product[]
  title?: string
}

export default function ProductRecommendations({
  products,
  title = 'Gerelateerde producten',
}: ProductRecommendationsProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-8">
        {title}
      </h2>
      <ProductGrid products={products} columns={4} />
    </div>
  )
}
