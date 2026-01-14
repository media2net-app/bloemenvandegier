/**
 * Get product image with fallback
 */
export function getProductImage(
  images: Array<{ src: string; alt?: string }> | undefined,
  fallback?: string
): string {
  if (!images || images.length === 0) {
    return fallback || '/images/placeholder-flower.svg'
  }

  const firstImage = images[0]
  if (!firstImage || !firstImage.src || firstImage.src.trim() === '') {
    return fallback || '/images/placeholder-flower.svg'
  }

  return firstImage.src
}

/**
 * Get all product images with fallback
 */
export function getProductImages(
  images: Array<{ src: string; alt?: string }> | undefined,
  productName: string
): Array<{ src: string; alt: string }> {
  if (!images || images.length === 0) {
    return [
      {
        src: '/images/placeholder-flower.svg',
        alt: `${productName} - Geen afbeelding beschikbaar`,
      },
    ]
  }

  return images
    .filter((img) => img && img.src && img.src.trim() !== '')
    .map((img, index) => ({
      src: img.src,
      alt: img.alt || `${productName} ${index > 0 ? index + 1 : ''}`.trim(),
    }))
}
