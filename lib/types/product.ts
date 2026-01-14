export interface Product {
  id: number
  name: string
  slug: string
  permalink: string
  price: string
  regular_price: string
  sale_price: string
  on_sale: boolean
  images: ProductImage[]
  description: string
  short_description: string
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  stock_quantity: number | null
  categories: Category[]
  attributes: ProductAttribute[]
  average_rating: string
  rating_count: number
  reviews: Review[]
  related_ids: number[]
}

export interface ProductImage {
  id: number
  src: string
  alt: string
  name: string
}

export interface Category {
  id: number
  name: string
  slug: string
  image?: ProductImage
}

export interface ProductAttribute {
  id: number
  name: string
  options: string[]
}

export interface Review {
  id: number
  date_created: string
  rating: number
  reviewer: string
  review: string
}
