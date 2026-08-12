import { NextResponse } from 'next/server'
import { getWcOrder } from '@/lib/woocommerce/orders'
import { buildKaartjesPdf } from '@/lib/order-dashboard/kaartje-pdf'

export const dynamic = 'force-dynamic'

/**
 * POST { orderIds: number[] } → PDF met alle kaartjes (A6 liggend, tekst rechts)
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderIds?: number[] }
    const orderIds = Array.isArray(body.orderIds) ? body.orderIds : []
    if (!orderIds.length) {
      return NextResponse.json({ error: 'Geen orders opgegeven' }, { status: 400 })
    }

    const orders = []
    for (const id of orderIds) {
      try {
        orders.push(await getWcOrder(id))
      } catch {
        // skip
      }
    }

    if (!orders.length) {
      return NextResponse.json({ error: 'Geen orders geladen' }, { status: 404 })
    }

    const pdf = await buildKaartjesPdf(orders)
    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="kaartjes.pdf"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Kaartjes-PDF mislukt'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
