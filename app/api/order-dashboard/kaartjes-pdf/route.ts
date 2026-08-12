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

    // WooCommerce fetch is de bottleneck bij grote selecties.
    // Met beperkte parallelheid blijven we onder controle en versnellen we bulk.
    const concurrency = 10
    const orders: Awaited<ReturnType<typeof getWcOrder>>[] = []

    for (let i = 0; i < orderIds.length; i += concurrency) {
      const chunk = orderIds.slice(i, i + concurrency)
      const results = await Promise.all(
        chunk.map(async (id) => {
          try {
            return await getWcOrder(id)
          } catch {
            return null
          }
        })
      )
      for (const r of results) {
        if (r) orders.push(r)
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
