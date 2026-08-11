import { NextResponse } from 'next/server'
import { getWcOrder } from '@/lib/woocommerce/orders'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await getWcOrder(params.id)
    return NextResponse.json({ order })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Order ophalen mislukt'
    const status = message.includes('404') ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
