/**
 * Extract color keywords from product name and description
 */
export function extractProductColor(productName: string, description?: string): string[] {
  const text = `${productName} ${description || ''}`.toLowerCase()
  const colors: string[] = []
  
  // Color mapping
  const colorKeywords: Record<string, string> = {
    rood: 'rood',
    rode: 'rood',
    roze: 'roze',
    pink: 'roze',
    wit: 'wit',
    witte: 'wit',
    white: 'wit',
    geel: 'geel',
    gele: 'geel',
    yellow: 'geel',
    blauw: 'blauw',
    blauwe: 'blauw',
    blue: 'blauw',
    paars: 'paars',
    paarse: 'paars',
    purple: 'paars',
    oranje: 'oranje',
    orange: 'oranje',
    groen: 'groen',
    groene: 'groen',
    green: 'groen',
    gemengd: 'gemengd',
    multicolor: 'gemengd',
    bont: 'gemengd',
    bontgekleurde: 'gemengd',
    mix: 'gemengd',
    mixed: 'gemengd',
  }
  
  // Check for color keywords
  for (const [keyword, color] of Object.entries(colorKeywords)) {
    if (text.includes(keyword) && !colors.includes(color)) {
      colors.push(color)
    }
  }
  
  // If no colors found, return empty array (will be filtered out)
  return colors
}

/**
 * Get all unique colors from a list of products
 */
export function getAvailableColors(products: Array<{ name: string; description?: string }>): string[] {
  const colorSet = new Set<string>()
  
  products.forEach(product => {
    const colors = extractProductColor(product.name, product.description)
    colors.forEach(color => colorSet.add(color))
  })
  
  return Array.from(colorSet).sort()
}

/**
 * Get color filter options with counts
 */
export function getColorFilterOptions(
  products: Array<{ name: string; description?: string }>
): Array<{ value: string; label: string; count: number }> {
  const colorCounts: Record<string, number> = {}
  
  products.forEach(product => {
    const colors = extractProductColor(product.name, product.description)
    colors.forEach(color => {
      colorCounts[color] = (colorCounts[color] || 0) + 1
    })
  })
  
  const colorLabels: Record<string, string> = {
    rood: 'Rood',
    roze: 'Roze',
    wit: 'Wit',
    geel: 'Geel',
    blauw: 'Blauw',
    paars: 'Paars',
    oranje: 'Oranje',
    groen: 'Groen',
    gemengd: 'Gemengd',
  }
  
  return Object.entries(colorCounts)
    .map(([value, count]) => ({
      value,
      label: colorLabels[value] || value.charAt(0).toUpperCase() + value.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count)
}
