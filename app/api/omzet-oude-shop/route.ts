import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Increase timeout for this route (Vercel/Next.js allows up to 300 seconds for Pro plans)
export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Get country filter from query parameters
    const { searchParams } = new URL(request.url)
    const countryFilter = searchParams.get('country') || 'all' // 'all', 'NL', or 'BE'
    const forceRefresh = searchParams.get('refresh') === 'true' // Force refresh from API
    
    // Try to load cached data first
    const dataFilePath = path.join(process.cwd(), 'data', 'omzet-2025.json')
    
    if (!forceRefresh && fs.existsSync(dataFilePath)) {
      try {
        const cachedData = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'))
        console.log(`Using cached data from ${cachedData.lastUpdated || 'unknown date'}`)
        
        // Filter by country if needed
        if (countryFilter !== 'all') {
          const filteredData = {
            ...cachedData,
            monthlyBreakdown: cachedData.monthlyBreakdown?.filter((item: any) => item.landCode === countryFilter) || [],
            // Recalculate totals for filtered country
            totalRevenue: cachedData.monthlyBreakdown
              ?.filter((item: any) => item.landCode === countryFilter)
              .reduce((sum: number, item: any) => sum + item.brutoOmzet, 0) || 0,
            totalRefunds: cachedData.monthlyBreakdown
              ?.filter((item: any) => item.landCode === countryFilter)
              .reduce((sum: number, item: any) => sum + item.refundsBedrag, 0) || 0,
            orderCount: cachedData.monthlyBreakdown
              ?.filter((item: any) => item.landCode === countryFilter)
              .reduce((sum: number, item: any) => sum + item.bestellingen, 0) || 0,
          }
          
          // Recalculate monthly revenue for filtered country
          const filteredMonthlyRevenue: Record<number, number> = {}
          const filteredMonthlyRefunds: Record<number, number> = {}
          
          filteredData.monthlyBreakdown?.forEach((item: any) => {
            filteredMonthlyRevenue[item.maand] = (filteredMonthlyRevenue[item.maand] || 0) + item.brutoOmzet
            filteredMonthlyRefunds[item.maand] = (filteredMonthlyRefunds[item.maand] || 0) + item.refundsBedrag
          })
          
          filteredData.monthlyRevenue = filteredMonthlyRevenue
          filteredData.monthlyRefunds = filteredMonthlyRefunds
          filteredData.netRevenue = filteredData.totalRevenue - filteredData.totalRefunds
          filteredData.averagePerMonth = filteredData.totalRevenue / 12
          
          // Find highest month
          let highestMonth = 0
          let highestAmount = 0
          Object.entries(filteredMonthlyRevenue).forEach(([month, amount]) => {
            if (amount > highestAmount) {
              highestAmount = amount
              highestMonth = parseInt(month)
            }
          })
          filteredData.highestMonth = highestMonth
          filteredData.highestAmount = highestAmount
          
          return NextResponse.json(filteredData)
        }
        
        return NextResponse.json(cachedData)
      } catch (error) {
        console.error('Error reading cached data, falling back to API:', error)
        // Fall through to API fetch
      }
    }
    
    // If no cached data or force refresh, fetch from API
    console.log('Fetching data from WooCommerce API...')
    // WooCommerce API credentials
    const API_URL = process.env.OLD_SHOP_API_URL || 'https://www.bloemenvandegier.nl'
    const CONSUMER_KEY = process.env.OLD_SHOP_CONSUMER_KEY || 'ck_5f1749f0b41cbd3bd84b7d311d64331a2c3e41a5'
    const CONSUMER_SECRET = process.env.OLD_SHOP_CONSUMER_SECRET || 'cs_a6047810c04fbdfd0af5139720b9a765752daf4c'
    
    if (!API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
      return NextResponse.json(
        { 
          error: 'API credentials not configured',
          hint: 'Please set OLD_SHOP_API_URL, OLD_SHOP_CONSUMER_KEY and OLD_SHOP_CONSUMER_SECRET environment variables'
        },
        { status: 500 }
      )
    }

    // WooCommerce REST API endpoint
    const baseUrl = API_URL.replace(/\/$/, '') // Remove trailing slash
    const wcApiUrl = `${baseUrl}/wp-json/wc/v3/orders`
    
    // Fetch orders from all of 2025 - Use proper ISO8601 format with timezone (UTC)
    // WooCommerce expects full ISO8601 format: YYYY-MM-DDTHH:MM:SSZ
    const currentYear = 2025
    const startDate = `${currentYear}-01-01T00:00:00Z` // UTC format - Start of year
    const endDate = `${currentYear}-12-31T23:59:59Z`   // UTC format - End of year
    
    console.log(`Fetching orders for all of 2025 (${startDate} to ${endDate})`)
    
    // Fetch all orders with pagination
    // WooCommerce uses consumer_key and consumer_secret as query parameters
    let allOrders: any[] = []
    let page = 1
    const perPage = 100
    let totalPages = 0
    let totalOrdersFromAPI = 0

    // Add timeout and max pages to prevent infinite loops
    const maxPages = 200 // Safety limit (increased for large datasets)
    let requestCount = 0

    console.log(`Starting to fetch orders from ${startDate} to ${endDate}`)

    while (page <= maxPages) {
      requestCount++
      const url = new URL(wcApiUrl)
      url.searchParams.append('consumer_key', CONSUMER_KEY)
      url.searchParams.append('consumer_secret', CONSUMER_SECRET)
      url.searchParams.append('after', startDate)
      url.searchParams.append('before', endDate)
      // Get all statuses including refunded (we need refunded orders to calculate refunds correctly)
      // WooCommerce accepts multiple statuses: completed,processing,pending,on-hold,refunded
      url.searchParams.append('status', 'completed,processing,pending,on-hold,refunded')
      url.searchParams.append('per_page', perPage.toString())
      url.searchParams.append('page', page.toString())
      // Only fetch the fields we need to reduce response size
      // Note: WooCommerce doesn't support field selection in v3, but we'll keep this for future compatibility

      console.log(`Fetching page ${page} from WooCommerce API...`)

      try {
        // Add timeout to fetch (60 seconds per request - increased for reliability)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000)

        const response = await fetch(url.toString(), {
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`WooCommerce API error (page ${page}):`, response.status, errorText)
          throw new Error(`WooCommerce API request failed: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`)
        }

        // Get pagination info from headers
        const totalHeader = response.headers.get('X-WP-Total')
        const totalPagesHeader = response.headers.get('X-WP-TotalPages')
        
        if (totalHeader && page === 1) {
          totalOrdersFromAPI = parseInt(totalHeader, 10)
          totalPages = parseInt(totalPagesHeader || '1', 10)
          console.log(`Total orders available: ${totalOrdersFromAPI} across ${totalPages} pages`)
        }

        const orders = await response.json()
        
        if (!Array.isArray(orders)) {
          console.error('Unexpected response format:', typeof orders, Object.keys(orders))
          throw new Error('API returned non-array response')
        }

        if (orders.length === 0) {
          console.log(`No more orders on page ${page}, stopping pagination`)
          break
        }

        // Include all orders except cancelled and failed (refunded orders should be included for accurate totals)
        const validOrders = orders.filter((order: any) => {
          const status = order.status?.toLowerCase() || ''
          return status !== 'cancelled' && status !== 'failed'
        })

        allOrders = [...allOrders, ...validOrders]
        console.log(`Fetched ${orders.length} orders (${validOrders.length} valid, total: ${allOrders.length})`)

        // Check if we've reached the last page
        if (totalPages > 0 && page >= totalPages) {
          console.log(`Reached last page (${totalPages})`)
          break
        }

        // Also check if we got less than per_page (safety check)
        if (orders.length < perPage) {
          console.log(`Received less than ${perPage} orders, assuming last page`)
          break
        }

        page++
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error(`Request timeout after 60 seconds (fetched ${allOrders.length} orders so far)`)
        }
        throw fetchError
      }
    }

    if (page > maxPages) {
      console.warn(`Reached max pages limit (${maxPages}), stopping pagination. Total fetched: ${allOrders.length}`)
    }

    console.log(`Total orders fetched: ${allOrders.length} from ${requestCount} requests`)
    
    // Calculate detailed monthly data per country
    // Structure: monthlyData[month][country] = { ... }
    interface MonthlyCountryData {
      orders: number
      brutoOmzet: number
      nettoOmzet: number
      btw: number
      shipping: number
      korting: number
      refundsBedrag: number
      refundsAantal: number
      items: number
      avgOrder: number
    }
    
    const monthlyData: Record<number, Record<string, MonthlyCountryData>> = {}
    const ordersByCountry: Record<string, number> = { NL: 0, BE: 0, other: 0 }

    // Initialize monthly data structure
    for (let month = 1; month <= 12; month++) {
      monthlyData[month] = {
        NL: {
          orders: 0,
          brutoOmzet: 0,
          nettoOmzet: 0,
          btw: 0,
          shipping: 0,
          korting: 0,
          refundsBedrag: 0,
          refundsAantal: 0,
          items: 0,
          avgOrder: 0,
        },
        BE: {
          orders: 0,
          brutoOmzet: 0,
          nettoOmzet: 0,
          btw: 0,
          shipping: 0,
          korting: 0,
          refundsBedrag: 0,
          refundsAantal: 0,
          items: 0,
          avgOrder: 0,
        },
        other: {
          orders: 0,
          brutoOmzet: 0,
          nettoOmzet: 0,
          btw: 0,
          shipping: 0,
          korting: 0,
          refundsBedrag: 0,
          refundsAantal: 0,
          items: 0,
          avgOrder: 0,
        },
      }
    }

    // Process all orders and calculate detailed monthly data per country
    allOrders.forEach((order: any) => {
      // Get country
      const billingCountry = order.billing?.country || ''
      const shippingCountry = order.shipping?.country || ''
      const orderCountry = billingCountry || shippingCountry || ''
      const country = orderCountry === 'NL' ? 'NL' : orderCountry === 'BE' ? 'BE' : 'other'
      
      // Count orders by country
      ordersByCountry[country]++
      
      // Skip if country filter is set and order doesn't match
      if (countryFilter !== 'all' && orderCountry !== countryFilter) {
        return
      }
      try {
        // Use date_created_gmt for consistent UTC-based month calculation
        const orderDateStr = order.date_created_gmt || order.date_created
        if (!orderDateStr) {
          console.warn('Order missing date:', order.id)
          return
        }
        
        const orderDate = new Date(orderDateStr)
        if (isNaN(orderDate.getTime())) {
          console.warn('Invalid date for order:', order.id, orderDateStr)
          return
        }
        
        // Get month (1-12) from the date
        const month = orderDate.getMonth() + 1
        const monthData = monthlyData[month][country]
        
        // Order totals
        const orderTotal = parseFloat(order.total || '0') // Bruto omzet
        const orderTotalTax = parseFloat(order.total_tax || '0') // BTW
        const shippingTotal = parseFloat(order.shipping_total || '0') // Shipping
        const discountTotal = parseFloat(order.discount_total || '0') // Korting
        const netTotal = orderTotal - orderTotalTax // Netto omzet (bruto - BTW)
        
        // Count items
        let itemCount = 0
        if (order.line_items && Array.isArray(order.line_items)) {
          itemCount = order.line_items.reduce((sum: number, item: any) => {
            return sum + parseInt(item.quantity || '0', 10)
          }, 0)
        }
        
        // Calculate refunds
        let orderRefunds = 0
        let refundCount = 0
        if (order.refunds && Array.isArray(order.refunds) && order.refunds.length > 0) {
          orderRefunds = order.refunds.reduce((sum: number, refund: any) => {
            const refundTotal = Math.abs(parseFloat(refund.total || '0'))
            return sum + refundTotal
          }, 0)
          refundCount = order.refunds.length
        }
        
        // Update monthly data for this country
        monthData.orders++
        monthData.brutoOmzet += orderTotal
        monthData.nettoOmzet += netTotal
        monthData.btw += orderTotalTax
        monthData.shipping += shippingTotal
        monthData.korting += discountTotal
        monthData.refundsBedrag += orderRefunds
        monthData.refundsAantal += refundCount
        monthData.items += itemCount
        
      } catch (err) {
        console.warn('Error processing order:', order.id, err)
        // Skip invalid orders
      }
    })
    
    // Calculate averages and format data for response
    const monthlyBreakdown: any[] = []
    let totalRevenue = 0
    let totalRefunds = 0
    let totalOrders = 0
    const monthlyRevenue: Record<number, number> = {}
    const monthlyRefunds: Record<number, number> = {}
    
    for (let month = 1; month <= 12; month++) {
      const monthDataForMonth = monthlyData[month]
      
      // Process each country
      Object.entries(monthDataForMonth).forEach(([countryCode, data]) => {
        if (data.orders > 0) {
          // Calculate average order value
          data.avgOrder = data.brutoOmzet / data.orders
          
          // Round all values
          const roundedData = {
            maand: month,
            land: countryCode === 'NL' ? 'Nederland' : countryCode === 'BE' ? 'België' : 'Overig',
            landCode: countryCode,
            bestellingen: data.orders,
            brutoOmzet: Math.round(data.brutoOmzet * 100) / 100,
            nettoOmzet: Math.round(data.nettoOmzet * 100) / 100,
            btw: Math.round(data.btw * 100) / 100,
            shipping: Math.round(data.shipping * 100) / 100,
            korting: Math.round(data.korting * 100) / 100,
            refundsBedrag: Math.round(data.refundsBedrag * 100) / 100,
            refundsAantal: data.refundsAantal,
            items: data.items,
            avgOrder: Math.round(data.avgOrder * 100) / 100,
          }
          
          monthlyBreakdown.push(roundedData)
          
          // Add to totals (only if country filter matches or is 'all')
          if (countryFilter === 'all' || countryCode === countryFilter) {
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + data.brutoOmzet
            monthlyRefunds[month] = (monthlyRefunds[month] || 0) + data.refundsBedrag
            totalRevenue += data.brutoOmzet
            totalRefunds += data.refundsBedrag
            totalOrders += data.orders
          }
        }
      })
    }
    
    // Calculate net revenue (bruto - refunds)
    const netRevenue = totalRevenue - totalRefunds
    const orderCount = totalOrders

    // Calculate average per month (over all 12 months)
    const averagePerMonth = totalRevenue / 12

    // Find highest month
    let highestMonth = 0
    let highestAmount = 0
    Object.entries(monthlyRevenue).forEach(([month, amount]) => {
      if (amount > highestAmount) {
        highestAmount = amount
        highestMonth = parseInt(month)
      }
    })

    const responseData = {
      totalRevenue: Math.round(totalRevenue * 100) / 100, // Bruto verkoop
      netRevenue: Math.round(netRevenue * 100) / 100, // Netto verkoop
      totalRefunds: Math.round(totalRefunds * 100) / 100,
      averagePerMonth: Math.round(averagePerMonth * 100) / 100,
      highestMonth,
      highestAmount: Math.round(highestAmount * 100) / 100,
      monthlyRevenue: Object.fromEntries(
        Object.entries(monthlyRevenue).map(([k, v]) => [k, Math.round(v * 100) / 100])
      ),
      monthlyRefunds: Object.fromEntries(
        Object.entries(monthlyRefunds).map(([k, v]) => [k, Math.round(v * 100) / 100])
      ),
      orderCount,
      monthlyBreakdown, // Detailed breakdown per month and country
      ordersByCountry: ordersByCountry,
      lastUpdated: new Date().toISOString(),
    }
    
    // Save to cache file (only if countryFilter is 'all' to avoid overwriting with partial data)
    if (countryFilter === 'all') {
      try {
        const dataDir = path.join(process.cwd(), 'data')
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true })
        }
        const filePath = path.join(dataDir, 'omzet-2025.json')
        fs.writeFileSync(filePath, JSON.stringify(responseData, null, 2), 'utf-8')
        console.log('Data cached to', filePath)
      } catch (error) {
        console.warn('Failed to cache data:', error)
      }
    }
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching omzet data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch omzet data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
