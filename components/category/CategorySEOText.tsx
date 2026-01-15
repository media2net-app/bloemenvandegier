'use client'

import { Category, Product } from '@/lib/data/products'

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
  'zorgvuldig geselecteerd',
  'zorgvuldig samengesteld',
  'snel bezorgd',
]

// Function to render text with bold USP keywords
function renderTextWithBold(text: string) {
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
  
  // Sort by length first (longest first), then by start position
  const sortedByLength = [...allMatches].sort((a, b) => {
    if (b.length !== a.length) return b.length - a.length
    return a.start - b.start
  })
  
  // Select non-overlapping matches (greedy algorithm - take longest matches first)
  const selectedMatches: typeof allMatches = []
  const usedPositions = new Set<number>()
  
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

interface CategorySEOTextProps {
  category: Category
  products: Product[]
}

export default function CategorySEOText({ category, products }: CategorySEOTextProps) {
  // Generate SEO-friendly text based on category
  const generateSEOText = () => {
    const categoryName = category.name.toLowerCase()
    const productCount = products.length
    const priceRange = products.length > 0 
      ? {
          min: Math.min(...products.map(p => parseFloat(p.price))),
          max: Math.max(...products.map(p => parseFloat(p.price)))
        }
      : null

    // Base text templates for different categories
    const templates: Record<string, string> = {
      rozen: `Ontdek onze uitgebreide collectie ${productCount} prachtige rozen bij Bloemen van De Gier. Van klassieke rode rozen tot elegante roze en witte variëteiten - wij bieden de mooiste rozen rechtstreeks van de kweker. Perfect voor elke gelegenheid: verjaardagen, Valentijnsdag, of gewoon om iemand te verrassen. Onze rozen worden met zorg geselecteerd en vers bezorgd door heel Nederland en België.`,
      
      boeketten: `Bekijk onze selectie van ${productCount} unieke boeketten. Bij Bloemen van De Gier vind je de mooiste bloemenboeketten, zorgvuldig samengesteld door onze specialisten. Van kleurrijke voorjaarsboeketten tot elegante klassieke arrangementen - er is voor elke smaak en gelegenheid een perfect boeket. Bestel vandaag nog en geniet van verse bloemen met 7 dagen versgarantie.`,
      
      'emmer-bloemen': `Ontdek onze ${productCount} verschillende emmers bloemen. Perfect voor wie graag zelf creatief aan de slag gaat! Onze emmers bevatten diverse bossen bloemen met korte stelen, ideaal om zelf te arrangeren in kleine vaasjes of om er een groot gemengd boeket van te maken. Elke week samengesteld met de mooiste bloemsoorten en kleurencombinaties van het moment.`,
      
      'voorjaarsbloemen': `Welkom bij onze collectie voorjaarsbloemen! Geniet van ${productCount} verse lente bloemen die de natuur weer tot leven brengen. Onze voorjaarsbloemen worden direct van de kweker geleverd en zijn perfect om je huis op te fleuren of om cadeau te geven. Van tulpen tot narcissen - ontdek de kleuren van de lente.`,
      
      'groen-decoratief': `Bekijk onze ${productCount} decoratieve groene planten en takken. Perfect voor het creëren van een natuurlijke sfeer in huis. Van verse takken tot decoratieve groene planten - bij Bloemen van De Gier vind je alles voor een groene touch in je interieur.`,
    }

    // Try to find a specific template
    let seoText = templates[category.slug]
    
    // If no specific template, generate generic text
    if (!seoText) {
      const categoryLower = categoryName
      const isOccasion = ['verjaardag', 'bedankje', 'beterschap', 'geboorte', 'geliefde', 'moederdag', 'vaderdag'].some(occ => categoryLower.includes(occ))
      
      if (isOccasion) {
        seoText = `Ontdek onze collectie ${productCount} prachtige bloemen voor ${category.name.toLowerCase()} bij Bloemen van De Gier. Wij bieden de perfecte bloemen voor deze speciale gelegenheid, zorgvuldig geselecteerd en vers bezorgd.`
      } else {
        seoText = `Bekijk onze uitgebreide collectie ${productCount} ${category.name.toLowerCase()} bij Bloemen van De Gier. Wij bieden kwaliteitsbloemen rechtstreeks van de kweker, vers bezorgd door heel Nederland en België. Ontdek de mooiste bloemen voor elke gelegenheid.`
      }
    }

    // Add price range if available
    if (priceRange && priceRange.min !== priceRange.max) {
      seoText += ` Onze ${category.name.toLowerCase()} zijn beschikbaar vanaf €${priceRange.min.toFixed(2)} tot €${priceRange.max.toFixed(2)}.`
    }

    // Add closing statement
    seoText += ` Bestel vandaag nog en geniet van snelle levering en onze 7 dagen versgarantie. Bij Bloemen van De Gier staat kwaliteit en klanttevredenheid voorop.`

    return seoText
  }

  const seoText = generateSEOText()

  // Generate additional SEO paragraphs with keywords
  const additionalParagraphs = () => {
    const categoryName = category.name.toLowerCase()
    const paragraphs: string[] = []

    // Add FAQ-style content
    if (categoryName.includes('rozen')) {
      paragraphs.push(
        `Waarom rozen kopen bij Bloemen van De Gier? Onze rozen komen rechtstreeks van de kweker, waardoor je gegarandeerd verse bloemen ontvangt. We bieden een breed assortiment aan rozen in verschillende kleuren en maten, perfect voor elke gelegenheid. Of je nu op zoek bent naar een romantisch boeket voor Valentijnsdag of een vrolijke bos voor een verjaardag - wij hebben de perfecte rozen voor jou.`
      )
    }

    if (categoryName.includes('boeket')) {
      paragraphs.push(
        `Onze boeketten worden dagelijks samengesteld door ervaren bloemisten die gebruik maken van de mooiste bloemsoorten van het moment. Elk boeket is uniek en wordt met zorg samengesteld. We bieden boeketten in verschillende prijsklassen, zodat er voor elk budget een mooi boeket beschikbaar is.`
      )
    }

    if (categoryName.includes('emmer')) {
      paragraphs.push(
        `Een emmer bloemen is ideaal voor wie graag zelf creatief bezig is. Je kunt de bloemen zelf arrangeren in kleine vaasjes of er een groot boeket van maken. Het leuke van een emmer is dat je zelf bepaalt hoe je de bloemen presenteert. Perfect voor thuis of om te delen met buren en vrienden.`
      )
    }

    // Generic paragraph if no specific match
    if (paragraphs.length === 0) {
      paragraphs.push(
        `Bij Bloemen van De Gier geloven we in kwaliteit en versheid. Daarom werken we direct samen met kwekers om de beste bloemen te kunnen aanbieden. Onze bloemen worden met zorg verpakt en snel bezorgd, zodat je optimaal kunt genieten van je aankoop.`
      )
    }

    return paragraphs
  }

  const additionalContent = additionalParagraphs()

  return (
    <section className="bg-white border-t border-gray-200 py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="prose prose-lg max-w-none">
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p className="text-base md:text-lg">
              {renderTextWithBold(seoText)}
            </p>
            
            {additionalContent.map((paragraph, index) => (
              <p key={index} className="text-base md:text-lg">
                {renderTextWithBold(paragraph)}
              </p>
            ))}
          </div>

          {/* Keywords section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <strong>Populaire zoektermen:</strong> {category.name.toLowerCase()}, bloemen {category.name.toLowerCase()}, {category.name.toLowerCase()} bestellen, {category.name.toLowerCase()} bezorgen, verse {category.name.toLowerCase()}, {category.name.toLowerCase()} online, bloemenwinkel {category.name.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
