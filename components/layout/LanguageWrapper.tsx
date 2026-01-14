'use client'

import { useEffect } from 'react'
import { useI18n } from '@/lib/i18n/context'

export default function LanguageWrapper() {
  const { language } = useI18n()

  useEffect(() => {
    // Update HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  return null
}
