import { formatPrice } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

interface PriceProps {
  price: number | string
  regularPrice?: number | string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Price({ price, regularPrice, className, size = 'md' }: PriceProps) {
  const isOnSale = regularPrice && parseFloat(String(regularPrice)) > parseFloat(String(price))
  
  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-bold text-primary-600', sizes[size])}>
        {formatPrice(price)}
      </span>
      {isOnSale && regularPrice && (
        <span className={cn('text-gray-400 line-through', sizes[size])}>
          {formatPrice(regularPrice)}
        </span>
      )}
    </div>
  )
}
