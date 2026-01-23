import fs from 'fs'
import path from 'path'

// WooCommerce API credentials
const API_URL = process.env.OLD_SHOP_API_URL || 'https://www.bloemenvandegier.nl'
const CONSUMER_KEY = process.env.OLD_SHOP_CONSUMER_KEY || 'ck_5f1749f0b41cbd3bd84b7d311d64331a2c3e41a5'
const CONSUMER_SECRET = process.env.OLD_SHOP_CONSUMER_SECRET || 'cs_a6047810c04fbdfd0af5139720b9a765752daf4c'

const baseUrl = API_URL.replace(/\/$/, '')
const wcApiUrl = `${baseUrl}/wp-json/wc/v3/orders`

// Fetch orders from all of 2025
const currentYear = 2025
const startDate = `${currentYear}-01-01T00:00:00Z`
const endDate = `${currentYear}-12-31T23:59:59Z`

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

async function fetchAllOrders() {
  let allOrders: any[] = []
  let page = 1
  const perPage = 100
  let totalPages = 0
  let totalOrdersFromAPI = 0
  const maxPages = 200
  let requestCount = 0

  console.log(`Starting to fetch orders from ${startDate} to ${endDate}`)

  while (page <= maxPages) {
    requestCount++
    const url = new URL(wcApiUrl)
    url.searchParams.append('consumer_key', CONSUMER_KEY)
    url.searchParams.append('consumer_secret', CONSUMER_SECRET)
    url.searchParams.append('after', startDate)
    url.searchParams.append('before', endDate)
    url.searchParams.append('status', 'completed,processing,pending,on-hold,refunded')
    url.searchParams.append('per_page', perPage.toString())
    url.searchParams.append('page', page.toString())

    console.log(`Fetching page ${page} from WooCommerce API...`)

    try {
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
        throw new Error(`WooCommerce API request failed: ${response.status} ${response.statusText}`)
      }

      const totalHeader = response.headers.get('X-WP-Total')
      const totalPagesHeader = response.headers.get('X-WP-TotalPages')
      
      if (totalHeader && page === 1) {
        totalOrdersFromAPI = parseInt(totalHeader, 10)
        totalPages = parseInt(totalPagesHeader || '1', 10)
        console.log(`Total orders available: ${totalOrdersFromAPI} across ${totalPages} pages`)
      }

      const orders = await response.json()
      
      if (!Array.isArray(orders)) {
        throw new Error('API returned non-array response')
      }

      if (orders.length === 0) {
        console.log(`No more orders on page ${page}, stopping pagination`)
        break
      }

      const validOrders = orders.filter((order: any) => {
        const status = order.status?.toLowerCase() || ''
        return status !== 'cancelled' && status !== 'failed'
      })

      allOrders = [...allOrders, ...validOrders]
      console.log(`Fetched ${orders.length} orders (${validOrders.length} valid, total: ${allOrders.length})`)

      if (totalPages > 0 && page >= totalPages) {
        console.log(`Reached last page (${totalPages})`)
        break
      }

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

  console.log(`Total orders fetched: ${allOrders.length} from ${requestCount} requests`)
  return allOrders
}

function processOrders(allOrders: any[]) {
  const monthlyData: Record<number, Record<string, MonthlyCountryData>> = {}
  const ordersByCountry: Record<string, number> = { NL: 0, BE: 0, other: 0 }

  // Initialize monthly data structure
  for (let month = 1; month <= 12; month++) {
    monthlyData[month] = {
      NL: {
        orders: 0, brutoOmzet: 0, nettoOmzet: 0, btw: 0, shipping: 0, korting: 0,
        refundsBedrag: 0, refundsAantal: 0, items: 0, avgOrder: 0,
      },
      BE: {
        orders: 0, brutoOmzet: 0, nettoOmzet: 0, btw: 0, shipping: 0, korting: 0,
        refundsBedrag: 0, refundsAantal: 0, items: 0, avgOrder: 0,
      },
      other: {
        orders: 0, brutoOmzet: 0, nettoOmzet: 0, btw: 0, shipping: 0, korting: 0,
        refundsBedrag: 0, refundsAantal: 0, items: 0, avgOrder: 0,
      },
    }
  }

  // Process all orders
  allOrders.forEach((order: any) => {
    const billingCountry = order.billing?.country || ''
    const shippingCountry = order.shipping?.country || ''
    const orderCountry = billingCountry || shippingCountry || ''
    const country = orderCountry === 'NL' ? 'NL' : orderCountry === 'BE' ? 'BE' : 'other'
    
    ordersByCountry[country]++

    try {
      const orderDateStr = order.date_created_gmt || order.date_created
      if (!orderDateStr) return

      const orderDate = new Date(orderDateStr)
      if (isNaN(orderDate.getTime())) return

      const month = orderDate.getMonth() + 1
      const monthData = monthlyData[month][country]

      const orderTotal = parseFloat(order.total || '0')
      const orderTotalTax = parseFloat(order.total_tax || '0')
      const shippingTotal = parseFloat(order.shipping_total || '0')
      const discountTotal = parseFloat(order.discount_total || '0')
      const netTotal = orderTotal - orderTotalTax

      let itemCount = 0
      if (order.line_items && Array.isArray(order.line_items)) {
        itemCount = order.line_items.reduce((sum: number, item: any) => {
          return sum + parseInt(item.quantity || '0', 10)
        }, 0)
      }

      let orderRefunds = 0
      let refundCount = 0
      if (order.refunds && Array.isArray(order.refunds) && order.refunds.length > 0) {
        orderRefunds = order.refunds.reduce((sum: number, refund: any) => {
          return sum + Math.abs(parseFloat(refund.total || '0'))
        }, 0)
        refundCount = order.refunds.length
      }

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
    }
  })

  // Calculate averages and format data
  const monthlyBreakdown: any[] = []
  let totalRevenue = 0
  let totalRefunds = 0
  let totalOrders = 0
  const monthlyRevenue: Record<number, number> = {}
  const monthlyRefunds: Record<number, number> = {}

  for (let month = 1; month <= 12; month++) {
    Object.entries(monthlyData[month]).forEach(([countryCode, data]) => {
      if (data.orders > 0) {
        data.avgOrder = data.brutoOmzet / data.orders

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

        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + data.brutoOmzet
        monthlyRefunds[month] = (monthlyRefunds[month] || 0) + data.refundsBedrag
        totalRevenue += data.brutoOmzet
        totalRefunds += data.refundsBedrag
        totalOrders += data.orders
      }
    })
  }

  const netRevenue = totalRevenue - totalRefunds
  const averagePerMonth = totalRevenue / 12

  let highestMonth = 0
  let highestAmount = 0
  Object.entries(monthlyRevenue).forEach(([month, amount]) => {
    if (amount > highestAmount) {
      highestAmount = amount
      highestMonth = parseInt(month)
    }
  })

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    netRevenue: Math.round(netRevenue * 100) / 100,
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
    orderCount: totalOrders,
    monthlyBreakdown,
    ordersByCountry,
    lastUpdated: new Date().toISOString(),
  }
}

async function main() {
  try {
    console.log('Fetching orders from WooCommerce API...')
    const allOrders = await fetchAllOrders()
    
    console.log('Processing orders...')
    const processedData = processOrders(allOrders)
    
    // Save to JSON file
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    const filePath = path.join(dataDir, 'omzet-2025.json')
    fs.writeFileSync(filePath, JSON.stringify(processedData, null, 2), 'utf-8')
    
    console.log(`\n✅ Data successfully saved to ${filePath}`)
    console.log(`Total orders: ${processedData.orderCount}`)
    console.log(`Total revenue: €${processedData.totalRevenue.toFixed(2)}`)
    console.log(`Last updated: ${processedData.lastUpdated}`)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
