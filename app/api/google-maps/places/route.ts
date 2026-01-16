import { NextRequest, NextResponse } from 'next/server'

interface GooglePlace {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  formatted_phone_number?: string
  website?: string
  rating?: number
  user_ratings_total?: number
  types?: string[]
  business_status?: string
  url?: string
}

interface GooglePlacesResponse {
  results: GooglePlace[]
  status: string
  error_message?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const location = searchParams.get('location')
    const type = searchParams.get('type') || 'establishment'

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Get API key from environment variables
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.warn('GOOGLE_MAPS_API_KEY not found in environment variables. Using mock data.')
      // Return mock data if API key is not configured
      return NextResponse.json({
        results: generateMockPlaces(query, location),
        status: 'OK',
        mock: true
      })
    }

    // Build search query
    let searchQuery = query
    if (location) {
      searchQuery = `${query} ${location}`
    }

    // Google Places API Text Search endpoint
    const placesUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    placesUrl.searchParams.set('query', searchQuery)
    placesUrl.searchParams.set('type', type)
    placesUrl.searchParams.set('key', apiKey)
    placesUrl.searchParams.set('language', 'nl')
    placesUrl.searchParams.set('region', 'nl') // Focus on Netherlands

    const response = await fetch(placesUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.statusText}`)
    }

    const data: GooglePlacesResponse = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(data.error_message || `Google Maps API error: ${data.status}`)
    }

    // Transform Google Places data to our format
    // Note: Text Search doesn't always return website, so we'll fetch details for first few results
    // Use Promise.allSettled to handle individual failures gracefully
    const results = data.results.slice(0, 20)
    const transformedResults = await Promise.all(
      results.map(async (place, index) => {
        // Add small delay to respect rate limits (10 requests/second)
        if (index > 0 && index % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        // Extract address components
        const addressParts = place.formatted_address.split(',').map(s => s.trim())
        const postalCodeMatch = addressParts.find(part => /^\d{4}\s?[A-Z]{2}$/.test(part))
        const postalCode = postalCodeMatch || ''
        const city = addressParts[addressParts.length - 1] || ''
        const address = addressParts.slice(0, -1).join(', ') || place.formatted_address

        // Fetch Place Details to get website (if not in text search result)
        let website = place.website
        let phone = place.formatted_phone_number

        // Only fetch details if we're missing website or phone
        if (!website || !phone) {
          try {
            const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
            detailsUrl.searchParams.set('place_id', place.place_id)
            detailsUrl.searchParams.set('fields', 'website,formatted_phone_number,international_phone_number,name')
            detailsUrl.searchParams.set('key', apiKey)
            detailsUrl.searchParams.set('language', 'nl')

            const detailsResponse = await fetch(detailsUrl.toString(), {
              signal: AbortSignal.timeout(5000), // 5 second timeout
            })

            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json()
              if (detailsData.status === 'OK' && detailsData.result) {
                website = website || detailsData.result.website
                phone = phone || detailsData.result.formatted_phone_number || detailsData.result.international_phone_number
              }
            }
          } catch (error) {
            // Silently continue - we'll try to scrape website later if needed
            console.warn(`Failed to fetch details for ${place.name}:`, error instanceof Error ? error.message : 'Unknown error')
          }
        }

        return {
          id: place.place_id,
          companyName: place.name,
          address: address,
          city: city,
          postalCode: postalCode,
          phone: phone || undefined,
          website: website || undefined,
          googleMapsUrl: place.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
          rating: place.rating,
          reviews: place.user_ratings_total,
          category: place.types?.[0] ? formatType(place.types[0]) : undefined,
          description: place.types?.slice(0, 3).join(', ') || undefined,
          scraped: false,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        }
      })
    )

    return NextResponse.json({
      results: transformedResults,
      status: data.status,
      mock: false
    })

  } catch (error) {
    console.error('Error fetching Google Places:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        results: [],
        status: 'ERROR'
      },
      { status: 500 }
    )
  }
}

// Helper function to format Google Place types
function formatType(type: string): string {
  const typeMap: Record<string, string> = {
    'school': 'School',
    'primary_school': 'Basisschool',
    'secondary_school': 'Middelbare School',
    'university': 'Universiteit',
    'establishment': 'Bedrijf',
    'point_of_interest': 'Punt van Interesse',
    'store': 'Winkel',
    'restaurant': 'Restaurant',
    'hospital': 'Ziekenhuis',
    'church': 'Kerk',
    'local_government_office': 'Gemeente',
  }
  return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Mock data generator (fallback when API key is not configured)
function generateMockPlaces(query: string, location: string | null): any[] {
  const baseResults = [
    {
      id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      companyName: 'Stedelijk Gymnasium Amsterdam',
      address: 'Keizersgracht 224',
      city: 'Amsterdam',
      postalCode: '1016 DT',
      phone: '020-6239880',
      website: 'https://www.sga.nl',
      googleMapsUrl: 'https://maps.google.com/?q=Stedelijk+Gymnasium+Amsterdam',
      rating: 4.5,
      reviews: 127,
      category: 'Middelbare School',
      description: 'Openbaar gymnasium voor vwo-onderwijs',
      scraped: false,
      lat: 52.3676,
      lng: 4.9041,
    },
    {
      id: 'ChIJVXeal1euEmsRUKgyFmh9AQM',
      companyName: 'Vossius Gymnasium',
      address: 'Emmastraat 56',
      city: 'Amsterdam',
      postalCode: '1075 AT',
      phone: '020-5771200',
      website: 'https://www.vossius.nl',
      googleMapsUrl: 'https://maps.google.com/?q=Vossius+Gymnasium',
      rating: 4.7,
      reviews: 89,
      category: 'Middelbare School',
      description: 'Categorale school voor gymnasiumonderwijs',
      scraped: false,
      lat: 52.3500,
      lng: 4.8700,
    },
    {
      id: 'ChIJKxJ8l1euEmsRUKgyFmh9AQM',
      companyName: 'Amsterdamse Internationale School',
      address: 'Prinses Irenestraat 59',
      city: 'Amsterdam',
      postalCode: '1077 WV',
      phone: '020-5771240',
      website: 'https://www.aisschool.nl',
      googleMapsUrl: 'https://maps.google.com/?q=Amsterdamse+Internationale+School',
      rating: 4.3,
      reviews: 45,
      category: 'Internationale School',
      description: 'Internationale school voor expats en internationale gezinnen',
      scraped: false,
      lat: 52.3400,
      lng: 4.8600,
    },
    {
      id: 'ChIJLxJ8l1euEmsRUKgyFmh9AQM',
      companyName: 'Montessori Lyceum Amsterdam',
      address: 'Pieter de Hoochstraat 59',
      city: 'Amsterdam',
      postalCode: '1071 ED',
      phone: '020-5771300',
      website: 'https://www.montessori.nl',
      googleMapsUrl: 'https://maps.google.com/?q=Montessori+Lyceum+Amsterdam',
      rating: 4.4,
      reviews: 203,
      category: 'Middelbare School',
      description: 'Montessori-onderwijs voor havo en vwo',
      scraped: false,
      lat: 52.3600,
      lng: 4.8800,
    },
    {
      id: 'ChIJMxJ8l1euEmsRUKgyFmh9AQM',
      companyName: 'Berlage Lyceum',
      address: 'Johan Huizingalaan 763',
      city: 'Amsterdam',
      postalCode: '1066 VH',
      phone: '020-5771400',
      website: 'https://www.berlagelyceum.nl',
      googleMapsUrl: 'https://maps.google.com/?q=Berlage+Lyceum',
      rating: 4.2,
      reviews: 156,
      category: 'Middelbare School',
      description: 'Openbare school voor vmbo, havo en vwo',
      scraped: false,
      lat: 52.3300,
      lng: 4.8500,
    }
  ]

  // Filter by location if provided
  if (location) {
    const locationLower = location.toLowerCase()
    return baseResults.filter(r => 
      r.city.toLowerCase().includes(locationLower) ||
      locationLower.includes(r.city.toLowerCase())
    )
  }

  return baseResults
}
