import { NextResponse } from 'next/server'
import { getMigrationStatus } from '@/lib/migration/status'
import { getWooCommerceStatus } from '@/lib/migration/woocommerce'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const status = getMigrationStatus()
    const woocommerce = await getWooCommerceStatus().catch(() => ({
      connected: false,
      hasCredentials: Boolean(process.env.WC_CONSUMER_KEY),
      storeUrl: process.env.WC_STORE_URL ?? null,
      productTotal: null,
      lastFetchAt: null,
      manifestCounts: null,
      message: 'WC status check mislukt',
    }))
    return NextResponse.json({ ...status, woocommerce })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Onbekende fout'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
