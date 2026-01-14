import { Star } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Review {
  id: number
  reviewer: string
  rating: number
  review: string
  date: string
}

interface ProductReviewsProps {
  reviews: Review[]
  averageRating?: string
  ratingCount?: number
}

export default function ProductReviews({
  reviews,
  averageRating,
  ratingCount,
}: ProductReviewsProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
        <p className="text-gray-600">Nog geen reviews beschikbaar.</p>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 pt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reviews</h2>
        {averageRating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-5 w-5',
                    i < Math.floor(parseFloat(averageRating))
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-gray-600">
              {averageRating} uit {ratingCount || reviews.length} reviews
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">{review.reviewer}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.date).toLocaleDateString('nl-NL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed">{review.review}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
