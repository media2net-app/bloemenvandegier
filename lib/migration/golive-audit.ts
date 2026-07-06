import fs from 'fs'
import path from 'path'
import { readMigrationSnapshot } from './snapshot'

const ROOT = process.cwd()

export interface GoliveAuditCheck {
  id: string
  label: string
  passed: boolean
  detail: string
  owner: string
}

export interface GoliveAuditReport {
  generatedAt: string
  checks: GoliveAuditCheck[]
  passed: number
  total: number
  readyForDomainSwitch?: boolean
  shop?: {
    name: string
    myshopifyDomain: string
    primaryDomain?: { host: string; sslEnabled?: boolean }
  }
}

export function readGoliveAudit(): GoliveAuditReport | null {
  const file = path.join(ROOT, 'data/import/shopify-golive-audit.json')
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf-8')) as GoliveAuditReport
    } catch {
      return null
    }
  }
  return readMigrationSnapshot()?.goliveAudit ?? null
}

export function isPaymentConfigured(audit: GoliveAuditReport | null): boolean {
  return audit?.checks?.find((c) => c.id === 'shopify-payments')?.passed === true
}

export function isGiftCardsEnabled(audit: GoliveAuditReport | null): boolean {
  return audit?.checks?.find((c) => c.id === 'gift-cards')?.passed === true
}

export function isDomainLive(audit: GoliveAuditReport | null): boolean {
  return audit?.checks?.find((c) => c.id === 'custom-domain')?.passed === true
}
