import { NextResponse } from 'next/server'
import { readGoliveAudit } from '@/lib/migration/golive-audit'

export const dynamic = 'force-dynamic'

export async function GET() {
  const audit = readGoliveAudit()
  return NextResponse.json({ audit })
}
