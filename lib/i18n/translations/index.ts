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

// Helper to get nested translation
export function getTranslation(
  lang: Language,
  key: string
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

  return typeof value === 'string' ? value : key
}
