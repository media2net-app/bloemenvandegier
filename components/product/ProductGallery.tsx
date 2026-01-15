'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn, X, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { getProductImages } from '@/lib/utils/getProductImage'

interface ProductGalleryProps {
  images: Array<{ src: string; alt: string }>
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null)

  const productImages = getProductImages(images, productName)
  const currentImage = productImages[selectedIndex] || productImages[0]

  // Preload next/previous images for faster navigation
  useEffect(() => {
    if (isFullscreen && productImages.length > 1) {
      const nextIndex = (selectedIndex + 1) % productImages.length
      const prevIndex = (selectedIndex - 1 + productImages.length) % productImages.length
      
      const preloadImages = [
        productImages[nextIndex]?.src,
        productImages[prevIndex]?.src,
      ].filter(Boolean)

      preloadImages.forEach((src) => {
        const img = new window.Image()
        img.src = src || ''
      })
    }
  }, [isFullscreen, selectedIndex, productImages])

  // Reset image loaded state when image changes
  useEffect(() => {
    setImageLoaded(false)
  }, [selectedIndex, isFullscreen])

  // Handle mouse move for zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isFullscreen) {
        if (e.key === 'Escape') {
          setIsFullscreen(false)
        } else if (e.key === 'ArrowLeft') {
          setSelectedIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))
        } else if (e.key === 'ArrowRight') {
          setSelectedIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isFullscreen, productImages.length])

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFullscreen])

  return (
    <>
      <div className="space-y-4">
        {/* Main image */}
        <div 
          ref={imageRef}
          className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseEnter={() => setIsZoomed(true)}
        >
          <div
            className={cn(
              "relative w-full h-full transition-transform duration-300",
              isZoomed && "scale-150"
            )}
            style={{
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
            }}
          >
            <Image
              src={currentImage.src || '/placeholder-flower.jpg'}
              alt={currentImage.alt || productName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Zoom indicator */}
          {isZoomed && (
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
              <ZoomIn className="h-4 w-4" />
              Zoom actief - Beweeg muis
            </div>
          )}

          {/* Fullscreen button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg z-10"
            aria-label="Volledig scherm"
          >
            <Maximize2 className="h-5 w-5 text-gray-700" />
          </button>

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

      {/* Fullscreen Modal - Highest z-index to be above everything (header z-[60], chat z-50) */}
      {isFullscreen && (
        <div
          ref={fullscreenRef}
          className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
          style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsFullscreen(false)
            }}
            className="absolute top-4 right-4 p-3 bg-white/90 hover:bg-white rounded-full transition-colors z-[10000]"
            aria-label="Sluiten"
            style={{ zIndex: 10000 }}
          >
            <X className="h-6 w-6 text-gray-900" />
          </button>

          {/* Main image */}
          <div 
            className="relative w-full h-full flex items-center justify-center p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
            <div className={cn(
              "relative max-w-full max-h-full transition-opacity duration-200",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}>
              <img
                src={currentImage.src || '/placeholder-flower.jpg'}
                alt={currentImage.alt || productName}
                className="max-w-full max-h-full object-contain"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageLoaded(true)
                  console.error('Failed to load image:', currentImage.src)
                }}
                loading="eager"
              />
            </div>

            {/* Navigation arrows */}
            {productImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setImageLoaded(false)
                    setSelectedIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))
                  }}
                  className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors z-[10000]"
                  aria-label="Vorige afbeelding"
                  style={{ zIndex: 10000 }}
                >
                  <ChevronLeft className="h-8 w-8 text-gray-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setImageLoaded(false)
                    setSelectedIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))
                  }}
                  className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors z-[10000]"
                  aria-label="Volgende afbeelding"
                  style={{ zIndex: 10000 }}
                >
                  <ChevronRight className="h-8 w-8 text-gray-700" />
                </button>
              </>
            )}

            {/* Image counter */}
            {productImages.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium z-[10000]" style={{ zIndex: 10000 }}>
                {selectedIndex + 1} / {productImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
