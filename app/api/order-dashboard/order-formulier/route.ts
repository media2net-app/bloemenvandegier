import { NextResponse } from 'next/server'
import {
  createOrderFromForm,
  getWcAdminOrderUrl,
  searchOrderFormCustomers,
  searchOrderFormProducts,
  type CreateOrderFormInput,
  type OrderFormShippingValue,
} from '@/lib/woocommerce/order-formulier'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'products'
    const q = (searchParams.get('q') || '').trim()

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] })
    }

    if (type === 'customers') {
      const results = await searchOrderFormCustomers(q)
      return NextResponse.json({ results })
    }

    const results = await searchOrderFormProducts(q)
    return NextResponse.json({ results })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Zoeken mislukt'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderFormInput

    if (!body.firstName?.trim() || !body.lastName?.trim()) {
      return NextResponse.json({ error: 'Voornaam en achternaam zijn verplicht.' }, { status: 400 })
    }
    if (!body.address1?.trim() || !body.postcode?.trim() || !body.city?.trim()) {
      return NextResponse.json({ error: 'Adres, postcode en plaats zijn verplicht.' }, { status: 400 })
    }
    if (!body.deliveryDate?.trim()) {
      return NextResponse.json({ error: 'Bezorgdatum is verplicht.' }, { status: 400 })
    }
    if (!body.shippingMethod) {
      return NextResponse.json({ error: 'Kies een leveringsmethode.' }, { status: 400 })
    }

    const order = await createOrderFromForm({
      ...body,
      shippingMethod: body.shippingMethod as OrderFormShippingValue,
    })

    return NextResponse.json({
      order: {
        id: order.id,
        number: order.number,
        status: order.status,
        total: order.total,
      },
      dashboardUrl: `/order-dashboard/${order.id}`,
      adminUrl: getWcAdminOrderUrl(order.id),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Order aanmaken mislukt'
    const status = message.includes('Testmodus') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
