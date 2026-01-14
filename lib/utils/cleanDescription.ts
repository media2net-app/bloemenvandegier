/**
 * Clean product description by removing escape characters and formatting
 */
export function cleanDescription(description: string): string {
  if (!description) return ''
  
  return description
    .replace(/\\r\\n/g, ' ')
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Get short description preview (first N characters)
 */
export function getDescriptionPreview(description: string, maxLength: number = 200): string {
  const cleaned = cleanDescription(description)
  
  // Remove HTML tags for preview
  const textOnly = cleaned.replace(/<[^>]*>/g, '')
  
  if (textOnly.length <= maxLength) {
    return textOnly
  }
  
  // Find last space before maxLength to avoid cutting words
  const truncated = textOnly.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...'
}
