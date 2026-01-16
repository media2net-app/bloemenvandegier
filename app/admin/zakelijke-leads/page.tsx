'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Eye, 
  Trash2,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  FileText,
  MapPin,
  Upload,
  X
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'

interface Lead {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  industry?: string
  employeeCount?: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  source: 'website' | 'referral' | 'cold_call' | 'event' | 'other' | 'lead_finder'
  notes?: string
  estimatedValue?: number
  createdAt: string
  updatedAt: string
  lastContact?: string
  assignedTo?: string
}

export default function AdminZakelijkeLeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<any[]>([])
  const [importMapping, setImportMapping] = useState<Record<string, string>>({})
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }

    loadLeads()
  }, [router])

  const loadLeads = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      // Try to load from localStorage first
      let savedLeads: Lead[] = []
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('zakelijke_leads')
        if (saved) {
          try {
            savedLeads = JSON.parse(saved)
          } catch (error) {
            console.error('Error parsing saved leads:', error)
          }
        }
      }

      // Mock leads data (only used if localStorage is empty)
      const mockLeads: Lead[] = [
        {
          id: '1',
          companyName: 'Bloemenwinkel Amsterdam',
          contactPerson: 'Jan de Vries',
          email: 'jan@bloemenwinkel.nl',
          phone: '020-1234567',
          address: 'Kalverstraat 123',
          city: 'Amsterdam',
          postalCode: '1012 AB',
          industry: 'Retail',
          employeeCount: '10-50',
          status: 'new',
          source: 'website',
          estimatedValue: 5000,
          notes: 'Interesse in wekelijkse leveringen',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'Sam de Gier',
        },
        {
          id: '2',
          companyName: 'Hotel Grand Central',
          contactPerson: 'Maria Jansen',
          email: 'm.jansen@grandcentral.nl',
          phone: '020-9876543',
          address: 'Damrak 1',
          city: 'Amsterdam',
          postalCode: '1012 LG',
          industry: 'Hospitality',
          employeeCount: '50-200',
          status: 'contacted',
          source: 'referral',
          estimatedValue: 15000,
          notes: 'Heeft gevraagd om offerte voor maandelijkse leveringen',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'Chiel',
        },
        {
          id: '3',
          companyName: 'Restaurant De Gouden Leeuw',
          contactPerson: 'Pieter Bakker',
          email: 'info@degoudenleeuw.nl',
          phone: '020-5551234',
          address: 'Leidseplein 25',
          city: 'Amsterdam',
          postalCode: '1017 PS',
          industry: 'Restaurant',
          employeeCount: '5-10',
          status: 'qualified',
          source: 'website',
          estimatedValue: 3000,
          notes: 'Interesse in seizoensgebonden arrangementen',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'Sam de Gier',
        },
        {
          id: '4',
          companyName: 'Event Organisatie BV',
          contactPerson: 'Lisa van der Berg',
          email: 'lisa@eventorg.nl',
          phone: '020-4445678',
          address: 'Keizersgracht 456',
          city: 'Amsterdam',
          postalCode: '1016 EK',
          industry: 'Events',
          employeeCount: '10-50',
          status: 'proposal',
          source: 'event',
          estimatedValue: 8000,
          notes: 'Offerte verzonden, wacht op reactie',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'Chiel',
        },
        {
          id: '5',
          companyName: 'Kantoorgebouw Zuidas',
          contactPerson: 'Tom Mulder',
          email: 't.mulder@zuidas.nl',
          phone: '020-3339876',
          address: 'Gustav Mahlerplein 90',
          city: 'Amsterdam',
          postalCode: '1082 MA',
          industry: 'Real Estate',
          employeeCount: '200+',
          status: 'won',
          source: 'cold_call',
          estimatedValue: 25000,
          notes: 'Klant heeft contract getekend',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'Sam de Gier',
        },
      ]

      // Use saved leads if available, otherwise use mock data
      const allLeads = savedLeads.length > 0 ? savedLeads : mockLeads

      setLeads(allLeads)
      setFilteredLeads(allLeads)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading leads:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let filtered = leads

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(lead =>
        lead.companyName.toLowerCase().includes(query) ||
        lead.contactPerson.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.phone.includes(query) ||
        lead.city.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter)
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(lead => lead.source === sourceFilter)
    }

    setFilteredLeads(filtered)
  }, [searchQuery, statusFilter, sourceFilter, leads])

  const handleDelete = (leadId: string) => {
    if (confirm('Weet je zeker dat je deze lead wilt verwijderen?')) {
      const updatedLeads = leads.filter(l => l.id !== leadId)
      setLeads(updatedLeads)
      setFilteredLeads(filteredLeads.filter(l => l.id !== leadId))
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('zakelijke_leads', JSON.stringify(updatedLeads))
      }
    }
  }

  const getStatusBadge = (status: Lead['status']) => {
    const badges = {
      new: <Badge className="bg-blue-100 text-blue-800">Nieuw</Badge>,
      contacted: <Badge className="bg-yellow-100 text-yellow-800">Gecontacteerd</Badge>,
      qualified: <Badge className="bg-purple-100 text-purple-800">Gekwalificeerd</Badge>,
      proposal: <Badge className="bg-orange-100 text-orange-800">Offerte</Badge>,
      won: <Badge variant="success">Gewonnen</Badge>,
      lost: <Badge variant="error">Verloren</Badge>,
    }
    return badges[status]
  }

  const getSourceLabel = (source: Lead['source']) => {
    const labels = {
      website: 'Website',
      referral: 'Doorverwijzing',
      cold_call: 'Cold Call',
      event: 'Evenement',
      other: 'Anders',
      lead_finder: 'Lead Finder',
    }
    return labels[source]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Leads laden...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Zakelijke Leads</h1>
              <p className="text-gray-600 mt-1">Beheer alle zakelijke leads en prospects</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/zakelijke-leads/lead-finder">
                <Button
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Lead Finder
                </Button>
              </Link>
              <Button
                variant="secondary"
                className="flex items-center gap-2"
                onClick={() => setShowImportModal(true)}
              >
                <Upload className="h-4 w-4" />
                Import Leads
              </Button>
              <Button
                variant="primary"
                className="flex items-center gap-2"
                onClick={() => {
                  // TODO: Open new lead form
                  alert('Nieuwe lead toevoegen - functionaliteit volgt')
                }}
              >
                <Plus className="h-4 w-4" />
                Nieuwe Lead
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totaal Leads</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{leads.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nieuwe Leads</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {leads.filter(l => l.status === 'new').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gewonnen</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {leads.filter(l => l.status === 'won').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totale Waarde</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0))}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Alle statussen</option>
              <option value="new">Nieuw</option>
              <option value="contacted">Gecontacteerd</option>
              <option value="qualified">Gekwalificeerd</option>
              <option value="proposal">Offerte</option>
              <option value="won">Gewonnen</option>
              <option value="lost">Verloren</option>
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Alle bronnen</option>
              <option value="website">Website</option>
              <option value="referral">Doorverwijzing</option>
              <option value="cold_call">Cold Call</option>
              <option value="event">Evenement</option>
              <option value="other">Anders</option>
            </select>
            <Button
              variant="secondary"
              onClick={() => {
                const csv = [
                  ['Bedrijf', 'Contactpersoon', 'Email', 'Telefoon', 'Status', 'Bron', 'Geschatte Waarde', 'Aangemaakt'].join(','),
                  ...filteredLeads.map(l => [
                    `"${l.companyName}"`,
                    `"${l.contactPerson}"`,
                    l.email,
                    l.phone,
                    l.status,
                    l.source,
                    l.estimatedValue || 0,
                    formatDate(l.createdAt)
                  ].join(','))
                ].join('\n')
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `zakelijke-leads-export-${new Date().toISOString().split('T')[0]}.csv`
                a.click()
                window.URL.revokeObjectURL(url)
              }}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </Card>

        {/* Leads List */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bedrijf
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locatie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bron
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waarde
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toegewezen aan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Laatste Contact
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      Geen leads gevonden
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary-100 rounded-lg">
                            <Building2 className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {lead.companyName}
                            </div>
                            {lead.industry && (
                              <div className="text-xs text-gray-500">
                                {lead.industry}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.contactPerson}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {lead.city}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lead.postalCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getSourceLabel(lead.source)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(lead.estimatedValue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lead.assignedTo || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lead.lastContact ? formatDate(lead.lastContact) : '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(lead.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/zakelijke-leads/${lead.id}`}>
                            <button
                              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Bekijk lead"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => {
                              // TODO: Edit lead
                              alert('Lead bewerken - functionaliteit volgt')
                            }}
                            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Bewerk lead"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <a href={`mailto:${lead.email}`}>
                            <button
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Stuur email"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                          </a>
                          <a href={`tel:${lead.phone}`}>
                            <button
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Bel contactpersoon"
                            >
                              <Phone className="h-4 w-4" />
                            </button>
                          </a>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Verwijder lead"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Import Modal */}
        {showImportModal && (
          <ImportLeadsModal
            isOpen={showImportModal}
            onClose={() => {
              setShowImportModal(false)
              setImportFile(null)
              setImportPreview([])
              setImportMapping({})
            }}
            onImport={(importedLeads) => {
              // Load existing leads
              let existingLeads: Lead[] = []
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

              // Merge with imported leads (avoid duplicates)
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

              setLeads(updatedLeads)
              setFilteredLeads(updatedLeads)
              setShowImportModal(false)
            }}
          />
        )}
      </div>
    </div>
  )
}

// Import Leads Modal Component
function ImportLeadsModal({
  isOpen,
  onClose,
  onImport
}: {
  isOpen: boolean
  onClose: () => void
  onImport: (leads: Lead[]) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const defaultMapping = {
    'Bedrijfsnaam': 'companyName',
    'Contactpersoon': 'contactPerson',
    'Email': 'email',
    'Telefoon': 'phone',
    'Adres': 'address',
    'Stad': 'city',
    'Postcode': 'postalCode',
    'Branche': 'industry',
    'Aantal medewerkers': 'employeeCount',
    'Status': 'status',
    'Bron': 'source',
    'Notities': 'notes',
    'Geschatte waarde': 'estimatedValue',
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setErrors([])

    // Parse CSV
    try {
      const text = await selectedFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      // Auto-map headers
      const autoMapping: Record<string, string> = {}
      headers.forEach(header => {
        const normalized = header.toLowerCase()
        for (const [key, value] of Object.entries(defaultMapping)) {
          if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
            autoMapping[header] = value
            break
          }
        }
      })
      setMapping(autoMapping)

      // Preview first 5 rows
      const previewData = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row: Record<string, string> = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })
      setPreview(previewData)
    } catch (error) {
      setErrors(['Fout bij het lezen van het bestand. Zorg dat het een geldig CSV bestand is.'])
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsProcessing(true)
    setErrors([])

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))

      const importedLeads: Lead[] = []
      const importErrors: string[] = []

      lines.slice(1).forEach((line, index) => {
        if (!line.trim()) return

        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row: Record<string, string> = {}
        headers.forEach((header, i) => {
          row[header] = values[i] || ''
        })

        // Helper function to get value from row based on mapping
        const getMappedValue = (fieldName: string): string => {
          const mappedHeader = headers.find(h => mapping[h] === fieldName)
          return mappedHeader ? (row[mappedHeader] || '') : ''
        }

        // Map to Lead object
        const lead: Partial<Lead> = {
          id: `imported-${Date.now()}-${index}`,
          companyName: getMappedValue('companyName') || 'Onbekend',
          contactPerson: getMappedValue('contactPerson') || '',
          email: getMappedValue('email') || '',
          phone: getMappedValue('phone') || '',
          address: getMappedValue('address') || '',
          city: getMappedValue('city') || '',
          postalCode: getMappedValue('postalCode') || '',
          industry: getMappedValue('industry') || undefined,
          employeeCount: getMappedValue('employeeCount') || undefined,
          status: (getMappedValue('status') || 'new') as Lead['status'],
          source: (getMappedValue('source') || 'other') as Lead['source'],
          notes: getMappedValue('notes') || undefined,
          estimatedValue: getMappedValue('estimatedValue') 
            ? parseFloat(getMappedValue('estimatedValue')) 
            : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        // Validate required fields
        if (!lead.companyName || lead.companyName === 'Onbekend') {
          importErrors.push(`Regel ${index + 2}: Bedrijfsnaam ontbreekt`)
          return
        }

        importedLeads.push(lead as Lead)
      })

      if (importErrors.length > 0) {
        setErrors(importErrors)
      }

      if (importedLeads.length > 0) {
        onImport(importedLeads)
        alert(`${importedLeads.length} lead(s) succesvol geïmporteerd!`)
      } else {
        setErrors(['Geen geldige leads gevonden in het bestand.'])
      }
    } catch (error) {
      setErrors(['Fout bij het importeren van leads. Controleer het bestandsformaat.'])
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Import Leads</h2>
              <p className="text-sm text-gray-600 mt-1">
                Importeer leads vanuit CSV/Excel bestand (DUO database, etc.)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecteer CSV bestand
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-12 w-12 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Klik om bestand te selecteren of sleep hier
                  </span>
                  <span className="text-xs text-gray-500">
                    CSV of Excel bestand (max 10MB)
                  </span>
                </label>
                {file && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-semibold text-red-900 mb-2">Fouten gevonden:</h3>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {errors.slice(0, 10).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {errors.length > 10 && (
                    <li>... en {errors.length - 10} meer fouten</li>
                  )}
                </ul>
              </div>
            )}

            {/* Column Mapping */}
            {preview.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Kolom Mapping
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Koppel de kolommen uit je bestand aan de juiste velden
                </p>
                <div className="space-y-2">
                  {Object.keys(preview[0] || {}).map((header) => (
                    <div key={header} className="flex items-center gap-4">
                      <div className="w-48 text-sm text-gray-700">
                        {header}
                      </div>
                      <select
                        value={mapping[header] || ''}
                        onChange={(e) => setMapping({ ...mapping, [header]: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">-- Selecteer veld --</option>
                        <option value="companyName">Bedrijfsnaam</option>
                        <option value="contactPerson">Contactpersoon</option>
                        <option value="email">Email</option>
                        <option value="phone">Telefoon</option>
                        <option value="address">Adres</option>
                        <option value="city">Stad</option>
                        <option value="postalCode">Postcode</option>
                        <option value="industry">Branche</option>
                        <option value="employeeCount">Aantal medewerkers</option>
                        <option value="status">Status</option>
                        <option value="source">Bron</option>
                        <option value="notes">Notities</option>
                        <option value="estimatedValue">Geschatte waarde</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview */}
            {preview.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Preview (eerste 5 rijen)
                </h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(preview[0] || {}).map((header) => (
                          <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {preview.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 text-gray-900">
                              {String(value).substring(0, 30)}
                              {String(value).length > 30 ? '...' : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                📋 CSV Format Instructies
              </h4>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Eerste regel moet kolom headers bevatten</li>
                <li>Gebruik komma's (,) als scheidingsteken</li>
                <li>Text tussen aanhalingstekens voor velden met komma's</li>
                <li>Minimaal vereist: Bedrijfsnaam</li>
                <li>Optioneel: Email, Telefoon, Adres, etc.</li>
              </ul>
              <div className="mt-3">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    // Generate sample CSV
                    const sample = [
                      'Bedrijfsnaam,Contactpersoon,Email,Telefoon,Stad,Postcode',
                      'Middelbare School Amsterdam,Jan de Vries,j.devries@school.nl,020-1234567,Amsterdam,1012 AB',
                      'Gymnasium Rotterdam,Maria Jansen,m.jansen@gymnasium.nl,010-9876543,Rotterdam,3011 AA'
                    ].join('\n')
                    const blob = new Blob([sample], { type: 'text/csv' })
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'sample-leads-import.csv'
                    a.click()
                    window.URL.revokeObjectURL(url)
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Download voorbeeld CSV template
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Annuleren
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={!file || isProcessing || preview.length === 0}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importeren...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Importeer Leads
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
