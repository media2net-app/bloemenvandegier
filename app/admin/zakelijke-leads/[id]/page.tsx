'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Edit,
  Mail,
  Phone,
  MapPin,
  Building2,
  User,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

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

export default function AdminZakelijkeLeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params?.id as string
  const [lead, setLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }

    loadLead()
  }, [router, leadId])

  const loadLead = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      // Try to load from localStorage first
      let foundLead: Lead | null = null
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('zakelijke_leads')
          if (saved) {
            const leads: Lead[] = JSON.parse(saved)
            foundLead = leads.find(l => l.id === leadId) || null
          }
        } catch (error) {
          console.error('Error loading lead from localStorage:', error)
        }
      }

      // Fallback to mock data if not found
      if (!foundLead) {
        foundLead = {
          id: leadId,
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
          notes: 'Interesse in wekelijkse leveringen voor de winkel. Heeft gevraagd om een offerte voor verschillende arrangementen.',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'Sam de Gier',
        }
      }

      setLead(foundLead)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading lead:', error)
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!lead) return

    try {
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

      // Update the lead
      const updatedLeads = existingLeads.map(l => 
        l.id === lead.id 
          ? { ...lead, updatedAt: new Date().toISOString() }
          : l
      )

      // If lead doesn't exist in saved leads, add it
      if (!existingLeads.find(l => l.id === lead.id)) {
        updatedLeads.push({ ...lead, updatedAt: new Date().toISOString() })
      }

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('zakelijke_leads', JSON.stringify(updatedLeads))
      }

      alert('Lead succesvol opgeslagen!')
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving lead:', error)
      alert('Fout bij het opslaan van de lead')
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
            <p className="text-gray-600">Lead laden...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 p-8">
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lead niet gevonden</h3>
            <Link href="/admin/zakelijke-leads">
              <Button variant="outline" className="mt-4">
                Terug naar leads
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/zakelijke-leads">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Terug
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{lead.companyName}</h1>
                <p className="text-gray-600 mt-1">Lead details en informatie</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href={`mailto:${lead.email}`}>
                <Button variant="secondary" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              </a>
              <a href={`tel:${lead.phone}`}>
                <Button variant="secondary" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Bel
                </Button>
              </a>
              {!isEditing ? (
                <Button
                  variant="primary"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Bewerken
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSave}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Opslaan
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Info */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary-600" />
                Bedrijfsinformatie
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrijfsnaam
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={lead.companyName}
                      onChange={(e) => setLead({ ...lead, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900">{lead.companyName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  {isEditing ? (
                    <select
                      value={lead.status}
                      onChange={(e) => setLead({ ...lead, status: e.target.value as Lead['status'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="new">Nieuw</option>
                      <option value="contacted">Gecontacteerd</option>
                      <option value="qualified">Gekwalificeerd</option>
                      <option value="proposal">Offerte</option>
                      <option value="won">Gewonnen</option>
                      <option value="lost">Verloren</option>
                    </select>
                  ) : (
                    getStatusBadge(lead.status)
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branche
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={lead.industry || ''}
                      onChange={(e) => setLead({ ...lead, industry: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900">{lead.industry || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aantal medewerkers
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={lead.employeeCount || ''}
                      onChange={(e) => setLead({ ...lead, employeeCount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900">{lead.employeeCount || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Geschatte waarde
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={lead.estimatedValue || ''}
                      onChange={(e) => setLead({ ...lead, estimatedValue: parseFloat(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900">{formatCurrency(lead.estimatedValue)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bron
                  </label>
                  {isEditing ? (
                    <select
                      value={lead.source}
                      onChange={(e) => setLead({ ...lead, source: e.target.value as Lead['source'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="website">Website</option>
                      <option value="referral">Doorverwijzing</option>
                      <option value="cold_call">Cold Call</option>
                      <option value="event">Evenement</option>
                      <option value="other">Anders</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{lead.source}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Contact Info */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary-600" />
                Contactgegevens
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contactpersoon
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={lead.contactPerson}
                      onChange={(e) => setLead({ ...lead, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900">{lead.contactPerson}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={lead.email}
                      onChange={(e) => setLead({ ...lead, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900">{lead.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefoon
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={lead.phone}
                      onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900">{lead.phone}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Address */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary-600" />
                Adres
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Straat
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={lead.address}
                      onChange={(e) => setLead({ ...lead, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900">{lead.address}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stad
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={lead.city}
                      onChange={(e) => setLead({ ...lead, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900">{lead.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postcode
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={lead.postalCode}
                      onChange={(e) => setLead({ ...lead, postalCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900">{lead.postalCode}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                Notities
              </h2>
              {isEditing ? (
                <textarea
                  value={lead.notes || ''}
                  onChange={(e) => setLead({ ...lead, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={6}
                  placeholder="Voeg notities toe over deze lead..."
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">
                  {lead.notes || 'Geen notities'}
                </p>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Snelle Acties</h2>
              <div className="space-y-2">
                <a href={`mailto:${lead.email}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Stuur email
                  </Button>
                </a>
                <a href={`tel:${lead.phone}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Bel contactpersoon
                  </Button>
                </a>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // TODO: Create task
                    alert('Taak aanmaken - functionaliteit volgt')
                  }}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Maak taak
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // TODO: Create proposal
                    alert('Offerte aanmaken - functionaliteit volgt')
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Maak offerte
                </Button>
              </div>
            </Card>

            {/* Lead Info */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Lead Informatie</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Toegewezen aan
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={lead.assignedTo || ''}
                      onChange={(e) => setLead({ ...lead, assignedTo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900">{lead.assignedTo || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aangemaakt
                  </label>
                  <p className="text-gray-900">{formatDate(lead.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Laatst bijgewerkt
                  </label>
                  <p className="text-gray-900">{formatDate(lead.updatedAt)}</p>
                </div>
                {lead.lastContact && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Laatste contact
                    </label>
                    <p className="text-gray-900">{formatDate(lead.lastContact)}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Activity Timeline */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Activiteit</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Lead aangemaakt</p>
                    <p className="text-xs text-gray-500">{formatDate(lead.createdAt)}</p>
                  </div>
                </div>
                {lead.lastContact && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Laatste contact</p>
                      <p className="text-xs text-gray-500">{formatDate(lead.lastContact)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
