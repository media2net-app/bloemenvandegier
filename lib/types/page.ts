export type BlockType = 
  | 'hero' 
  | 'text' 
  | 'image' 
  | 'products' 
  | 'categories' 
  | 'video' 
  | 'testimonials' 
  | 'cta' 
  | 'columns' 
  | 'gallery'
  | 'accordion'
  | 'form'

export interface PageBlock {
  id: string
  type: BlockType
  order: number
  data: Record<string, any>
  settings?: Record<string, any>
}

export interface Page {
  id: string
  slug: string
  title: string
  description?: string
  isHomepage: boolean
  published: boolean
  blocks: PageBlock[]
  seoTitle?: string
  seoDescription?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
}
