import fs from 'fs'
import os from 'os'
import path from 'path'

export interface ShopifyCliStatus {
  connected: boolean
  hasConfig: boolean
  tokenValid: boolean
  expired: boolean
  email: string | null
  expiresAt: string | null
  configPath: string
  message: string
}

interface CliIdentity {
  accessToken?: string
  refreshToken?: string
  expiresAt?: string
  email?: string
  alias?: string
}

interface CliSessionEntry {
  identity?: CliIdentity
}

function getCliConfigPath() {
  return path.join(os.homedir(), 'Library/Preferences/shopify-cli-kit-nodejs/config.json')
}

function getSessionEntry(config: {
  sessionStore?: string
  currentSessionId?: string
}): CliSessionEntry | null {
  const sessionStore = JSON.parse(config.sessionStore || '{}')
  const account = sessionStore['accounts.shopify.com'] as Record<string, CliSessionEntry> | undefined
  if (!account) return null

  if (config.currentSessionId && account[config.currentSessionId]) {
    return account[config.currentSessionId]
  }

  const first = Object.values(account)[0]
  return first ?? null
}

export function getShopifyCliStatus(): ShopifyCliStatus {
  const configPath = getCliConfigPath()

  if (!fs.existsSync(configPath)) {
    return {
      connected: false,
      hasConfig: false,
      tokenValid: false,
      expired: false,
      email: null,
      expiresAt: null,
      configPath,
      message: 'Niet ingelogd — run: npx @shopify/cli auth login',
    }
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    const entry = getSessionEntry(config)
    const session = entry?.identity

    if (!session?.accessToken) {
      return {
        connected: false,
        hasConfig: true,
        tokenValid: false,
        expired: false,
        email: null,
        expiresAt: null,
        configPath,
        message: 'Geen access token — run: npx @shopify/cli auth login',
      }
    }

    const email = session.alias || session.email || null
    const expired = Boolean(session.expiresAt && new Date(session.expiresAt) < new Date())
    const hasRefreshToken = Boolean(session.refreshToken)

    // CLI vernieuwt tokens automatisch via refreshToken — niet alleen expiresAt checken
    const connected = hasRefreshToken || !expired

    let message = 'Shopify CLI ingelogd'
    if (email) message = `Ingelogd als ${email}`
    if (expired && hasRefreshToken) {
      message = email
        ? `Ingelogd als ${email} (auto-refresh actief)`
        : 'Ingelogd (auto-refresh actief)'
    } else if (expired) {
      message = 'Sessie verlopen — run: npx @shopify/cli auth login'
    }

    return {
      connected,
      hasConfig: true,
      tokenValid: connected,
      expired: expired && !hasRefreshToken,
      email,
      expiresAt: session.expiresAt ?? null,
      configPath,
      message,
    }
  } catch {
    return {
      connected: false,
      hasConfig: true,
      tokenValid: false,
      expired: false,
      email: null,
      expiresAt: null,
      configPath,
      message: 'CLI config onleesbaar',
    }
  }
}
