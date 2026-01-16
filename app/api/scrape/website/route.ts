import { NextRequest, NextResponse } from 'next/server'

interface ScrapeResult {
  email?: string
  emails?: string[]
  phone?: string
  website?: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { website, companyName } = body

    if (!website && !companyName) {
      return NextResponse.json(
        { error: 'Website URL or company name is required' },
        { status: 400 }
      )
    }

    // If no website provided, try to construct one from company name
    let urlToScrape = website
    if (!urlToScrape && companyName) {
      // Try common domain patterns
      const domain = companyName.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '')
        .replace(/school|lyceum|gymnasium|college|academie/gi, '')
      
      // Try .nl first (most common for Dutch schools)
      urlToScrape = `https://www.${domain}.nl`
    }

    if (!urlToScrape) {
      return NextResponse.json(
        { error: 'Could not determine website URL' },
        { status: 400 }
      )
    }

    // Ensure URL has protocol
    if (!urlToScrape.startsWith('http://') && !urlToScrape.startsWith('https://')) {
      urlToScrape = `https://${urlToScrape}`
    }

    // Scrape the website
    const result = await scrapeWebsite(urlToScrape)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error scraping website:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        email: undefined,
        emails: [],
        phone: undefined,
        website: undefined
      },
      { status: 500 }
    )
  }
}

async function scrapeWebsite(url: string): Promise<ScrapeResult> {
  try {
    // Fetch the website
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
      },
      // Set timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()

    // Extract emails using regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const emails = html.match(emailRegex) || []

    // Filter out common non-contact emails
    const filteredEmails = emails
      .filter(email => {
        const lower = email.toLowerCase()
        // Exclude common non-contact emails
        return !lower.includes('example.com') &&
               !lower.includes('test.com') &&
               !lower.includes('placeholder') &&
               !lower.includes('noreply') &&
               !lower.includes('no-reply') &&
               !lower.includes('donotreply') &&
               !lower.includes('privacy') &&
               !lower.includes('gdpr') &&
               !lower.includes('unsubscribe')
      })
      .filter((email, index, self) => self.indexOf(email) === index) // Remove duplicates

    // Prioritize common contact emails
    const priorityEmails = ['info', 'contact', 'algemeen', 'administratie', 'secretariaat', 'receptie']
    const sortedEmails = filteredEmails.sort((a, b) => {
      const aPrefix = a.split('@')[0].toLowerCase()
      const bPrefix = b.split('@')[0].toLowerCase()
      const aPriority = priorityEmails.findIndex(p => aPrefix.includes(p))
      const bPriority = priorityEmails.findIndex(p => bPrefix.includes(p))
      
      if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority
      if (aPriority !== -1) return -1
      if (bPriority !== -1) return 1
      return 0
    })

    // Extract phone numbers (Dutch format)
    const phoneRegex = /(?:\+31|0)[\s-]?(?:[1-9]\d{1,2}[\s-]?)?\d{1,2}[\s-]?\d{6,7}/g
    const phones = html.match(phoneRegex) || []
    const cleanedPhones = phones
      .map(phone => phone.replace(/[\s-]/g, ''))
      .filter((phone, index, self) => self.indexOf(phone) === index)
      .slice(0, 1) // Take first phone number

    // Try to find contact page
    let contactPageEmail: string | undefined
    if (sortedEmails.length === 0) {
      try {
        const contactUrls = [
          `${url}/contact`,
          `${url}/contact.html`,
          `${url}/contacten`,
          `${url}/contactgegevens`,
          `${url}/over-ons/contact`,
        ]

        for (const contactUrl of contactUrls) {
          try {
            const contactResponse = await fetch(contactUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              },
              signal: AbortSignal.timeout(5000),
            })

            if (contactResponse.ok) {
              const contactHtml = await contactResponse.text()
              const contactEmails = contactHtml.match(emailRegex) || []
              const filteredContactEmails = contactEmails
                .filter(email => {
                  const lower = email.toLowerCase()
                  return !lower.includes('example.com') &&
                         !lower.includes('noreply') &&
                         !lower.includes('no-reply')
                })
                .filter((email, index, self) => self.indexOf(email) === index)

              if (filteredContactEmails.length > 0) {
                contactPageEmail = filteredContactEmails[0]
                break
              }
            }
          } catch (error) {
            // Continue to next contact URL
            continue
          }
        }
      } catch (error) {
        // If contact page scraping fails, continue with main page results
      }
    }

    return {
      email: contactPageEmail || sortedEmails[0] || undefined,
      emails: contactPageEmail ? [contactPageEmail, ...sortedEmails] : sortedEmails,
      phone: cleanedPhones[0] || undefined,
      website: url,
    }

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        error: 'Request timeout - website took too long to respond',
        email: undefined,
        emails: [],
        phone: undefined,
        website: url,
      }
    }

    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      email: undefined,
      emails: [],
      phone: undefined,
      website: url,
    }
  }
}
