'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { getProductImages } from '@/lib/utils/getProductImage'

interface ProductGalleryProps {
  images: Array<{ src: string; alt: string }>
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const productImages = getProductImages(images, productName)
  const currentImage = productImages[selectedIndex] || productImages[0]

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group">
        <Image
          src={currentImage.src || '/placeholder-flower.jpg'}
          alt={currentImage.alt || productName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg"
              aria-label="Vorige afbeelding"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <button
              onClick={() =>
                setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg"
              aria-label="Volgende afbeelding"
            >
              <ChevronRight className="h-6 w-6 text-gray-700" />
            </button>
          </>
        )}

        {/* Image indicator */}
        {productImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {productImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  index === selectedIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/75'
                )}
                aria-label={`Ga naar afbeelding ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail gallery */}
      {productImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {productImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative aspect-square rounded-xl overflow-hidden border-2 transition-all',
                index === selectedIndex
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : 'border-transparent hover:border-gray-300'
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 12.5vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
