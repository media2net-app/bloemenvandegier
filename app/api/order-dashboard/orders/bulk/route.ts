import { NextResponse } from 'next/server'
import { getWcOrder } from '@/lib/woocommerce/orders'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const ids: number[] = Array.isArray(body.ids)
      ? body.ids.map((id: unknown) => Number(id)).filter((id: number) => Number.isFinite(id) && id > 0)
      : []

    if (!ids.length) {
      return NextResponse.json({ error: 'Geen order-ids opgegeven.' }, { status: 400 })
    }
    if (ids.length > 50) {
      return NextResponse.json({ error: 'Maximaal 50 orders per keer.' }, { status: 400 })
    }

    const orders = []
    const errors: Array<{ id: number; error: string }> = []

    for (const id of ids) {
      try {
        orders.push(await getWcOrder(id))
      } catch (e) {
        errors.push({
          id,
          error: e instanceof Error ? e.message : 'Ophalen mislukt',
        })
      }
    }

    // Behoud selectievolgorde
    const byId = new Map(orders.map((o) => [o.id, o]))
    const sorted = ids.map((id) => byId.get(id)).filter((o): o is NonNullable<typeof o> => Boolean(o))

    return NextResponse.json({ orders: sorted, errors })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bulk ophalen mislukt'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
