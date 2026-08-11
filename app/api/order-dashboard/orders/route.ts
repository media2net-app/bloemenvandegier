import { NextResponse } from 'next/server'
import { listWcOrders, slimOrderForList } from '@/lib/woocommerce/orders'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') || '1')
    const perPage = Math.min(Number(searchParams.get('per_page') || '500'), 500)
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined
    const deliveryDate = searchParams.get('delivery_date') || undefined
    const shippingSlot = searchParams.get('shipping_slot') || undefined
    const sortParam = searchParams.get('sort')
    const sort =
      sortParam === 'newest' || sortParam === 'pakketpartner' ? sortParam : undefined

    const result = await listWcOrders({
      page,
      perPage,
      status,
      search,
      deliveryDate,
      shippingSlot,
      sort,
    })
    return NextResponse.json({
      orders: (result.data || []).map(slimOrderForList),
      total: result.total,
      totalPages: result.totalPages,
      page,
      perPage,
    })
  } catch (error) {
    console.error('[order-dashboard/orders]', error)
    const message = error instanceof Error ? error.message : 'Orders ophalen mislukt'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
