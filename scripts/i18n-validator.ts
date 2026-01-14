#!/usr/bin/env ts-node

/**
 * i18n Validator - Validates that all translation keys exist in all languages
 * Usage: npx ts-node scripts/i18n-validator.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { nl } from '../lib/i18n/translations/nl'
import { en } from '../lib/i18n/translations/en'
import { tr } from '../lib/i18n/translations/tr'
import { ro } from '../lib/i18n/translations/ro'

type TranslationObject = typeof nl

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

function validateTranslations() {
  console.log('\n' + '='.repeat(80))
  console.log('🔍 VALIDATING TRANSLATIONS')
  console.log('='.repeat(80) + '\n')
  
  const nlKeys = getAllKeys(nl)
  const enKeys = getAllKeys(en)
  const trKeys = getAllKeys(tr)
  const roKeys = getAllKeys(ro)
  
  const allKeys = new Set([...nlKeys, ...enKeys, ...trKeys, ...roKeys])
  
  const missing: Record<string, string[]> = {
    en: [],
    tr: [],
    ro: [],
  }
  
  // Check each language against NL (source)
  for (const key of nlKeys) {
    const nlValue = getValueByKey(nl, key)
    
    if (!getValueByKey(en, key)) {
      missing.en.push(key)
    }
    if (!getValueByKey(tr, key)) {
      missing.tr.push(key)
    }
    if (!getValueByKey(ro, key)) {
      missing.ro.push(key)
    }
  }
  
  // Check for extra keys in other languages
  const extra: Record<string, string[]> = {
    en: enKeys.filter(k => !nlKeys.includes(k)),
    tr: trKeys.filter(k => !nlKeys.includes(k)),
    ro: roKeys.filter(k => !nlKeys.includes(k)),
  }
  
  // Report
  let hasErrors = false
  
  console.log(`📊 Statistics:`)
  console.log(`   NL (source): ${nlKeys.length} keys`)
  console.log(`   EN: ${enKeys.length} keys`)
  console.log(`   TR: ${trKeys.length} keys`)
  console.log(`   RO: ${roKeys.length} keys\n`)
  
  if (missing.en.length > 0 || missing.tr.length > 0 || missing.ro.length > 0) {
    hasErrors = true
    console.log('❌ MISSING TRANSLATIONS:\n')
    
    if (missing.en.length > 0) {
      console.log(`   EN: ${missing.en.length} missing keys`)
      missing.en.slice(0, 10).forEach(key => {
        console.log(`      - ${key}`)
      })
      if (missing.en.length > 10) {
        console.log(`      ... and ${missing.en.length - 10} more`)
      }
      console.log()
    }
    
    if (missing.tr.length > 0) {
      console.log(`   TR: ${missing.tr.length} missing keys`)
      missing.tr.slice(0, 10).forEach(key => {
        console.log(`      - ${key}`)
      })
      if (missing.tr.length > 10) {
        console.log(`      ... and ${missing.tr.length - 10} more`)
      }
      console.log()
    }
    
    if (missing.ro.length > 0) {
      console.log(`   RO: ${missing.ro.length} missing keys`)
      missing.ro.slice(0, 10).forEach(key => {
        console.log(`      - ${key}`)
      })
      if (missing.ro.length > 10) {
        console.log(`      ... and ${missing.ro.length - 10} more`)
      }
      console.log()
    }
  }
  
  if (extra.en.length > 0 || extra.tr.length > 0 || extra.ro.length > 0) {
    console.log('⚠️  EXTRA KEYS (not in NL source):\n')
    
    if (extra.en.length > 0) {
      console.log(`   EN: ${extra.en.length} extra keys`)
      extra.en.slice(0, 5).forEach(key => console.log(`      - ${key}`))
      if (extra.en.length > 5) console.log(`      ... and ${extra.en.length - 5} more`)
      console.log()
    }
    
    if (extra.tr.length > 0) {
      console.log(`   TR: ${extra.tr.length} extra keys`)
      extra.tr.slice(0, 5).forEach(key => console.log(`      - ${key}`))
      if (extra.tr.length > 5) console.log(`      ... and ${extra.tr.length - 5} more`)
      console.log()
    }
    
    if (extra.ro.length > 0) {
      console.log(`   RO: ${extra.ro.length} extra keys`)
      extra.ro.slice(0, 5).forEach(key => console.log(`      - ${key}`))
      if (extra.ro.length > 5) console.log(`      ... and ${extra.ro.length - 5} more`)
      console.log()
    }
  }
  
  if (!hasErrors) {
    console.log('✅ All translations are complete!\n')
  }
  
  // Generate report
  const report = {
    scanDate: new Date().toISOString(),
    statistics: {
      nl: nlKeys.length,
      en: enKeys.length,
      tr: trKeys.length,
      ro: roKeys.length,
    },
    missing,
    extra,
    isValid: !hasErrors,
  }
  
  fs.writeFileSync(
    path.join(process.cwd(), 'i18n-validation-report.json'),
    JSON.stringify(report, null, 2)
  )
  
  console.log('='.repeat(80))
  console.log(`✅ Validation report saved to: i18n-validation-report.json`)
  console.log('='.repeat(80) + '\n')
  
  return !hasErrors
}

if (require.main === module) {
  const isValid = validateTranslations()
  process.exit(isValid ? 0 : 1)
}

export { validateTranslations }
