import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const API_URL = process.env.OLD_SHOP_API_URL || 'https://www.bloemenvandegier.nl'
    const CONSUMER_KEY = process.env.OLD_SHOP_CONSUMER_KEY || 'ck_5f1749f0b41cbd3bd84b7d311d64331a2c3e41a5'
    const CONSUMER_SECRET = process.env.OLD_SHOP_CONSUMER_SECRET || 'cs_a6047810c04fbdfd0af5139720b9a765752daf4c'
    
    const baseUrl = API_URL.replace(/\/$/, '')
    const wcApiUrl = `${baseUrl}/wp-json/wc/v3/orders`
    
    // Test with just 1 order from 2025
    const url = new URL(wcApiUrl)
    url.searchParams.append('consumer_key', CONSUMER_KEY)
    url.searchParams.append('consumer_secret', CONSUMER_SECRET)
    url.searchParams.append('after', '2025-01-01T00:00:00')
    url.searchParams.append('before', '2025-12-31T23:59:59')
    url.searchParams.append('status', 'completed,processing')
    url.searchParams.append('per_page', '1')
    url.searchParams.append('page', '1')

    console.log('Testing WooCommerce API:', url.toString().replace(CONSUMER_SECRET, '***'))

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: errorText.substring(0, 500),
        url: url.toString().replace(CONSUMER_SECRET, '***'),
      }, { status: 500 })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      status: response.status,
      ordersReceived: Array.isArray(data) ? data.length : 0,
      isArray: Array.isArray(data),
      firstOrderSample: Array.isArray(data) && data.length > 0 ? {
        id: data[0].id,
        date_created: data[0].date_created,
        total: data[0].total,
        status: data[0].status,
      } : null,
      fullResponse: data,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : typeof error,
    }, { status: 500 })
  }
}
