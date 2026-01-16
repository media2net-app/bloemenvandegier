'use client'

import { useEffect, useState, useRef } from 'react'
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
  const [editingElement, setEditingElement] = useState<number | null>(null)
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

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
    setEditingElement(elements.length)
  }

  const insertElementAt = (type: string, index: number) => {
    const newElement = {
      type,
      id: `${type}-${Date.now()}`,
      content: getDefaultContent(type),
      settings: getDefaultSettings(type)
    }
    const updated = [...elements]
    updated.splice(index, 0, newElement)
    setElements(updated)
    setEditingElement(index)
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

  const findElementIndexFromTarget = (target: HTMLElement, elements: any[]): number | null => {
    // Walk up the DOM tree to find data-element-index attribute
    let current: HTMLElement | null = target
    let depth = 0
    const maxDepth = 10

    while (current && depth < maxDepth) {
      // Check for data-element-index attribute
      const elementIndex = current.getAttribute('data-element-index')
      if (elementIndex !== null) {
        return parseInt(elementIndex, 10)
      }
      
      current = current.parentElement
      depth++
    }

    return null
  }

  const generateHtmlWithDropZones = (): string => {
    return generateHtml(true)
  }

  const generateHtml = (showDropZones: boolean = false): string => {
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

    elements.forEach((element, index) => {
      // Add data attribute for element identification
      const editingClass = editingElement === index ? 'editing' : ''
      const dragOverClass = dragOverIndex === index ? 'drag-over' : ''
      const dataAttr = `data-element-index="${index}"`
      const classes = `${editingClass} ${dragOverClass}`.trim()
      
      switch (element.type) {
        case 'text':
          const textClass = element.settings.style === 'greeting' ? 'greeting' : 'text-normal'
          if (editingElement === index) {
            html += `<div class="${textClass} ${classes}" ${dataAttr}>
              <textarea 
                style="width: 100%; min-height: 60px; padding: 8px; border: 2px solid #356443; border-radius: 4px; font-family: Arial, sans-serif; font-size: 16px;"
                onBlur="this.parentElement.dispatchEvent(new Event('blur'))"
              >${element.content}</textarea>
            </div>`
          } else {
            html += `<div class="${textClass} ${classes}" ${dataAttr}>${element.content}</div>`
          }
          break
        case 'heading':
          const headingClass = `heading heading-${element.settings.level || 'h2'}`
          if (editingElement === index) {
            html += `<div class="${headingClass} ${classes}" ${dataAttr}>
              <input 
                type="text" 
                value="${element.content}"
                style="width: 100%; padding: 8px; border: 2px solid #356443; border-radius: 4px; font-family: Arial, sans-serif; font-weight: bold; font-size: ${element.settings.level === 'h1' ? '24px' : element.settings.level === 'h3' ? '18px' : '20px'};"
                onBlur="this.parentElement.dispatchEvent(new Event('blur'))"
              />
            </div>`
          } else {
            html += `<div class="${headingClass} ${classes}" ${dataAttr}>${element.content}</div>`
          }
          break
        case 'offer':
          if (editingElement === index) {
            html += `<div class="offer-section ${classes}" ${dataAttr}>
              <textarea 
                style="width: 100%; min-height: 80px; padding: 8px; border: 2px solid #356443; border-radius: 4px; font-family: Arial, sans-serif;"
                onBlur="this.parentElement.dispatchEvent(new Event('blur'))"
              >${element.content}</textarea>
            </div>`
          } else {
            html += `<div class="offer-section ${classes}" ${dataAttr}>
              <div class="offer-title">${element.content}</div>
            </div>`
          }
          break
        case 'cta':
          if (editingElement === index) {
            html += `<div class="cta-section ${classes}" ${dataAttr} style="padding: 20px;">
              <input 
                type="text" 
                placeholder="CTA tekst..."
                value="${element.content}"
                style="width: 100%; margin-bottom: 10px; padding: 8px; border: 2px solid white; border-radius: 4px; background: white; color: #333;"
                onBlur="this.parentElement.dispatchEvent(new Event('blur'))"
              />
              <input 
                type="text" 
                placeholder="Button tekst..."
                value="${element.settings.buttonText || ''}"
                style="width: 100%; margin-bottom: 10px; padding: 8px; border: 2px solid white; border-radius: 4px; background: white; color: #333;"
                onBlur="this.parentElement.dispatchEvent(new Event('blur'))"
              />
              <input 
                type="text" 
                placeholder="URL..."
                value="${element.settings.buttonUrl || ''}"
                style="width: 100%; padding: 8px; border: 2px solid white; border-radius: 4px; background: white; color: #333;"
                onBlur="this.parentElement.dispatchEvent(new Event('blur'))"
              />
            </div>`
          } else {
            html += `<div class="cta-section ${classes}" ${dataAttr}>
              <div class="cta-text">${element.content}</div>
              <a href="${element.settings.buttonUrl || 'mailto:info@bloemenvandegier.nl'}" class="cta-button">${element.settings.buttonText || 'Contact opnemen'}</a>
            </div>`
          }
          break
        case 'divider':
          html += `<div class="divider ${classes}" ${dataAttr}></div>`
          break
      }
      
      // Add drop zone after each element (except last)
      if (showDropZones && index < elements.length - 1) {
        html += `<div class="drop-zone" data-drop-index="${index + 1}">Sleep element hier</div>`
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
              <button
                onClick={onClose}
                className="p-2 hover:bg-primary-500 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left: Elements Library - Draggable */}
            <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Elementen</h3>
                <p className="text-xs text-gray-600 mb-4">Sleep elementen naar de preview</p>
                <div className="space-y-2">
                  <div
                    draggable
                    onDragStart={(e) => {
                      setDraggedElement('text')
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-move"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <Type className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-900">Tekst</span>
                  </div>
                  <div
                    draggable
                    onDragStart={(e) => {
                      setDraggedElement('heading')
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-move"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-900">Koptekst</span>
                  </div>
                  <div
                    draggable
                    onDragStart={(e) => {
                      setDraggedElement('button')
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-move"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <MousePointerClick className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-900">Button</span>
                  </div>
                  <div
                    draggable
                    onDragStart={(e) => {
                      setDraggedElement('offer')
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-move"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <Sparkles className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-900">Aanbod Sectie</span>
                  </div>
                  <div
                    draggable
                    onDragStart={(e) => {
                      setDraggedElement('divider')
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-move"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <Minus className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-900">Scheidingslijn</span>
                  </div>
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
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
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
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="E-mail onderwerp..."
                      />
                    </div>
                  </div>
                </div>
              </div>

            {/* Center: Full Preview with Editable Elements */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Tip:</strong> Sleep elementen van links naar de preview. Klik op elementen in de preview om ze direct te bewerken.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden relative">
                    <EmailPreviewEditable
                      elements={elements}
                      editingElement={editingElement}
                      dragOverIndex={dragOverIndex}
                      draggedElement={draggedElement}
                      onElementClick={(index) => setEditingElement(index)}
                      onElementUpdate={(index, updates) => updateElement(index, updates)}
                      onElementBlur={() => setEditingElement(null)}
                      onDragOver={(index) => setDragOverIndex(index)}
                      onDrop={(type, index) => {
                        insertElementAt(type, index)
                        setDraggedElement(null)
                        setDragOverIndex(null)
                      }}
                      onDragLeave={() => setDragOverIndex(null)}
                      generateHtml={generateHtml}
                      findElementIndexFromTarget={findElementIndexFromTarget}
                    />
                  </div>
                </div>
              </div>
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

// Email Preview Editable Component
function EmailPreviewEditable({
  elements,
  editingElement,
  dragOverIndex,
  draggedElement,
  onElementClick,
  onElementUpdate,
  onElementBlur,
  onDragOver,
  onDrop,
  onDragLeave,
  generateHtml,
  findElementIndexFromTarget
}: {
  elements: any[]
  editingElement: number | null
  dragOverIndex: number | null
  draggedElement: string | null
  onElementClick: (index: number) => void
  onElementUpdate: (index: number, updates: any) => void
  onElementBlur: () => void
  onDragOver: (index: number | null) => void
  onDrop: (type: string, index: number) => void
  onDragLeave: () => void
  generateHtml: (showDropZones?: boolean) => string
  findElementIndexFromTarget: (target: HTMLElement, elements: any[]) => number | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let html = generateHtml(true)
    
    // Replace variables with example data
    const processedHtml = html
      .replace(/\{\{logo_url\}\}/g, typeof window !== 'undefined' ? `${window.location.origin}/images/logo.svg` : '/images/logo.svg')
      .replace(/\{\{bedrijfsnaam\}\}/g, 'Voorbeeld Bedrijf')
      .replace(/\{\{contactpersoon\}\}/g, 'Jan de Vries')
      .replace(/\{\{stad\}\}/g, 'Amsterdam')
      .replace(/\{\{adres\}\}/g, 'Voorbeeldstraat 123')
      .replace(/\{\{postcode\}\}/g, '1234 AB')
      .replace(/\{\{email\}\}/g, 'info@voorbeeld.nl')
      .replace(/\{\{telefoon\}\}/g, '020-1234567')

    containerRef.current.innerHTML = processedHtml

    // Add inline editing for elements
    if (editingElement !== null && elements[editingElement]) {
      const element = elements[editingElement]
      const elementDiv = containerRef.current.querySelector(`[data-element-index="${editingElement}"]`)
      
      if (elementDiv) {
        elementDiv.classList.add('editing')
        
        // Replace content with editable input based on type
        if (element.type === 'text') {
          const textarea = document.createElement('textarea')
          textarea.value = element.content
          textarea.style.cssText = 'width: 100%; min-height: 60px; padding: 8px; border: 2px solid #356443; border-radius: 4px; font-family: Arial, sans-serif; font-size: 16px; background: white; color: #333;'
          textarea.oninput = (e) => {
            const target = e.target as HTMLTextAreaElement
            onElementUpdate(editingElement, { content: target.value })
          }
          textarea.onblur = () => {
            onElementBlur()
          }
          elementDiv.innerHTML = ''
          elementDiv.appendChild(textarea)
          setTimeout(() => textarea.focus(), 50)
        } else if (element.type === 'heading') {
          const input = document.createElement('input')
          input.type = 'text'
          input.value = element.content
          input.style.cssText = `width: 100%; padding: 8px; border: 2px solid #356443; border-radius: 4px; font-family: Arial, sans-serif; font-weight: bold; font-size: ${element.settings.level === 'h1' ? '24px' : element.settings.level === 'h3' ? '18px' : '20px'}; background: white; color: #333;`
          input.oninput = (e) => {
            const target = e.target as HTMLInputElement
            onElementUpdate(editingElement, { content: target.value })
          }
          input.onblur = () => {
            onElementBlur()
          }
          elementDiv.innerHTML = ''
          elementDiv.appendChild(input)
          setTimeout(() => input.focus(), 50)
        } else if (element.type === 'offer') {
          const textarea = document.createElement('textarea')
          textarea.value = element.content
          textarea.style.cssText = 'width: 100%; min-height: 80px; padding: 8px; border: 2px solid #356443; border-radius: 4px; font-family: Arial, sans-serif; background: white; color: #333;'
          textarea.oninput = (e) => {
            const target = e.target as HTMLTextAreaElement
            onElementUpdate(editingElement, { content: target.value })
          }
          textarea.onblur = () => {
            onElementBlur()
          }
          const titleDiv = elementDiv.querySelector('.offer-title')
          if (titleDiv) {
            titleDiv.innerHTML = ''
            titleDiv.appendChild(textarea)
            setTimeout(() => textarea.focus(), 50)
          }
        } else if (element.type === 'cta') {
          const ctaText = elementDiv.querySelector('.cta-text')
          
          if (ctaText) {
            const input1 = document.createElement('input')
            input1.type = 'text'
            input1.value = element.content
            input1.placeholder = 'CTA tekst...'
            input1.style.cssText = 'width: 100%; margin-bottom: 10px; padding: 8px; border: 2px solid white; border-radius: 4px; background: white; color: #333;'
            input1.oninput = (e) => {
              const target = e.target as HTMLInputElement
              onElementUpdate(editingElement, { content: target.value })
            }
            
            const input2 = document.createElement('input')
            input2.type = 'text'
            input2.value = element.settings.buttonText || ''
            input2.placeholder = 'Button tekst...'
            input2.style.cssText = 'width: 100%; margin-bottom: 10px; padding: 8px; border: 2px solid white; border-radius: 4px; background: white; color: #333;'
            input2.oninput = (e) => {
              const target = e.target as HTMLInputElement
              onElementUpdate(editingElement, { settings: { ...element.settings, buttonText: target.value } })
            }
            
            const input3 = document.createElement('input')
            input3.type = 'text'
            input3.value = element.settings.buttonUrl || ''
            input3.placeholder = 'URL...'
            input3.style.cssText = 'width: 100%; padding: 8px; border: 2px solid white; border-radius: 4px; background: white; color: #333;'
            input3.oninput = (e) => {
              const target = e.target as HTMLInputElement
              onElementUpdate(editingElement, { settings: { ...element.settings, buttonUrl: target.value } })
            }
            input3.onblur = () => {
              onElementBlur()
            }
            
            elementDiv.innerHTML = ''
            elementDiv.appendChild(input1)
            elementDiv.appendChild(input2)
            elementDiv.appendChild(input3)
            setTimeout(() => input1.focus(), 50)
          }
        }
      }
    }

    // Add click handlers for non-editing elements
    const contentDivs = containerRef.current.querySelectorAll('.content > div:not(.editing)')
    contentDivs.forEach((div) => {
      const clickHandler = (e: Event) => {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'A' || target.tagName === 'IMG') {
          return
        }
        const elementIndex = findElementIndexFromTarget(target, elements)
        if (elementIndex !== null && editingElement !== elementIndex) {
          onElementClick(elementIndex)
        }
      }
      div.removeEventListener('click', clickHandler)
      div.addEventListener('click', clickHandler)
    })

    // Add drag and drop handlers
    const dropZones = containerRef.current.querySelectorAll('.drop-zone, .content > div')
    dropZones.forEach((zone) => {
      const dragOverHandler = (e: Event) => {
        const dragEvent = e as DragEvent
        dragEvent.preventDefault()
        dragEvent.stopPropagation()
        if (draggedElement) {
          if (zone.classList.contains('drop-zone')) {
            const dropIndex = parseInt(zone.getAttribute('data-drop-index') || '0', 10)
            onDragOver(dropIndex)
          } else {
            const target = dragEvent.target as HTMLElement
            const index = findElementIndexFromTarget(target, elements)
            if (index !== null) {
              onDragOver(index)
            }
          }
        }
      }

      const dropHandler = (e: Event) => {
        const dragEvent = e as DragEvent
        dragEvent.preventDefault()
        dragEvent.stopPropagation()
        if (draggedElement) {
          let dropIndex = elements.length
          
          if (zone.classList.contains('drop-zone')) {
            dropIndex = parseInt(zone.getAttribute('data-drop-index') || '0', 10)
          } else {
            const target = dragEvent.target as HTMLElement
            const index = findElementIndexFromTarget(target, elements)
            if (index !== null) {
              dropIndex = index
            }
          }
          
          onDrop(draggedElement, dropIndex)
        }
      }

      const dragLeaveHandler = () => {
        onDragLeave()
      }

      zone.removeEventListener('dragover', dragOverHandler)
      zone.removeEventListener('drop', dropHandler)
      zone.removeEventListener('dragleave', dragLeaveHandler)
      
      zone.addEventListener('dragover', dragOverHandler)
      zone.addEventListener('drop', dropHandler)
      zone.addEventListener('dragleave', dragLeaveHandler)
    })

    // Highlight drag over element
    if (dragOverIndex !== null) {
      const element = containerRef.current.querySelector(`[data-element-index="${dragOverIndex}"]`)
      if (element) {
        element.classList.add('drag-over')
      }
    } else {
      containerRef.current.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
    }

  }, [elements, editingElement, dragOverIndex, draggedElement, generateHtml, onElementClick, onElementUpdate, onElementBlur, onDragOver, onDrop, onDragLeave, findElementIndexFromTarget])

  return (
    <>
      <div
        ref={containerRef}
        className="email-preview-editable"
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'copy'
        }}
      />
      <style dangerouslySetInnerHTML={{ __html: `
        .email-preview-editable .content > div {
          position: relative;
          transition: all 0.2s;
        }
        .email-preview-editable .content > div:not(.editing):hover {
          outline: 2px dashed #356443;
          outline-offset: 4px;
          background-color: rgba(53, 100, 67, 0.05);
          cursor: pointer;
        }
        .email-preview-editable .content > div:not(.editing):hover::before {
          content: 'Klik om te bewerken';
          position: absolute;
          top: -30px;
          left: 0;
          background: #356443;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          z-index: 10;
          pointer-events: none;
        }
        .email-preview-editable .content > div.drag-over {
          outline: 3px solid #356443;
          outline-offset: 4px;
          background-color: rgba(53, 100, 67, 0.1);
        }
        .email-preview-editable .content > div.editing {
          outline: 3px solid #f59e0b;
          outline-offset: 4px;
          background-color: rgba(245, 158, 11, 0.1);
        }
        .email-preview-editable .drop-zone {
          min-height: 40px;
          border: 2px dashed #356443;
          background: rgba(53, 100, 67, 0.05);
          margin: 10px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #356443;
          font-size: 12px;
        }
      `}} />
    </>
  )
}
