'use client'

import { createContext, useContext } from 'react'
import type { MigrationStatus } from '@/lib/migration/status'
import { useMigrationStatus } from './useMigrationStatus'

interface MigrationStatusContextValue {
  status: MigrationStatus | null
  isLoading: boolean
  error: string
  loadStatus: () => Promise<void>
}

const MigrationStatusContext = createContext<MigrationStatusContextValue | null>(null)

export function MigrationStatusProvider({ children }: { children: React.ReactNode }) {
  const value = useMigrationStatus()
  return (
    <MigrationStatusContext.Provider value={value}>{children}</MigrationStatusContext.Provider>
  )
}

export function useMigrationStatusContext() {
  const context = useContext(MigrationStatusContext)
  if (!context) {
    throw new Error('useMigrationStatusContext must be used within MigrationStatusProvider')
  }
  return context
}
