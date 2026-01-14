#!/usr/bin/env ts-node

/**
 * i18n Scanner - Finds all hardcoded Dutch texts in the codebase
 * Usage: npx ts-node scripts/i18n-scanner.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

interface FoundText {
  file: string
  line: number
  text: string
  context: string
  type: 'string' | 'jsx' | 'template'
}

interface TranslationKey {
  key: string
  nlText: string
  foundIn: string[]
}

const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  'lib/i18n/translations',
  'scripts',
  '*.test.ts',
  '*.test.tsx',
  '*.spec.ts',
  '*.spec.tsx',
]

const DUTCH_PATTERNS = [
  /[A-Z][a-z]+ (van|voor|met|zijn|worden|hebben|kunnen|moeten|zullen|gaan)/i,
  /(de|het|een) [a-z]+/i,
  /(is|zijn|wordt|worden|heeft|hebben|kan|kunnen|moet|moeten|zou|zullen)/i,
  /(boeket|bloem|roos|bestelling|winkelmand|afrekenen|bezorging|klant|product)/i,
]

const COMMON_DUTCH_WORDS = [
  'boeket', 'bloem', 'roos', 'bestelling', 'winkelmand', 'afrekenen',
  'bezorging', 'klant', 'product', 'prijs', 'aantal', 'totaal', 'subtotaal',
  'verzendkosten', 'beschrijving', 'reviews', 'gerelateerd', 'op voorraad',
  'niet op voorraad', 'in winkelmand', 'bekijk', 'alle', 'meer', 'minder',
  'verder', 'terug', 'sluiten', 'opslaan', 'annuleren', 'verwijderen',
  'bewerken', 'bekijken', 'toevoegen', 'verwijderen', 'zoeken', 'account',
  'inloggen', 'uitloggen', 'menu', 'categorie', 'collectie', 'ontdek',
  'speciaal', 'geselecteerd', 'voor jou', 'topkwaliteit', 'versgarantie',
  'bezorging', 'nederland', 'belgië', 'heel', 'elke', 'dag', 'week',
  'donderdag', 'deal', 'fout', 'succes', 'laden', 'ja', 'nee', 'contact',
  'privacy', 'voorwaarden', 'klachten', 'retour', 'zakelijk', 'abonnement',
  'rozen', 'boeketten', 'voorjaarsbloemen', 'groen', 'decoratief', 'pioenrozen',
  'olijfbomen', 'bruiloft', 'krans', 'pasen', 'koningsdag', 'moederdag',
  'vaderdag', 'sinterklaas', 'kerst', 'persoonlijke', 'gegevens', 'adres',
  'postcode', 'huisnummer', 'straatnaam', 'woonplaats', 'telefoonnummer',
  'e-mailadres', 'voornaam', 'achternaam', 'bezorgdatum', 'bezorgtijd',
  'dag', 'avond', 'verzekerde', 'opmerkingen', 'nieuwsbrief', 'trackingnummer',
  'volg', 'bestelling', 'status', 'geschiedenis', 'profiel', 'instellingen',
]

function isLikelyDutch(text: string): boolean {
  const cleanText = text.trim()
  
  // Skip if too short or just numbers/symbols
  if (cleanText.length < 3 || /^[\d\s\W]+$/.test(cleanText)) {
    return false
  }
  
  // Skip if it's a URL, path, or technical term
  if (
    /^(https?|ftp|mailto|data):/i.test(cleanText) ||
    /^[\/\\]/.test(cleanText) ||
    /^[A-Z_]+$/.test(cleanText) || // UPPER_CASE constants
    /^[a-z]+[A-Z]/.test(cleanText) || // camelCase
    /^#[0-9a-fA-F]{3,6}$/.test(cleanText) // hex colors
  ) {
    return false
  }
  
  // Check for common Dutch words
  const lowerText = cleanText.toLowerCase()
  if (COMMON_DUTCH_WORDS.some(word => lowerText.includes(word))) {
    return true
  }
  
  // Check for Dutch patterns
  if (DUTCH_PATTERNS.some(pattern => pattern.test(cleanText))) {
    return true
  }
  
  // Check for Dutch-specific characters or common Dutch phrases
  if (
    /(van|voor|met|zijn|worden|hebben|kunnen|moeten|zullen|gaan|de|het|een|een|deze|die|dat|dit)/i.test(cleanText) &&
    cleanText.length > 5
  ) {
    return true
  }
  
  return false
}

function findHardcodedTexts(filePath: string): FoundText[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const found: FoundText[] = []
  
  // Match string literals: "text" or 'text'
  const stringRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g
  // Match JSX text content
  const jsxTextRegex = />\s*([^<{]+?)\s*</g
  // Match template literals: `text`
  const templateRegex = /`([^`]+)`/g
  
  lines.forEach((line, index) => {
    // Skip comments and imports
    if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('import')) {
      return
    }
    
    // Check string literals
    let match
    while ((match = stringRegex.exec(line)) !== null) {
      const text = match[0].slice(1, -1) // Remove quotes
      if (isLikelyDutch(text)) {
        found.push({
          file: filePath,
          line: index + 1,
          text,
          context: line.trim(),
          type: 'string',
        })
      }
    }
    
    // Check JSX text
    stringRegex.lastIndex = 0
    while ((match = jsxTextRegex.exec(line)) !== null) {
      const text = match[1].trim()
      if (isLikelyDutch(text)) {
        found.push({
          file: filePath,
          line: index + 1,
          text,
          context: line.trim(),
          type: 'jsx',
        })
      }
    }
    
    // Check template literals
    stringRegex.lastIndex = 0
    while ((match = templateRegex.exec(line)) !== null) {
      const text = match[1]
      if (isLikelyDutch(text)) {
        found.push({
          file: filePath,
          line: index + 1,
          text,
          context: line.trim(),
          type: 'template',
        })
      }
    }
  })
  
  return found
}

function generateTranslationKey(text: string, file: string): string {
  // Generate a key based on the text and file location
  const cleanText = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '.')
    .substring(0, 50)
  
  const filePart = path.basename(file, path.extname(file)).toLowerCase()
  
  return `${filePart}.${cleanText}`
}

async function scanCodebase(): Promise<Map<string, TranslationKey>> {
  const translations = new Map<string, TranslationKey>()
  
  // Find all TypeScript/TSX files
  const files = await glob('**/*.{ts,tsx}', {
    ignore: EXCLUDE_PATTERNS.map(p => `**/${p}/**`),
    cwd: process.cwd(),
  })
  
  console.log(`\n🔍 Scanning ${files.length} files for hardcoded Dutch texts...\n`)
  
  for (const file of files) {
    const fullPath = path.join(process.cwd(), file)
    const found = findHardcodedTexts(fullPath)
    
    for (const item of found) {
      const key = generateTranslationKey(item.text, file)
      
      if (!translations.has(key)) {
        translations.set(key, {
          key,
          nlText: item.text,
          foundIn: [],
        })
      }
      
      translations.get(key)!.foundIn.push(`${file}:${item.line}`)
    }
  }
  
  return translations
}

function generateReport(translations: Map<string, TranslationKey>) {
  console.log('\n' + '='.repeat(80))
  console.log('📊 TRANSLATION SCAN REPORT')
  console.log('='.repeat(80))
  console.log(`\nFound ${translations.size} unique Dutch texts that need translation\n`)
  
  // Group by file
  const byFile = new Map<string, TranslationKey[]>()
  translations.forEach((translation) => {
    const file = translation.foundIn[0].split(':')[0]
    if (!byFile.has(file)) {
      byFile.set(file, [])
    }
    byFile.get(file)!.push(translation)
  })
  
  console.log('📁 Files with hardcoded Dutch texts:\n')
  byFile.forEach((items, file) => {
    console.log(`  ${file} (${items.length} texts)`)
    items.slice(0, 3).forEach(item => {
      console.log(`    - "${item.nlText.substring(0, 50)}${item.nlText.length > 50 ? '...' : ''}"`)
    })
    if (items.length > 3) {
      console.log(`    ... and ${items.length - 3} more`)
    }
  })
  
  // Generate JSON report
  const report = {
    scanDate: new Date().toISOString(),
    totalFound: translations.size,
    translations: Array.from(translations.values()),
  }
  
  fs.writeFileSync(
    path.join(process.cwd(), 'i18n-scan-report.json'),
    JSON.stringify(report, null, 2)
  )
  
  console.log('\n' + '='.repeat(80))
  console.log(`✅ Report saved to: i18n-scan-report.json`)
  console.log('='.repeat(80) + '\n')
}

// Main execution
async function main() {
  try {
    const translations = await scanCodebase()
    generateReport(translations)
  } catch (error) {
    console.error('❌ Error scanning codebase:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { scanCodebase, generateTranslationKey, isLikelyDutch }
