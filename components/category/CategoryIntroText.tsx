'use client'

import { Category, Product } from '@/lib/data/products'
import { getCategoryIntroText } from '@/lib/utils/categoryIntroText'

interface CategoryIntroTextProps {
  category: Category
  products: Product[]
}

// Important USP keywords that should be bold
const uspKeywords = [
  'rechtstreeks van de kweker',
  'rechtstreeks vanaf de kweker',
  'van de kweker',
  '7 dagen versgarantie',
  'vers bezorgd',
  'Nederland en België',
  'heel Nederland en België',
  'Bloemen van De Gier',
  'met zorg geselecteerd',
  'met zorg samengesteld',
  'dagelijks samengesteld',
  'ervaren bloemisten',
  'snelle levering',
  'verse bloemen',
  'verse rozen',
  'verse lente bloemen',
  'direct van de kweker',
]

export default function CategoryIntroText({ category, products }: CategoryIntroTextProps) {
  const text = getCategoryIntroText(category, products)
  
  // Function to render text with bold USP keywords
  const renderTextWithBold = (text: string) => {
    const result: (string | JSX.Element)[] = []
    let key = 0
    
    // Sort keywords by length (longest first) to prioritize longer matches
    const sortedKeywords = [...uspKeywords].sort((a, b) => b.length - a.length)
    
    // Find all matches with their positions
    const allMatches: Array<{ start: number; end: number; text: string; length: number }> = []
    
    sortedKeywords.forEach(keyword => {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escapedKeyword, 'gi')
      let match
      
      while ((match = regex.exec(text)) !== null) {
        allMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          length: match[0].length
        })
      }
    })
    
    // Sort by start position, then by length (longest first for same start)
    allMatches.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start
      return b.length - a.length
    })
    
    // Select non-overlapping matches (greedy algorithm - take longest matches first)
    const selectedMatches: typeof allMatches = []
    const usedPositions = new Set<number>()
    
    // Sort by length first (longest first), then by start position
    const sortedByLength = [...allMatches].sort((a, b) => {
      if (b.length !== a.length) return b.length - a.length
      return a.start - b.start
    })
    
    sortedByLength.forEach(match => {
      // Check if this position range is already used
      let hasOverlap = false
      for (let i = match.start; i < match.end; i++) {
        if (usedPositions.has(i)) {
          hasOverlap = true
          break
        }
      }
      
      if (!hasOverlap) {
        selectedMatches.push(match)
        for (let i = match.start; i < match.end; i++) {
          usedPositions.add(i)
        }
      }
    })
    
    // Sort selected matches by start position
    selectedMatches.sort((a, b) => a.start - b.start)
    
    // Build result array
    let lastIndex = 0
    selectedMatches.forEach(match => {
      // Add text before match
      if (match.start > lastIndex) {
        result.push(text.substring(lastIndex, match.start))
      }
      
      // Add bold match
      result.push(
        <strong key={key++} className="font-bold text-gray-900">
          {match.text}
        </strong>
      )
      
      lastIndex = match.end
    })
    
    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex))
    }
    
    return result.length > 0 ? result : text
  }

  return (
    <p className="text-base md:text-lg text-gray-700 leading-relaxed">
      {renderTextWithBold(text)}
    </p>
  )
}
