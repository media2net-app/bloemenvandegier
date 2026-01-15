import { Category, Product } from '@/lib/data/products'

export function getCategoryIntroText(category: Category, products: Product[]): string {
  const categoryName = category.name.toLowerCase()
  const categorySlug = category.slug.toLowerCase()
  const productCount = products.length
  
  // Calculate price range
  const priceRange = products.length > 0 
    ? {
        min: Math.min(...products.map(p => parseFloat(p.price))),
        max: Math.max(...products.map(p => parseFloat(p.price)))
      }
    : null

  // Specific templates for popular categories
  const templates: Record<string, string> = {
    rozen: `Ontdek onze uitgebreide collectie van ${productCount} prachtige rozen bij Bloemen van De Gier. Wij bieden de mooiste rozen rechtstreeks van de kweker, vers bezorgd door heel Nederland en België. Van klassieke rode rozen tot elegante roze en witte variëteiten - er is voor elke gelegenheid een perfect boeket. Onze rozen worden met zorg geselecteerd en zijn perfect voor verjaardagen, Valentijnsdag, of gewoon om iemand te verrassen.${priceRange ? ` Onze rozen zijn beschikbaar vanaf €${priceRange.min.toFixed(2)} tot €${priceRange.max.toFixed(2)}.` : ''} Bestel vandaag nog en geniet van verse rozen met 7 dagen versgarantie.`,
    
    boeketten: `Bekijk onze selectie van ${productCount} unieke boeketten bij Bloemen van De Gier. Onze bloemenboeketten worden dagelijks samengesteld door ervaren bloemisten die gebruik maken van de mooiste bloemsoorten van het moment. Van kleurrijke voorjaarsboeketten tot elegante klassieke arrangementen - er is voor elke smaak en gelegenheid een perfect boeket.${priceRange ? ` Onze boeketten zijn beschikbaar vanaf €${priceRange.min.toFixed(2)} tot €${priceRange.max.toFixed(2)}.` : ''} Elk boeket is uniek en wordt met zorg samengesteld. Bestel vandaag nog en geniet van verse bloemen met snelle levering.`,
    
    'emmer-bloemen': `Ontdek onze ${productCount} verschillende emmers bloemen bij Bloemen van De Gier. Perfect voor wie graag zelf creatief aan de slag gaat! Onze emmers bevatten diverse bossen bloemen met korte stelen, ideaal om zelf te arrangeren in kleine vaasjes of om er een groot gemengd boeket van te maken. Elke week samengesteld met de mooiste bloemsoorten en kleurencombinaties van het moment.${priceRange ? ` Onze emmers bloemen zijn beschikbaar vanaf €${priceRange.min.toFixed(2)} tot €${priceRange.max.toFixed(2)}.` : ''} Het leuke van een emmer is dat je zelf bepaalt hoe je de bloemen presenteert.`,
    
    'voorjaarsbloemen': `Welkom bij onze collectie voorjaarsbloemen! Geniet van ${productCount} verse lente bloemen die de natuur weer tot leven brengen. Onze voorjaarsbloemen worden direct van de kweker geleverd en zijn perfect om je huis op te fleuren of om cadeau te geven. Van tulpen tot narcissen - ontdek de kleuren van de lente bij Bloemen van De Gier.${priceRange ? ` Onze voorjaarsbloemen zijn beschikbaar vanaf €${priceRange.min.toFixed(2)} tot €${priceRange.max.toFixed(2)}.` : ''} Bestel vandaag nog en geniet van verse lente bloemen.`,
    
    'groen-decoratief': `Bekijk onze ${productCount} decoratieve groene planten en takken bij Bloemen van De Gier. Perfect voor het creëren van een natuurlijke sfeer in huis. Van verse takken tot decoratieve groene planten - wij bieden alles voor een groene touch in je interieur.${priceRange ? ` Onze groen & decoratief producten zijn beschikbaar vanaf €${priceRange.min.toFixed(2)} tot €${priceRange.max.toFixed(2)}.` : ''} Ideaal voor het decoreren van je huis of kantoor.`,
    
    'plukboeket': `Ontdek onze ${productCount} plukboeketten bij Bloemen van De Gier. Plukboeketten zijn perfect voor wie graag zelf bloemen plukt en arrangeert. Onze plukboeketten bevatten diverse bloemsoorten die je zelf kunt plukken en arrangeren.${priceRange ? ` Onze plukboeketten zijn beschikbaar vanaf €${priceRange.min.toFixed(2)} tot €${priceRange.max.toFixed(2)}.` : ''} Perfect voor een creatieve bloemenervaring thuis.`,
  }

  // Try to find a specific template
  let introText = templates[categorySlug] || templates[categoryName]
  
  // If no specific template, generate generic text
  if (!introText) {
    const isOccasion = ['verjaardag', 'bedankje', 'beterschap', 'geboorte', 'geliefde', 'moederdag', 'vaderdag', 'valentijnsdag'].some(occ => categoryName.includes(occ))
    
    if (isOccasion) {
      introText = `Ontdek onze collectie van ${productCount} prachtige bloemen voor ${category.name.toLowerCase()} bij Bloemen van De Gier. Wij bieden de perfecte bloemen voor deze speciale gelegenheid, zorgvuldig geselecteerd en vers bezorgd door heel Nederland en België.${priceRange ? ` Onze ${category.name.toLowerCase()} bloemen zijn beschikbaar vanaf €${priceRange.min.toFixed(2)} tot €${priceRange.max.toFixed(2)}.` : ''} Bestel vandaag nog en maak deze gelegenheid extra bijzonder met verse bloemen.`
    } else {
      introText = `Bekijk onze uitgebreide collectie van ${productCount} ${category.name.toLowerCase()} bij Bloemen van De Gier. Wij bieden kwaliteitsbloemen rechtstreeks van de kweker, vers bezorgd door heel Nederland en België.${priceRange ? ` Onze ${category.name.toLowerCase()} zijn beschikbaar vanaf €${priceRange.min.toFixed(2)} tot €${priceRange.max.toFixed(2)}.` : ''} Ontdek de mooiste bloemen voor elke gelegenheid met onze 7 dagen versgarantie.`
    }
  }

  return introText
}
