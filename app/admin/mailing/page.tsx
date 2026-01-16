'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Mail,
  Send,
  Eye,
  Save,
  Users,
  Filter,
  Search,
  CheckCircle,
  X,
  Clock,
  FileText,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Sparkles,
  Type,
  Image as ImageIcon,
  MousePointerClick,
  Minus,
  Move,
  GripVertical
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
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  source: string
  notes?: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  createdAt: string
  updatedAt: string
}

interface Campaign {
  id: string
  name: string
  templateId: string
  recipients: string[]
  sent: number
  failed: number
  scheduledAt?: string
  sentAt?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
}

export default function MailingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterIndustry, setFilterIndustry] = useState<string>('all')
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [emailElements, setEmailElements] = useState<any[]>([])
  
  // Email template state
  const [template, setTemplate] = useState<EmailTemplate>({
    id: 'valentijn-2026',
    name: 'Valentijn Campagne 2026',
    subject: 'Speciaal Valentijn aanbod voor {{bedrijfsnaam}}',
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #356443 0%, #2a5036 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      max-width: 200px;
      height: auto;
      margin: 0 auto 20px;
    }
    .header-text {
      color: #ffffff;
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .greeting {
      font-size: 18px;
      color: #356443;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .intro {
      font-size: 16px;
      margin-bottom: 30px;
      color: #555555;
    }
    .offer-section {
      background-color: #f0f5f2;
      border-left: 4px solid #356443;
      padding: 20px;
      margin: 30px 0;
    }
    .offer-title {
      color: #2a5036;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .offer-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .offer-list li {
      padding: 8px 0;
      font-size: 16px;
      color: #333333;
    }
    .offer-list li:before {
      content: "🌹 ";
      margin-right: 8px;
    }
    .use-cases {
      margin: 30px 0;
    }
    .use-cases-title {
      color: #2a5036;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .use-cases-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .use-cases-list li {
      padding: 8px 0;
      padding-left: 25px;
      position: relative;
      color: #555555;
    }
    .use-cases-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #356443;
      font-weight: bold;
      font-size: 18px;
    }
    .cta-section {
      background: linear-gradient(135deg, #356443 0%, #2a5036 100%);
      padding: 30px;
      text-align: center;
      margin: 30px 0;
      border-radius: 8px;
    }
    .cta-text {
      color: #ffffff;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .cta-button {
      display: inline-block;
      background-color: #ffffff;
      color: #356443;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin-top: 10px;
    }
    .contact-info {
      background-color: #f0f5f2;
      padding: 20px;
      margin: 30px 0;
      border-radius: 5px;
    }
    .contact-info p {
      margin: 5px 0;
      color: #333333;
    }
    .footer {
      background-color: #2a5036;
      padding: 20px 30px;
      text-align: center;
      color: #ffffff;
      font-size: 12px;
    }
    .footer a {
      color: #ffffff;
      text-decoration: underline;
    }
    .divider {
      height: 2px;
      background: linear-gradient(90deg, transparent, #356443, transparent);
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header with Logo -->
    <div class="header">
      <img src="{{logo_url}}" alt="Bloemen van de Gier" class="logo" style="filter: brightness(0) invert(1);">
      <p class="header-text">Valentijn Campagne 2026</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <div class="greeting">Beste {{contactpersoon}},</div>
      
      <div class="intro">
        Wij hopen dat deze e-mail u goed bereikt. Wij zijn <strong style="color: #356443;">Bloemen van de Gier</strong>, een lokale bloemist gespecialiseerd in prachtige bloemstukken en arrangementen.
      </div>
      
      <div class="offer-section">
        <div class="offer-title">Speciaal Valentijn aanbod voor {{bedrijfsnaam}}</div>
        <ul class="offer-list">
          <li>Prachtige rozenboeketten</li>
          <li>Verse bloemstukken</li>
          <li>Complete Valentijnspakketten</li>
          <li>Levering op locatie mogelijk</li>
        </ul>
      </div>
      
      <div class="use-cases">
        <div class="use-cases-title">Onze arrangementen zijn perfect voor:</div>
        <ul class="use-cases-list">
          <li>Leerlingen om te geven aan docenten</li>
          <li>Docenten om te geven aan collega's</li>
          <li>School om te geven aan personeel</li>
          <li>Speciale Valentijnsactiviteiten</li>
        </ul>
      </div>
      
      <div class="contact-info">
        <p><strong style="color: #356443;">Levering op locatie:</strong></p>
        <p>{{adres}}<br>{{postcode}} {{stad}}</p>
      </div>
      
      <div class="cta-section">
        <div class="cta-text">Wilt u meer informatie of een offerte ontvangen?</div>
        <p style="color: #ffffff; margin: 10px 0;">Neem gerust contact met ons op!</p>
        <a href="mailto:info@bloemenvandegier.nl" class="cta-button">Contact opnemen</a>
      </div>
      
      <div class="divider"></div>
      
      <p style="color: #555555; font-size: 14px;">
        Met vriendelijke groet,<br>
        <strong style="color: #356443;">Het team van Bloemen van de Gier</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>U ontvangt deze e-mail omdat u bent geregistreerd als {{bedrijfsnaam}}.</p>
      <p style="margin-top: 10px;">
        <a href="#">Uitschrijven</a> | 
        <a href="https://www.bloemenvandegier.nl">Bezoek onze website</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
        Bloemen van de Gier | {{adres}}, {{postcode}} {{stad}} | Tel: {{telefoon}}
      </p>
    </div>
  </div>
</body>
</html>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('admin_authenticated')
      setIsAuthenticated(!!auth)
      if (!auth) {
        router.push('/admin/login')
      }
    }

    loadLeads()
  }, [router])

  const loadLeads = () => {
    try {
      // Load from localStorage
      const saved = localStorage.getItem('zakelijke_leads')
      let allLeads: Lead[] = []
      
      if (saved) {
        allLeads = JSON.parse(saved)
      }

      // Filter for schools (middelbare scholen) and leads with email
      const schoolLeads = allLeads.filter(lead => {
        const hasEmail = lead.email && lead.email.trim() !== ''
        const isSchool = 
          lead.industry?.toLowerCase().includes('school') ||
          lead.companyName?.toLowerCase().includes('school') ||
          lead.companyName?.toLowerCase().includes('lyceum') ||
          lead.companyName?.toLowerCase().includes('gymnasium') ||
          lead.companyName?.toLowerCase().includes('college') ||
          lead.notes?.toLowerCase().includes('school') ||
          lead.source === 'lead_finder'

        return hasEmail && isSchool
      })

      setLeads(schoolLeads)
      setFilteredLeads(schoolLeads)
    } catch (error) {
      console.error('Error loading leads:', error)
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
        lead.city.toLowerCase().includes(query)
      )
    }

    // Industry filter
    if (filterIndustry !== 'all') {
      filtered = filtered.filter(lead => lead.industry === filterIndustry)
    }

    setFilteredLeads(filtered)
  }, [searchQuery, filterIndustry, leads])

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
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)))
    }
  }

  const replaceVariables = (text: string, lead: Lead): string => {
    // Get base URL for logo
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.bloemenvandegier.nl'
    const logoUrl = `${baseUrl}/images/logo.svg`
    
    return text
      .replace(/\{\{bedrijfsnaam\}\}/g, lead.companyName)
      .replace(/\{\{contactpersoon\}\}/g, lead.contactPerson || 'Geachte heer/mevrouw')
      .replace(/\{\{email\}\}/g, lead.email)
      .replace(/\{\{telefoon\}\}/g, lead.phone || 'N/A')
      .replace(/\{\{adres\}\}/g, lead.address)
      .replace(/\{\{stad\}\}/g, lead.city)
      .replace(/\{\{postcode\}\}/g, lead.postalCode)
      .replace(/\{\{logo_url\}\}/g, logoUrl)
  }

  const handleSend = async () => {
    if (selectedLeads.size === 0) {
      alert('Selecteer minimaal één ontvanger')
      return
    }

    if (!template.subject.trim() || !template.body.trim()) {
      alert('Vul onderwerp en bericht in')
      return
    }

    if (!confirm(`Weet u zeker dat u ${selectedLeads.size} e-mail(s) wilt verzenden?`)) {
      return
    }

    setIsSending(true)

    try {
      const leadsToSend = filteredLeads.filter(l => selectedLeads.has(l.id))
      let sent = 0
      let failed = 0

      // Simulate sending emails
      for (const lead of leadsToSend) {
        try {
          // In production, this would be an actual email API call
          await new Promise(resolve => setTimeout(resolve, 500))

          const personalizedSubject = replaceVariables(template.subject, lead)
          const personalizedBody = replaceVariables(template.body, lead)

          // Mock email send
          console.log('Sending email to:', lead.email)
          console.log('Subject:', personalizedSubject)
          console.log('Body:', personalizedBody.substring(0, 100) + '...')

          sent++
        } catch (error) {
          console.error('Failed to send to', lead.email, error)
          failed++
        }
      }

      // Save campaign to localStorage
      const campaign: Campaign = {
        id: `campaign-${Date.now()}`,
        name: template.name,
        templateId: template.id,
        recipients: leadsToSend.map(l => l.id),
        sent,
        failed,
        sentAt: new Date().toISOString(),
        status: 'sent',
      }

      const existingCampaigns = JSON.parse(localStorage.getItem('mailing_campaigns') || '[]')
      localStorage.setItem('mailing_campaigns', JSON.stringify([...existingCampaigns, campaign]))

      alert(`${sent} e-mail(s) succesvol verzonden! ${failed > 0 ? `${failed} mislukt.` : ''}`)
      
      // Clear selection
      setSelectedLeads(new Set())
    } catch (error) {
      console.error('Error sending emails:', error)
      alert('Fout bij het verzenden van e-mails')
    } finally {
      setIsSending(false)
    }
  }

  const handlePreview = () => {
    if (selectedLeads.size === 0) {
      alert('Selecteer minimaal één ontvanger om preview te zien')
      return
    }
    setShowPreview(true)
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
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Sparkles className="h-8 w-8" />
                Mailing Tool
              </h1>
              <p className="text-primary-100 text-sm mt-2">
                Stuur gepersonaliseerde e-mails naar uw zakelijke leads
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className="bg-white text-primary-600 hover:bg-primary-50"
                onClick={() => setShowTemplateEditor(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Template Bewerken
              </Button>
              <Button
                variant="secondary"
                className="bg-white text-primary-600 hover:bg-primary-50"
                onClick={handlePreview}
                disabled={selectedLeads.size === 0}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>

        {/* Template Editor Modal */}
        {showTemplateEditor && (
          <EmailBuilderModal
            template={template}
            onClose={() => setShowTemplateEditor(false)}
            onSave={(updatedTemplate) => {
              setTemplate(updatedTemplate)
              setShowTemplateEditor(false)
            }}
          />
        )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Recipients Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-sm text-gray-600">Totaal Leads</div>
                  <div className="text-2xl font-bold text-gray-900">{leads.length}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-gray-600">Gefilterd</div>
                  <div className="text-2xl font-bold text-gray-900">{filteredLeads.length}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-gray-600">Geselecteerd</div>
                  <div className="text-2xl font-bold text-primary-600">{selectedLeads.size}</div>
                </Card>
              </div>

              {/* Filters */}
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Zoek op naam, e-mail, stad..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  <select
                    value={filterIndustry}
                    onChange={(e) => setFilterIndustry(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Alle branches</option>
                    <option value="Middelbare School">Middelbare School</option>
                    <option value="Basisschool">Basisschool</option>
                    <option value="Internationale School">Internationale School</option>
                  </select>
                </div>

                {/* Select All */}
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Selecteer alles ({selectedLeads.size} geselecteerd)
                  </label>
                </div>

                {/* Leads List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className={cn(
                        "flex items-center gap-3 p-3 border rounded-lg transition-all",
                        selectedLeads.has(lead.id)
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => toggleLeadSelection(lead.id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {lead.companyName}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {lead.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lead.city} • {lead.contactPerson || 'Geen contactpersoon'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredLeads.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Geen leads gevonden met e-mailadres.</p>
                    <p className="text-sm mt-2">
                      Importeer leads via de <Link href="/admin/zakelijke-leads/lead-finder" className="text-primary-600 hover:underline">Lead Finder</Link>
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* Right: Email Template */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  E-mail Template
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Naam
                    </label>
                    <input
                      type="text"
                      value={template.name}
                      onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Onderwerp
                    </label>
                    <input
                      type="text"
                      value={template.subject}
                      onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Bijv: Speciaal aanbod voor {{bedrijfsnaam}}"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Gebruik variabelen: {'{{bedrijfsnaam}}'}, {'{{contactpersoon}}'}, {'{{stad}}'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bericht (HTML)
                    </label>
                    <textarea
                      value={template.body}
                      onChange={(e) => setTemplate({ ...template, body: e.target.value })}
                      rows={20}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-xs"
                      placeholder="E-mail bericht (HTML)..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Beschikbare variabelen: {'{{bedrijfsnaam}}'}, {'{{contactpersoon}}'}, {'{{email}}'}, {'{{telefoon}}'}, {'{{adres}}'}, {'{{stad}}'}, {'{{postcode}}'}
                    </p>
                    <p className="text-xs text-primary-600 mt-1">
                      💡 Tip: Gebruik de Preview functie om te zien hoe de e-mail eruitziet met styling.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Send Button */}
              <Card className="p-6 bg-primary-50 border-primary-200">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Klaar om te verzenden?
                    </div>
                    <div className="text-2xl font-bold text-primary-600">
                      {selectedLeads.size} ontvanger(s)
                    </div>
                  </div>
                  
                  <Button
                    variant="primary"
                    onClick={handleSend}
                    disabled={selectedLeads.size === 0 || isSending}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Verzenden...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Verzend E-mails
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      E-mails worden gepersonaliseerd
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Unsubscribe link wordt toegevoegd
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Verzend status wordt bijgehouden
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <PreviewModal
            template={template}
            leads={filteredLeads.filter(l => selectedLeads.has(l.id))}
            onClose={() => setShowPreview(false)}
            replaceVariables={replaceVariables}
          />
        )}
      </div>
    </div>
  )
}

// Preview Modal Component
function PreviewModal({
  template,
  leads,
  onClose,
  replaceVariables
}: {
  template: EmailTemplate
  leads: Lead[]
  onClose: () => void
  replaceVariables: (text: string, lead: Lead) => string
}) {
  const [selectedLeadIndex, setSelectedLeadIndex] = useState(0)
  const selectedLead = leads[selectedLeadIndex] || leads[0]

  if (!selectedLead) {
    return null
  }

  const personalizedSubject = replaceVariables(template.subject, selectedLead)
  let personalizedBody = replaceVariables(template.body, selectedLead)
  
  // Ensure logo URL is absolute and works in preview
  const logoUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/images/logo.svg`
    : '/images/logo.svg'
  
  personalizedBody = personalizedBody.replace(/\{\{logo_url\}\}/g, logoUrl)

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
              <h2 className="text-2xl font-bold text-gray-900">E-mail Preview</h2>
              <p className="text-sm text-gray-600 mt-1">
                Preview voor {leads.length} ontvanger(s)
              </p>
            </div>
            <div className="flex items-center gap-3">
              {leads.length > 1 && (
                <select
                  value={selectedLeadIndex}
                  onChange={(e) => setSelectedLeadIndex(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {leads.map((lead, index) => (
                    <option key={lead.id} value={index}>
                      {lead.companyName} ({lead.email})
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Email Preview */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
              {/* Email Header */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="text-sm text-gray-500 mb-1">Van: Bloemen van de Gier &lt;info@bloemenvandegier.nl&gt;</div>
                <div className="text-sm text-gray-500 mb-1">Aan: {selectedLead.email}</div>
                <div className="text-sm text-gray-500 mb-1">Onderwerp: {personalizedSubject}</div>
              </div>

              {/* Email Body */}
              <div className="prose prose-sm max-w-none">
                <style dangerouslySetInnerHTML={{ __html: `
                  .email-preview-container img.logo {
                    max-width: 200px !important;
                    height: auto !important;
                    display: block !important;
                    margin: 0 auto 20px !important;
                  }
                  .email-preview-container .header {
                    background: linear-gradient(135deg, #356443 0%, #2a5036 100%) !important;
                    padding: 30px 20px !important;
                    text-align: center !important;
                  }
                  .email-preview-container .header img {
                    filter: brightness(0) invert(1) !important;
                  }
                `}} />
                <div 
                  dangerouslySetInnerHTML={{ __html: personalizedBody }}
                  className="email-preview-container"
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    maxWidth: '100%'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
            <Button variant="primary" onClick={onClose}>
              Sluiten
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

// Email Builder Modal Component
function EmailBuilderModal({
  template,
  onClose,
  onSave
}: {
  template: EmailTemplate
  onClose: () => void
  onSave: (template: EmailTemplate) => void
}) {
  const [templateName, setTemplateName] = useState(template.name)
  const [subject, setSubject] = useState(template.subject)
  const [elements, setElements] = useState<any[]>([])
  const [selectedElement, setSelectedElement] = useState<number | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    // Parse existing HTML body into elements
    parseHtmlToElements(template.body)
  }, [])

  const parseHtmlToElements = (html: string) => {
    // Simple parser - extract main content sections
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    
    const parsedElements: any[] = []
    
    // Extract header
    const header = tempDiv.querySelector('.header')
    if (header) {
      parsedElements.push({
        type: 'header',
        id: 'header-1',
        content: header.innerHTML,
        settings: {}
      })
    }
    
    // Extract content sections
    const content = tempDiv.querySelector('.content')
    if (content) {
      const children = content.children
      Array.from(children).forEach((child, index) => {
        if (child.classList.contains('greeting')) {
          parsedElements.push({
            type: 'text',
            id: `text-${index}`,
            content: child.textContent || '',
            settings: { style: 'greeting' }
          })
        } else if (child.classList.contains('offer-section')) {
          parsedElements.push({
            type: 'offer',
            id: `offer-${index}`,
            content: child.innerHTML,
            settings: {}
          })
        } else if (child.classList.contains('cta-section')) {
          parsedElements.push({
            type: 'cta',
            id: `cta-${index}`,
            content: child.innerHTML,
            settings: {}
          })
        } else if (child.tagName === 'P' || child.tagName === 'DIV') {
          parsedElements.push({
            type: 'text',
            id: `text-${index}`,
            content: child.textContent || child.innerHTML,
            settings: {}
          })
        }
      })
    }
    
    if (parsedElements.length === 0) {
      // Fallback: create default elements
      parsedElements.push(
        { type: 'header', id: 'header-1', content: '', settings: {} },
        { type: 'text', id: 'text-1', content: 'Beste {{contactpersoon}},', settings: { style: 'greeting' } },
        { type: 'text', id: 'text-2', content: 'Uw e-mail bericht hier...', settings: {} },
        { type: 'cta', id: 'cta-1', content: 'Neem contact op', settings: { buttonText: 'Contact opnemen', buttonUrl: 'mailto:info@bloemenvandegier.nl' } }
      )
    }
    
    setElements(parsedElements)
  }

  const addElement = (type: string) => {
    const newElement = {
      type,
      id: `${type}-${Date.now()}`,
      content: getDefaultContent(type),
      settings: getDefaultSettings(type)
    }
    setElements([...elements, newElement])
    setSelectedElement(elements.length)
  }

  const getDefaultContent = (type: string): string => {
    switch (type) {
      case 'text':
        return 'Nieuwe tekst...'
      case 'heading':
        return 'Nieuwe koptekst'
      case 'button':
        return 'Klik hier'
      case 'divider':
        return ''
      case 'offer':
        return 'Speciaal aanbod'
      default:
        return ''
    }
  }

  const getDefaultSettings = (type: string): any => {
    switch (type) {
      case 'button':
        return { buttonText: 'Klik hier', buttonUrl: 'mailto:info@bloemenvandegier.nl', buttonColor: '#356443' }
      case 'text':
        return { style: 'normal', fontSize: '16px' }
      case 'heading':
        return { level: 'h2', color: '#356443' }
      default:
        return {}
    }
  }

  const updateElement = (index: number, updates: any) => {
    const updated = [...elements]
    updated[index] = { ...updated[index], ...updates }
    setElements(updated)
  }

  const deleteElement = (index: number) => {
    const updated = elements.filter((_, i) => i !== index)
    setElements(updated)
    if (selectedElement === index) {
      setSelectedElement(null)
    }
  }

  const moveElement = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === elements.length - 1) return

    const updated = [...elements]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    setElements(updated)
    setSelectedElement(newIndex)
  }

  const generateHtml = (): string => {
    const logoUrl = '{{logo_url}}'
    
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #356443 0%, #2a5036 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      max-width: 200px;
      height: auto;
      margin: 0 auto 20px;
      filter: brightness(0) invert(1);
    }
    .header-text {
      color: #ffffff;
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .greeting {
      font-size: 18px;
      color: #356443;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .text-normal {
      font-size: 16px;
      margin-bottom: 20px;
      color: #555555;
    }
    .heading {
      color: #2a5036;
      font-weight: bold;
      margin: 30px 0 15px;
    }
    .heading-h1 { font-size: 24px; }
    .heading-h2 { font-size: 20px; }
    .heading-h3 { font-size: 18px; }
    .offer-section {
      background-color: #f0f5f2;
      border-left: 4px solid #356443;
      padding: 20px;
      margin: 30px 0;
    }
    .offer-title {
      color: #2a5036;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .cta-section {
      background: linear-gradient(135deg, #356443 0%, #2a5036 100%);
      padding: 30px;
      text-align: center;
      margin: 30px 0;
      border-radius: 8px;
    }
    .cta-text {
      color: #ffffff;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .cta-button {
      display: inline-block;
      background-color: #ffffff;
      color: #356443;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin-top: 10px;
    }
    .divider {
      height: 2px;
      background: linear-gradient(90deg, transparent, #356443, transparent);
      margin: 30px 0;
    }
    .footer {
      background-color: #2a5036;
      padding: 20px 30px;
      text-align: center;
      color: #ffffff;
      font-size: 12px;
    }
    .footer a {
      color: #ffffff;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="${logoUrl}" alt="Bloemen van de Gier" class="logo">
      <p class="header-text">Valentijn Campagne 2026</p>
    </div>
    
    <div class="content">`

    elements.forEach(element => {
      switch (element.type) {
        case 'text':
          const textClass = element.settings.style === 'greeting' ? 'greeting' : 'text-normal'
          html += `<div class="${textClass}">${element.content}</div>`
          break
        case 'heading':
          const headingClass = `heading heading-${element.settings.level || 'h2'}`
          html += `<div class="${headingClass}">${element.content}</div>`
          break
        case 'offer':
          html += `<div class="offer-section">
            <div class="offer-title">${element.content}</div>
          </div>`
          break
        case 'cta':
          html += `<div class="cta-section">
            <div class="cta-text">${element.content}</div>
            <a href="${element.settings.buttonUrl || 'mailto:info@bloemenvandegier.nl'}" class="cta-button">${element.settings.buttonText || 'Contact opnemen'}</a>
          </div>`
          break
        case 'divider':
          html += `<div class="divider"></div>`
          break
      }
    })

    html += `
    </div>
    
    <div class="footer">
      <p>U ontvangt deze e-mail omdat u bent geregistreerd als {{bedrijfsnaam}}.</p>
      <p style="margin-top: 10px;">
        <a href="#">Uitschrijven</a> | 
        <a href="https://www.bloemenvandegier.nl">Bezoek onze website</a>
      </p>
    </div>
  </div>
</body>
</html>`

    return html
  }

  const handleSave = () => {
    const htmlBody = generateHtml()
    onSave({
      ...template,
      name: templateName,
      subject: subject,
      body: htmlBody,
      updatedAt: new Date().toISOString()
    })
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-primary-600 text-white">
            <div>
              <h2 className="text-2xl font-bold">E-mail Template Builder</h2>
              <p className="text-sm text-primary-100 mt-1">
                Bouw en bewerk uw e-mail template met eenvoudige elementen
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className="bg-white text-primary-600 hover:bg-primary-50"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Bewerken' : 'Preview'}
              </Button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-primary-500 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left: Elements Library */}
            {!previewMode && (
              <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Elementen</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => addElement('text')}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <Type className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Tekst</span>
                  </button>
                  <button
                    onClick={() => addElement('heading')}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Koptekst</span>
                  </button>
                  <button
                    onClick={() => addElement('button')}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <MousePointerClick className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Button</span>
                  </button>
                  <button
                    onClick={() => addElement('offer')}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <Sparkles className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Aanbod Sectie</span>
                  </button>
                  <button
                    onClick={() => addElement('divider')}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Scheidingslijn</span>
                  </button>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Template Info</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Template Naam
                      </label>
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Onderwerp
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                        placeholder="E-mail onderwerp..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Center: Editor */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {previewMode ? (
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
                    <div dangerouslySetInnerHTML={{ __html: generateHtml().replace(/\{\{logo_url\}\}/g, typeof window !== 'undefined' ? `${window.location.origin}/images/logo.svg` : '/images/logo.svg') }} />
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-2xl mx-auto space-y-4">
                    {elements.map((element, index) => (
                      <div
                        key={element.id}
                        className={cn(
                          "border-2 rounded-lg p-4 transition-all",
                          selectedElement === index
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                        onClick={() => setSelectedElement(index)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col gap-1 mt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                moveElement(index, 'up')
                              }}
                              disabled={index === 0}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                            >
                              <GripVertical className="h-4 w-4 text-gray-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                moveElement(index, 'down')
                              }}
                              disabled={index === elements.length - 1}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                            >
                              <GripVertical className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>
                          <div className="flex-1">
                            {element.type === 'text' && (
                              <textarea
                                value={element.content}
                                onChange={(e) => updateElement(index, { content: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                placeholder="Tekst..."
                              />
                            )}
                            {element.type === 'heading' && (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={element.content}
                                  onChange={(e) => updateElement(index, { content: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 font-bold text-lg"
                                  placeholder="Koptekst..."
                                />
                                <select
                                  value={element.settings.level || 'h2'}
                                  onChange={(e) => updateElement(index, { settings: { ...element.settings, level: e.target.value } })}
                                  className="text-sm px-2 py-1 border border-gray-300 rounded"
                                >
                                  <option value="h1">Groot (H1)</option>
                                  <option value="h2">Normaal (H2)</option>
                                  <option value="h3">Klein (H3)</option>
                                </select>
                              </div>
                            )}
                            {element.type === 'button' && (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={element.settings.buttonText || ''}
                                  onChange={(e) => updateElement(index, { settings: { ...element.settings, buttonText: e.target.value } })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                  placeholder="Button tekst..."
                                />
                                <input
                                  type="text"
                                  value={element.settings.buttonUrl || ''}
                                  onChange={(e) => updateElement(index, { settings: { ...element.settings, buttonUrl: e.target.value } })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 text-sm"
                                  placeholder="URL (bijv. mailto:info@bloemenvandegier.nl)"
                                />
                              </div>
                            )}
                            {element.type === 'offer' && (
                              <textarea
                                value={element.content}
                                onChange={(e) => updateElement(index, { content: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                placeholder="Aanbod beschrijving..."
                              />
                            )}
                            {element.type === 'divider' && (
                              <div className="text-center text-gray-400 py-4">
                                <Minus className="h-6 w-6 mx-auto" />
                                <span className="text-xs">Scheidingslijn</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteElement(index)
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {element.type === 'text' && element.settings.style === 'greeting' && (
                            <span className="text-primary-600">✓ Groetstijl</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {elements.length === 0 && (
                      <div className="text-center py-12 text-gray-400">
                        <FileText className="h-12 w-12 mx-auto mb-4" />
                        <p>Klik op een element om toe te voegen</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
            <Button variant="outline" onClick={onClose}>
              Annuleren
            </Button>
            <Button variant="primary" onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Opslaan
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
