import { nl } from './nl'
import { en } from './en'
import { tr } from './tr'
import { ro } from './ro'

export type Language = 'nl' | 'en' | 'tr' | 'ro'

export const translations = {
  nl,
  en,
  tr,
  ro,
} as const

export type TranslationKey = keyof typeof nl

// Helper to get nested translation with placeholder support
export function getTranslation(
  lang: Language,
  key: string,
  placeholders?: Record<string, string | number>
): string {
  const keys = key.split('.')
  let value: any = translations[lang]

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k as keyof typeof value]
    } else {
      return key // Return key if translation not found
    }
  }

  let result = typeof value === 'string' ? value : key
  
  // Replace placeholders
  if (placeholders) {
    Object.entries(placeholders).forEach(([placeholder, replacement]) => {
      result = result.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(replacement))
    })
  }

  return result
}
