'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  MapPin,
  Globe,
  Mail,
  Phone,
  Building2,
  User,
  Download,
  Plus,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  FileText,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'

interface FoundLead {
  id: string
  companyName: string
  address: string
  city: string
  postalCode: string
  phone?: string
  email?: string
  website?: string
  googleMapsUrl?: string
  rating?: number
  reviews?: number
  category?: string
  description?: string
  scraped: boolean
  scrapedAt?: string
  errors?: string[]
}

interface ScrapingProgress {
  total: number
  completed: number
  current?: string
  errors: number
}

export default function LeadFinderPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [foundLeads, setFoundLeads] = useState<FoundLead[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isScraping, setIsScraping] = useState(false)
  const [scrapingProgress, setScrapingProgress] = useState<ScrapingProgress | null>(null)
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('admin_authenticated')
      setIsAuthenticated(!!auth)
      if (!auth) {
        router.push('/admin/login')
      }
    }
  }, [router])

  const handleGoogleMapsSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Voer een zoekterm in (bijv. "middelbare school Amsterdam")')
      return
    }

    setIsSearching(true)
    setShowResults(false)
    setFoundLeads([])

    try {
      // Build API URL
      const apiUrl = new URL('/api/google-maps/places', window.location.origin)
      apiUrl.searchParams.set('query', searchQuery)
      if (location) {
        apiUrl.searchParams.set('location', location)
      }
      if (category) {
        apiUrl.searchParams.set('type', category)
      }

      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.status === 'ERROR' || data.error) {
        throw new Error(data.error || 'Unknown error occurred')
      }

      // Transform API results to FoundLead format
      const results: FoundLead[] = data.results.map((place: any) => ({
        id: place.id,
        companyName: place.companyName,
        address: place.address,
        city: place.city,
        postalCode: place.postalCode,
        phone: place.phone,
        email: undefined, // Will be scraped later
        website: place.website,
        googleMapsUrl: place.googleMapsUrl,
        rating: place.rating,
        reviews: place.reviews,
        category: place.category,
        description: place.description,
        scraped: false,
      }))

      setFoundLeads(results)
      setShowResults(true)

      // Show info if using mock data
      if (data.mock) {
        console.warn('Using mock data. Configure GOOGLE_MAPS_API_KEY in .env.local for real results.')
      }
    } catch (error) {
      console.error('Error searching Google Maps:', error)
      alert(`Fout bij het zoeken: ${error instanceof Error ? error.message : 'Onbekende fout'}. Probeer het opnieuw.`)
    } finally {
      setIsSearching(false)
    }
  }

  const handleScrapeAll = async () => {
    if (foundLeads.length === 0) return

    setIsScraping(true)
    setScrapingProgress({
      total: foundLeads.length,
      completed: 0,
      errors: 0
    })

    const updatedLeads: FoundLead[] = []
    let errorCount = 0

    for (let i = 0; i < foundLeads.length; i++) {
      const lead = foundLeads[i]
      
      setScrapingProgress({
        total: foundLeads.length,
        completed: i,
        current: lead.companyName,
        errors: errorCount
      })

      try {
        const scrapedData = await scrapeWebsiteData(lead)

        updatedLeads.push({
          ...lead,
          ...scrapedData,
          scraped: true,
          scrapedAt: new Date().toISOString()
        })
      } catch (error) {
        errorCount++
        updatedLeads.push({
          ...lead,
          scraped: true,
          errors: [`Fout bij scrapen: ${error instanceof Error ? error.message : 'Onbekende fout'}`]
        })
      }
    }

    setFoundLeads(updatedLeads)
    setIsScraping(false)
    setScrapingProgress(null)
  }

  const handleScrapeSingle = async (lead: FoundLead) => {
    const index = foundLeads.findIndex(l => l.id === lead.id)
    if (index === -1) return

    setIsScraping(true)
    setScrapingProgress({
      total: 1,
      completed: 0,
      current: lead.companyName,
      errors: 0
    })

    try {
      const scrapedData = await scrapeWebsiteData(lead)

      const updatedLeads = [...foundLeads]
      updatedLeads[index] = {
        ...lead,
        ...scrapedData,
        scraped: true,
        scrapedAt: new Date().toISOString()
      }

      setFoundLeads(updatedLeads)
    } catch (error) {
      const updatedLeads = [...foundLeads]
      updatedLeads[index] = {
        ...lead,
        scraped: true,
        errors: [`Fout bij scrapen: ${error instanceof Error ? error.message : 'Onbekende fout'}`]
      }
      setFoundLeads(updatedLeads)
    } finally {
      setIsScraping(false)
      setScrapingProgress(null)
    }
  }

  const handleImportLeads = async () => {
    if (selectedLeads.size === 0) {
      alert('Selecteer minimaal één lead om te importeren')
      return
    }

    const leadsToImport = foundLeads.filter(l => selectedLeads.has(l.id))
    
    // Convert to Lead format and save to localStorage
    const importedLeads = leadsToImport.map((lead, index) => ({
      id: `imported-${Date.now()}-${index}-${lead.id}`,
      companyName: lead.companyName,
      contactPerson: '', // Will be filled manually or via scraping
      email: lead.email || '',
      phone: lead.phone || '',
      address: lead.address,
      city: lead.city,
      postalCode: lead.postalCode,
      industry: lead.category || undefined,
      employeeCount: undefined,
      status: 'new' as const,
      source: 'lead_finder' as const,
      notes: [
        'Gevonden via Lead Finder.',
        lead.website ? `Website: ${lead.website}` : '',
        lead.description ? `Beschrijving: ${lead.description}` : '',
        lead.rating ? `Rating: ${lead.rating}/5 (${lead.reviews} reviews)` : '',
        lead.scrapedAt ? `Gescraped op: ${new Date(lead.scrapedAt).toLocaleString('nl-NL')}` : '',
      ].filter(Boolean).join(' '),
      estimatedValue: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: undefined,
    }))

    // Load existing leads from localStorage
    let existingLeads: any[] = []
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('zakelijke_leads')
        if (saved) {
          existingLeads = JSON.parse(saved)
        }
      } catch (error) {
        console.error('Error loading existing leads:', error)
      }
    }

    // Merge with imported leads (avoid duplicates based on company name + city)
    const existingCompanyNames = new Set(
      existingLeads.map(l => `${l.companyName?.toLowerCase()}-${l.city?.toLowerCase()}`)
    )

    const newLeads = importedLeads.filter(
      lead => !existingCompanyNames.has(`${lead.companyName?.toLowerCase()}-${lead.city?.toLowerCase()}`)
    )

    const updatedLeads = [...existingLeads, ...newLeads]

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('zakelijke_leads', JSON.stringify(updatedLeads))
    }

    const message = newLeads.length === importedLeads.length
      ? `${importedLeads.length} lead(s) succesvol geïmporteerd!`
      : `${newLeads.length} nieuwe lead(s) geïmporteerd. ${importedLeads.length - newLeads.length} lead(s) waren al aanwezig.`

    alert(message)
    
    // Navigate back to leads page
    router.push('/admin/zakelijke-leads')
  }

  const toggleLeadSelection = (leadId: string) => {
    const newSelection = new Set(selectedLeads)
    if (newSelection.has(leadId)) {
      newSelection.delete(leadId)
    } else {
      newSelection.add(leadId)
    }
    setSelectedLeads(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedLeads.size === foundLeads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(foundLeads.map(l => l.id)))
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="ml-64">
        {/* Header */}
        <div className="bg-primary-600 text-white px-8 py-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/admin/zakelijke-leads"
                  className="text-primary-100 hover:text-white transition-colors"
                >
                  ← Terug naar Leads
                </Link>
              </div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Sparkles className="h-8 w-8" />
                Lead Finder
              </h1>
              <p className="text-primary-100 text-sm mt-2">
                Zoek en scrape bedrijfsgegevens via Google Maps
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Search Section */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Search className="h-5 w-5" />
              Zoek Bedrijven
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zoekterm *
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="bijv. middelbare school, basisschool, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleGoogleMapsSearch()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locatie
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="bijv. Amsterdam, Rotterdam, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleGoogleMapsSearch()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Alle categorieën</option>
                  <option value="school">Scholen</option>
                  <option value="business">Bedrijven</option>
                  <option value="organization">Organisaties</option>
                </select>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleGoogleMapsSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Zoeken...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Zoek op Google Maps
                </>
              )}
            </Button>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Gebruik specifieke zoektermen zoals "middelbare school Amsterdam" 
                of "basisschool Rotterdam" voor betere resultaten. De tool haalt automatisch NAW-gegevens, 
                websites en contactinformatie op.
              </p>
            </div>
          </Card>

          {/* Scraping Progress */}
          {isScraping && scrapingProgress && (
            <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-4">
                <Loader2 className="h-6 w-6 animate-spin text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    Scrapen van gegevens... ({scrapingProgress.completed}/{scrapingProgress.total})
                  </p>
                  {scrapingProgress.current && (
                    <p className="text-sm text-gray-600 mt-1">
                      Huidige: {scrapingProgress.current}
                    </p>
                  )}
                  {scrapingProgress.errors > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      {scrapingProgress.errors} fout(en) opgetreden
                    </p>
                  )}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full transition-all"
                      style={{ width: `${(scrapingProgress.completed / scrapingProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Results Section */}
          {showResults && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Gevonden Resultaten ({foundLeads.length})
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Selecteer leads om te importeren naar je leads database
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleScrapeAll}
                    disabled={isScraping || foundLeads.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    Scrape Alle Websites
                  </Button>
                  {selectedLeads.size > 0 && (
                    <Button
                      variant="primary"
                      onClick={handleImportLeads}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Importeer {selectedLeads.size} Lead(s)
                    </Button>
                  )}
                </div>
              </div>

              {/* Select All */}
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedLeads.size === foundLeads.length && foundLeads.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Selecteer alles ({selectedLeads.size} geselecteerd)
                </label>
              </div>

              {/* Results List */}
              <div className="space-y-4">
                {foundLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className={cn(
                      "border rounded-lg p-4 transition-all",
                      selectedLeads.has(lead.id)
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => toggleLeadSelection(lead.id)}
                        className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              <Building2 className="h-5 w-5 text-primary-600" />
                              {lead.companyName}
                            </h3>
                            {lead.category && (
                              <Badge className="mt-1 bg-gray-100 text-gray-700">
                                {lead.category}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {lead.scraped ? (
                              <Badge variant="success" className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Gescraped
                              </Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleScrapeSingle(lead)}
                                disabled={isScraping}
                                className="flex items-center gap-2"
                              >
                                <Globe className="h-3 w-3" />
                                Scrape
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          {/* Address */}
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p>{lead.address}</p>
                              <p>{lead.postalCode} {lead.city}</p>
                            </div>
                          </div>

                          {/* Phone */}
                          {lead.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <a href={`tel:${lead.phone}`} className="hover:text-primary-600">
                                {lead.phone}
                              </a>
                            </div>
                          )}

                          {/* Email */}
                          {lead.email ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <a href={`mailto:${lead.email}`} className="hover:text-primary-600">
                                {lead.email}
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Mail className="h-4 w-4" />
                              <span>E-mail niet gevonden</span>
                            </div>
                          )}

                          {/* Website */}
                          {lead.website ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <a
                                href={lead.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary-600 flex items-center gap-1"
                              >
                                {lead.website}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Globe className="h-4 w-4" />
                              <span>Website niet gevonden</span>
                            </div>
                          )}
                        </div>

                        {/* Rating */}
                        {lead.rating && (
                          <div className="mt-3 flex items-center gap-2 text-sm">
                            <span className="text-yellow-500">★</span>
                            <span className="font-medium">{lead.rating}</span>
                            {lead.reviews && (
                              <span className="text-gray-500">
                                ({lead.reviews} reviews)
                              </span>
                            )}
                          </div>
                        )}

                        {/* Description */}
                        {lead.description && (
                          <p className="mt-3 text-sm text-gray-600">{lead.description}</p>
                        )}

                        {/* Errors */}
                        {lead.errors && lead.errors.length > 0 && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-800 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              <span className="font-medium">Fouten:</span>
                            </div>
                            <ul className="list-disc list-inside text-xs text-red-700 mt-1">
                              {lead.errors.map((error, idx) => (
                                <li key={idx}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Google Maps Link */}
                        {lead.googleMapsUrl && (
                          <div className="mt-3">
                            <a
                              href={lead.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                              <MapPin className="h-3 w-3" />
                              Bekijk op Google Maps
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {foundLeads.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Geen resultaten gevonden. Probeer andere zoektermen.</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}


// Real function to scrape website data
async function scrapeWebsiteData(lead: FoundLead): Promise<Partial<FoundLead>> {
  try {
    // Call our scraping API
    const response = await fetch('/api/scrape/website', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        website: lead.website,
        companyName: lead.companyName,
      }),
    })

    if (!response.ok) {
      throw new Error(`Scraping failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    // Return scraped data
    const scrapedData: Partial<FoundLead> = {
      email: data.email || undefined,
      phone: data.phone || lead.phone || undefined,
      website: data.website || lead.website || undefined,
    }

    // If we found multiple emails, we could store them in a notes field
    // For now, we just use the first/best one

    return scrapedData

  } catch (error) {
    console.error('Error scraping website:', error)
    throw error
  }
}
