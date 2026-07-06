'use client'

import { useCallback, useEffect, useState } from 'react'
import type { MigrationStatus } from '@/lib/migration/status'

export function useMigrationStatus() {
  const [status, setStatus] = useState<MigrationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStatus = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30_000)

      const response = await fetch('/api/migratie/status', {
        signal: controller.signal,
        cache: 'no-store',
      })
      clearTimeout(timeout)

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Kon migratiestatus niet laden')
      }

      const data = await response.json()
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('Ongeldig antwoord van migratie-API')
      }
      setStatus(data)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Timeout — migratiestatus laden duurde te lang')
      } else {
        setError(err instanceof Error ? err.message : 'Onbekende fout')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  return { status, isLoading, error, loadStatus }
}
