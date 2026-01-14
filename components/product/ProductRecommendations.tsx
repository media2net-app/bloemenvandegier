import ProductGrid from './ProductGrid'

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
}

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
    <section className="border-t border-gray-200 pt-12 mt-12">
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-8">
        {title}
      </h2>
      <ProductGrid products={products} columns={4} />
    </section>
  )
}
