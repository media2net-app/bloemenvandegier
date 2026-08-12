import { NextResponse } from 'next/server'
import { getWcOrder } from '@/lib/woocommerce/orders'
import {
  findShipmentsByOrderNumbers,
  resolveLabelsPdf,
} from '@/lib/pakketpartner/shipments'
import { PakketpartnerApiError } from '@/lib/pakketpartner/client'
import {
  isOrderDashboardTestMode,
  TEST_MODE_BLOCK_MESSAGE,
} from '@/lib/order-dashboard/test-mode'

export const dynamic = 'force-dynamic'

/**
 * GET ?numbers=209645,209647 → JSON status van labels
 * GET ?pdf=1&numbers=... → PDF (alleen bestaande, geen create)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const numbersParam = searchParams.get('numbers') || searchParams.get('order') || ''
    const numbers = numbersParam
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean)

    if (!numbers.length) {
      return NextResponse.json({ error: 'Geen ordernummers opgegeven' }, { status: 400 })
    }

    const wantPdf = searchParams.get('pdf') === '1' || searchParams.get('format') === 'pdf'
    const { found, missing } = await findShipmentsByOrderNumbers(numbers)

    if (wantPdf) {
      if (!found.length) {
        return NextResponse.json(
          {
            error: `Geen Pakketpartner-label gevonden voor ${numbers.join(', ')}`,
            missing,
          },
          { status: 404 }
        )
      }
      const { fetchLabelsPdf } = await import('@/lib/pakketpartner/shipments')
      const pdf = await fetchLabelsPdf(found.map((f) => f.shipment.id))
      return new NextResponse(new Uint8Array(pdf), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="labels-${numbers.slice(0, 3).join('-')}.pdf"`,
          'Cache-Control': 'no-store',
        },
      })
    }

    return NextResponse.json({
      found: found.map(({ orderNumber, shipment }) => ({
        orderNumber,
        shipmentId: shipment.id,
        carrier: shipment.carrier,
        trackingCode: shipment.tracking_code || shipment.labels?.[0]?.tracking_code || null,
        trackingUrl: shipment.tracking_url || shipment.labels?.[0]?.tracking_url || null,
        labelUrl: shipment.label_url_pdf || shipment.labels?.[0]?.label_url_pdf || null,
      })),
      missing,
    })
  } catch (error) {
    if (error instanceof PakketpartnerApiError) {
      return NextResponse.json(
        { error: error.message, details: error.payload },
        { status: error.status || 500 }
      )
    }
    const message = error instanceof Error ? error.message : 'Labels ophalen mislukt'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * POST { orderIds: number[], createMissing?: boolean }
 * → PDF met labels (maakt ontbrekende shipments aan indien createMissing)
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      orderIds?: number[]
      orderNumbers?: Array<string | number>
      createMissing?: boolean
      carrierService?: string
    }

    const orderIds = Array.isArray(body.orderIds) ? body.orderIds : []
    const orderNumbers = Array.isArray(body.orderNumbers) ? body.orderNumbers.map(String) : []
    const carrierService =
      typeof body.carrierService === 'string' && body.carrierService.trim()
        ? body.carrierService.trim()
        : undefined

    if (!orderIds.length && !orderNumbers.length) {
      return NextResponse.json({ error: 'Geen orders opgegeven' }, { status: 400 })
    }

    if (body.createMissing === true && isOrderDashboardTestMode()) {
      return NextResponse.json(
        {
          error: TEST_MODE_BLOCK_MESSAGE,
          testMode: true,
        },
        { status: 403 }
      )
    }

    const orders = []
    for (const id of orderIds) {
      orders.push(await getWcOrder(id))
    }
    // orderNumbers zonder id: zoek via WC order id = number (vaak gelijk bij hen)
    for (const num of orderNumbers) {
      if (orders.some((o) => String(o.number) === String(num))) continue
      try {
        orders.push(await getWcOrder(num))
      } catch {
        // skip
      }
    }

    if (!orders.length) {
      return NextResponse.json({ error: 'Geen WooCommerce-orders geladen' }, { status: 404 })
    }

    const result = await resolveLabelsPdf({
      orders,
      createMissing: body.createMissing === true,
      carrierService,
    })

    return new NextResponse(new Uint8Array(result.pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="pakketpartner-labels.pdf"`,
        'Cache-Control': 'no-store',
        'X-Labels-Created': result.created.join(','),
        'X-Labels-Missing': result.missing.join(','),
        'X-Shipments': result.shipmentIds.join(','),
      },
    })
  } catch (error) {
    if (error instanceof PakketpartnerApiError) {
      return NextResponse.json(
        { error: error.message, details: error.payload },
        { status: error.status || 500 }
      )
    }
    const message = error instanceof Error ? error.message : 'Labels printen mislukt'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
