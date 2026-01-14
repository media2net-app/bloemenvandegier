#!/usr/bin/env ts-node

/**
 * i18n Translation Agent - Automatically generates missing translations
 * Usage: npx ts-node scripts/i18n-translation-agent.ts [--auto-fix]
 */

import * as fs from 'fs'
import * as path from 'path'
import { nl } from '../lib/i18n/translations/nl'
import { en } from '../lib/i18n/translations/en'
import { tr } from '../lib/i18n/translations/tr'
import { ro } from '../lib/i18n/translations/ro'
import { validateTranslations } from './i18n-validator'
import { scanCodebase } from './i18n-scanner'

// Simple translation dictionary (in production, use a real translation API)
const TRANSLATION_DICT: Record<string, Record<string, string>> = {
  // This would be replaced with actual translation API calls
  // For now, we'll use a placeholder system
}

async function translateText(text: string, targetLang: 'en' | 'tr' | 'ro'): Promise<string> {
  // In production, this would call a translation API like Google Translate, DeepL, etc.
  // For now, return a placeholder
  return `[TRANSLATE: ${text} to ${targetLang}]`
}

function getValueByKey(obj: any, key: string): any {
  const keys = key.split('.')
  let value = obj
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return undefined
    }
  }
  
  return value
}

function setValueByKey(obj: any, key: string, value: any): void {
  const keys = key.split('.')
  let current = obj
  
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]
    if (!(k in current) || typeof current[k] !== 'object') {
      current[k] = {}
    }
    current = current[k]
  }
  
  current[keys[keys.length - 1]] = value
}

function getAllKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = []
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const value = obj[key]
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  
  return keys
}

async function generateMissingTranslations(autoFix = false) {
  console.log('\n' + '='.repeat(80))
  console.log('🤖 TRANSLATION AGENT')
  console.log('='.repeat(80) + '\n')
  
  const nlKeys = getAllKeys(nl)
  const missing: Record<string, { key: string; nlText: string }[]> = {
    en: [],
    tr: [],
    ro: [],
  }
  
  // Find missing translations
  for (const key of nlKeys) {
    const nlValue = getValueByKey(nl, key)
    
    if (typeof nlValue !== 'string') continue
    
    if (!getValueByKey(en, key)) {
      missing.en.push({ key, nlText: nlValue })
    }
    if (!getValueByKey(tr, key)) {
      missing.tr.push({ key, nlText: nlValue })
    }
    if (!getValueByKey(ro, key)) {
      missing.ro.push({ key, nlText: nlValue })
    }
  }
  
  const totalMissing = missing.en.length + missing.tr.length + missing.ro.length
  
  if (totalMissing === 0) {
    console.log('✅ No missing translations found!\n')
    return
  }
  
  console.log(`📊 Found ${totalMissing} missing translations:\n`)
  console.log(`   EN: ${missing.en.length}`)
  console.log(`   TR: ${missing.tr.length}`)
  console.log(`   RO: ${missing.ro.length}\n`)
  
  if (!autoFix) {
    console.log('💡 Run with --auto-fix to automatically generate translations\n')
    console.log('⚠️  Note: This will use placeholder translations.')
    console.log('   You should review and update them with proper translations.\n')
    
    // Generate translation suggestions file
    const suggestions: any = {
      generated: new Date().toISOString(),
      suggestions: {},
    }
    
    for (const lang of ['en', 'tr', 'ro'] as const) {
      suggestions.suggestions[lang] = missing[lang].map(item => ({
        key: item.key,
        nlText: item.nlText,
        suggestedTranslation: `[TRANSLATE: ${item.nlText} to ${lang.toUpperCase()}]`,
      }))
    }
    
    fs.writeFileSync(
      path.join(process.cwd(), 'i18n-translation-suggestions.json'),
      JSON.stringify(suggestions, null, 2)
    )
    
    console.log('✅ Translation suggestions saved to: i18n-translation-suggestions.json\n')
    return
  }
  
  // Auto-fix mode
  console.log('🔄 Generating translations...\n')
  
  const translations = { en, tr, ro }
  
  for (const lang of ['en', 'tr', 'ro'] as const) {
    console.log(`   Processing ${lang.toUpperCase()}...`)
    
    for (const item of missing[lang]) {
      const translation = await translateText(item.nlText, lang)
      setValueByKey(translations[lang], item.key, translation)
    }
    
    console.log(`   ✅ Added ${missing[lang].length} translations for ${lang.toUpperCase()}\n`)
  }
  
  // Write updated translation files
  const translationsDir = path.join(process.cwd(), 'lib/i18n/translations')
  
  fs.writeFileSync(
    path.join(translationsDir, 'en.ts'),
    `export const en = ${JSON.stringify(translations.en, null, 2).replace(/"/g, "'")}\n`
  )
  
  fs.writeFileSync(
    path.join(translationsDir, 'tr.ts'),
    `export const tr = ${JSON.stringify(translations.tr, null, 2).replace(/"/g, "'")}\n`
  )
  
  fs.writeFileSync(
    path.join(translationsDir, 'ro.ts'),
    `export const ro = ${JSON.stringify(translations.ro, null, 2).replace(/"/g, "'")}\n`
  )
  
  console.log('✅ Translation files updated!')
  console.log('⚠️  Please review the generated translations and update them as needed.\n')
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const autoFix = args.includes('--auto-fix')
  
  try {
    await generateMissingTranslations(autoFix)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { generateMissingTranslations }
