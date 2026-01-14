'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Mail, 
  Search, 
  Filter,
  MessageSquare,
  Phone,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Calendar,
  Tag,
  ChevronRight,
  Archive,
  Star,
  StarOff
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'

type TicketStatus = 'open' | 'in_behandeling' | 'gesloten'
type TicketChannel = 'whatsapp' | 'email' | 'telefoon' | 'contactformulier'

interface Message {
  id: string
  content: string
  timestamp: string
  sender: 'customer' | 'admin'
  senderName: string
  attachments?: Array<{
    name: string
    url: string
    type: string
  }>
}

interface Ticket {
  id: string
  ticketNumber: string
  customer: {
    name: string
    email: string
    phone?: string
  }
  subject: string
  channel: TicketChannel
  status: TicketStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  updatedAt: string
  lastMessage: string
  unreadCount: number
  isStarred: boolean
  assignedTo?: string
  messages: Message[]
  relatedOrderId?: string
}

// Mock tickets data
const mockTickets: Ticket[] = [
  {
    id: '1',
    ticketNumber: 'TKT-2024-001',
    customer: {
      name: 'Jan de Vries',
      email: 'jan.devries@example.com',
      phone: '+31 6 12345678'
    },
    subject: 'Vraag over bestelling #1234',
    channel: 'whatsapp',
    status: 'open',
    priority: 'high',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    lastMessage: 'Wanneer wordt mijn bestelling bezorgd?',
    unreadCount: 2,
    isStarred: true,
    relatedOrderId: '1234',
    messages: [
      {
        id: 'msg1',
        content: 'Hallo, ik heb een vraag over mijn bestelling #1234. Wanneer wordt deze bezorgd?',
        timestamp: '2024-01-15T10:30:00Z',
        sender: 'customer',
        senderName: 'Jan de Vries'
      },
      {
        id: 'msg2',
        content: 'Ik zie dat de bestelling nog in behandeling is. Kan ik een update krijgen?',
        timestamp: '2024-01-15T11:15:00Z',
        sender: 'customer',
        senderName: 'Jan de Vries'
      }
    ]
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-002',
    customer: {
      name: 'Maria Jansen',
      email: 'maria.jansen@example.com',
      phone: '+31 6 87654321'
    },
    subject: 'Klacht over productkwaliteit',
    channel: 'email',
    status: 'in_behandeling',
    priority: 'urgent',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-15T13:45:00Z',
    lastMessage: 'De bloemen waren niet vers bij aankomst.',
    unreadCount: 0,
    isStarred: false,
    assignedTo: 'Sam de Gier',
    messages: [
      {
        id: 'msg3',
        content: 'Beste team, De bloemen die ik gisteren ontving waren niet vers. Ik ben hier erg teleurgesteld over.',
        timestamp: '2024-01-14T09:00:00Z',
        sender: 'customer',
        senderName: 'Maria Jansen'
      },
      {
        id: 'msg4',
        content: 'Beste Maria, Excuses voor het ongemak. We gaan dit direct voor u oplossen. Ik stuur u vandaag nog een nieuw boeket.',
        timestamp: '2024-01-14T14:30:00Z',
        sender: 'admin',
        senderName: 'Sam de Gier'
      }
    ]
  },
  {
    id: '3',
    ticketNumber: 'TKT-2024-003',
    customer: {
      name: 'Pieter Bakker',
      email: 'pieter.bakker@example.com',
      phone: '+31 6 11223344'
    },
    subject: 'Vraag over abonnement',
    channel: 'contactformulier',
    status: 'open',
    priority: 'medium',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    lastMessage: 'Kan ik mijn abonnement pauzeren?',
    unreadCount: 1,
    isStarred: false,
    messages: [
      {
        id: 'msg5',
        content: 'Goedemorgen, Ik ga op vakantie en wil graag mijn bloemenabonnement pauzeren. Is dit mogelijk?',
        timestamp: '2024-01-15T08:00:00Z',
        sender: 'customer',
        senderName: 'Pieter Bakker'
      }
    ]
  },
  {
    id: '4',
    ticketNumber: 'TKT-2024-004',
    customer: {
      name: 'Lisa van der Berg',
      email: 'lisa.vanderberg@example.com',
      phone: '+31 6 55667788'
    },
    subject: 'Bezorgtijd aanpassen',
    channel: 'whatsapp',
    status: 'gesloten',
    priority: 'low',
    createdAt: '2024-01-13T15:30:00Z',
    updatedAt: '2024-01-14T10:00:00Z',
    lastMessage: 'Bedankt voor de snelle oplossing!',
    unreadCount: 0,
    isStarred: false,
    messages: [
      {
        id: 'msg6',
        content: 'Hoi, Kan ik de bezorgtijd van mijn bestelling aanpassen naar de avond?',
        timestamp: '2024-01-13T15:30:00Z',
        sender: 'customer',
        senderName: 'Lisa van der Berg'
      },
      {
        id: 'msg7',
        content: 'Natuurlijk! Ik pas dit direct voor u aan.',
        timestamp: '2024-01-13T16:00:00Z',
        sender: 'admin',
        senderName: 'Rolf de Gier'
      },
      {
        id: 'msg8',
        content: 'Perfect, bedankt!',
        timestamp: '2024-01-14T10:00:00Z',
        sender: 'customer',
        senderName: 'Lisa van der Berg'
      }
    ]
  },
  {
    id: '5',
    ticketNumber: 'TKT-2024-005',
    customer: {
      name: 'Tom Smit',
      email: 'tom.smit@example.com',
      phone: '+31 6 99887766'
    },
    subject: 'Retour aanvraag',
    channel: 'email',
    status: 'in_behandeling',
    priority: 'medium',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:30:00Z',
    lastMessage: 'Ik wil graag mijn bestelling retourneren.',
    unreadCount: 0,
    isStarred: false,
    assignedTo: 'Rolf de Gier',
    messages: [
      {
        id: 'msg9',
        content: 'Beste team, Ik wil graag mijn bestelling #5678 retourneren. Het product voldoet niet aan mijn verwachtingen.',
        timestamp: '2024-01-15T12:00:00Z',
        sender: 'customer',
        senderName: 'Tom Smit'
      },
      {
        id: 'msg10',
        content: 'Beste Tom, We gaan dit voor u regelen. U ontvangt binnen 2 werkdagen een retourlabel per e-mail.',
        timestamp: '2024-01-15T12:30:00Z',
        sender: 'admin',
        senderName: 'Rolf de Gier'
      }
    ]
  }
]

const TICKETS_PER_PAGE = 50

export default function AdminBerichtenPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [channelFilter, setChannelFilter] = useState<TicketChannel | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }
  }, [router])

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = 
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
      const matchesChannel = channelFilter === 'all' || ticket.channel === channelFilter
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesChannel && matchesPriority
    })
  }, [searchQuery, statusFilter, channelFilter, priorityFilter, tickets])

  const totalPages = Math.ceil(filteredTickets.length / TICKETS_PER_PAGE)
  const startIndex = (currentPage - 1) * TICKETS_PER_PAGE
  const endIndex = Math.min(startIndex + TICKETS_PER_PAGE, filteredTickets.length)
  const currentTickets = filteredTickets.slice(startIndex, endIndex)

  const getChannelIcon = (channel: TicketChannel) => {
    switch (channel) {
      case 'whatsapp':
        return MessageSquare
      case 'email':
        return Mail
      case 'telefoon':
        return Phone
      case 'contactformulier':
        return MessageSquare
      default:
        return MessageSquare
    }
  }

  const getChannelLabel = (channel: TicketChannel) => {
    switch (channel) {
      case 'whatsapp':
        return 'WhatsApp'
      case 'email':
        return 'E-mail'
      case 'telefoon':
        return 'Telefoon'
      case 'contactformulier':
        return 'Contactformulier'
      default:
        return channel
    }
  }

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <Badge variant="warning" className="text-xs">Open</Badge>
      case 'in_behandeling':
        return <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">In behandeling</Badge>
      case 'gesloten':
        return <Badge variant="success" className="text-xs">Gesloten</Badge>
      default:
        return <Badge variant="default" className="text-xs">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="error" className="text-xs">Urgent</Badge>
      case 'high':
        return <Badge variant="warning" className="text-xs">Hoog</Badge>
      case 'medium':
        return <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">Gemiddeld</Badge>
      case 'low':
        return <Badge variant="default" className="text-xs">Laag</Badge>
      default:
        return null
    }
  }

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(tickets.map(t => 
      t.id === ticketId ? { ...t, status: newStatus } : t
    ))
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus })
    }
  }

  const handleStarToggle = (ticketId: string) => {
    setTickets(tickets.map(t => 
      t.id === ticketId ? { ...t, isStarred: !t.isStarred } : t
    ))
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, isStarred: !selectedTicket.isStarred })
    }
  }

  const handleReply = (ticketId: string) => {
    if (!replyText.trim()) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: replyText,
      timestamp: new Date().toISOString(),
      sender: 'admin',
      senderName: 'Admin'
    }

    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          messages: [...t.messages, newMessage],
          updatedAt: new Date().toISOString(),
          lastMessage: replyText,
          unreadCount: 0
        }
      }
      return t
    }))

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({
        ...selectedTicket,
        messages: [...selectedTicket.messages, newMessage],
        updatedAt: new Date().toISOString(),
        lastMessage: replyText,
        unreadCount: 0
      })
    }

    setReplyText('')
  }

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_behandeling: tickets.filter(t => t.status === 'in_behandeling').length,
    gesloten: tickets.filter(t => t.status === 'gesloten').length,
    unread: tickets.reduce((sum, t) => sum + t.unreadCount, 0)
  }

  if (selectedTicket) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <header className="bg-primary-600 text-white border-b border-primary-500 shadow-sm sticky top-0 z-30">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-white" />
                  <span className="font-semibold text-white">Berichten</span>
                </div>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                  onClick={() => setSelectedTicket(null)}
                >
                  Terug naar overzicht
                </Button>
              </div>
            </div>
          </header>

          <main className="p-6">
            <div className="max-w-5xl mx-auto">
              {/* Ticket Header */}
              <Card className="p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{selectedTicket.subject}</h1>
                      <button
                        onClick={() => handleStarToggle(selectedTicket.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {selectedTicket.isStarred ? (
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(selectedTicket.status)}
                      {getPriorityBadge(selectedTicket.priority)}
                      <Badge variant="default" className="text-xs">
                        {getChannelLabel(selectedTicket.channel)}
                      </Badge>
                      <span className="text-sm text-gray-600">#{selectedTicket.ticketNumber}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as TicketStatus)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="in_behandeling">In behandeling</option>
                      <option value="gesloten">Gesloten</option>
                    </select>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Klant</p>
                      <p className="font-medium text-gray-900">{selectedTicket.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">E-mail</p>
                      <p className="font-medium text-gray-900">{selectedTicket.customer.email}</p>
                    </div>
                    {selectedTicket.customer.phone && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Telefoon</p>
                        <p className="font-medium text-gray-900">{selectedTicket.customer.phone}</p>
                      </div>
                    )}
                  </div>
                  {selectedTicket.relatedOrderId && (
                    <div className="mt-4">
                      <Link 
                        href={`/admin/bestellingen/${selectedTicket.relatedOrderId}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Bekijk gerelateerde bestelling #{selectedTicket.relatedOrderId} →
                      </Link>
                    </div>
                  )}
                </div>
              </Card>

              {/* Messages */}
              <Card className="p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Conversatie</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-4",
                        message.sender === 'admin' ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <div className={cn(
                        "flex-1 rounded-lg p-4",
                        message.sender === 'admin'
                          ? "bg-primary-50 border border-primary-200"
                          : "bg-gray-50 border border-gray-200"
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{message.senderName}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleString('nl-NL')}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Reply Section */}
              {selectedTicket.status !== 'gesloten' && (
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Reageer</h3>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Typ je reactie..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                  />
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-600">
                      Je reactie wordt verzonden via {getChannelLabel(selectedTicket.channel)}
                    </p>
                    <Button
                      onClick={() => handleReply(selectedTicket.id)}
                      disabled={!replyText.trim()}
                      className="bg-primary-600 hover:bg-primary-700 text-white"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Verstuur reactie
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <header className="bg-primary-600 text-white border-b border-primary-500 shadow-sm sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">Berichten</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Totaal</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Open</p>
              <p className="text-2xl font-bold text-primary-600">{stats.open}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">In behandeling</p>
              <p className="text-2xl font-bold text-blue-600">{stats.in_behandeling}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Gesloten</p>
              <p className="text-2xl font-bold text-green-600">{stats.gesloten}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Ongelezen</p>
              <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Zoek op onderwerp, klant, ticketnummer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="all">Alle statussen</option>
                <option value="open">Open</option>
                <option value="in_behandeling">In behandeling</option>
                <option value="gesloten">Gesloten</option>
              </select>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value as TicketChannel | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="all">Alle kanalen</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">E-mail</option>
                <option value="telefoon">Telefoon</option>
                <option value="contactformulier">Contactformulier</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="all">Alle prioriteiten</option>
                <option value="urgent">Urgent</option>
                <option value="high">Hoog</option>
                <option value="medium">Gemiddeld</option>
                <option value="low">Laag</option>
              </select>
            </div>
          </Card>

          {/* Tickets List */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kanaal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioriteit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Laatste update
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">Geen tickets gevonden</p>
                      </td>
                    </tr>
                  ) : (
                    currentTickets.map((ticket) => {
                      const ChannelIcon = getChannelIcon(ticket.channel)
                      return (
                        <tr
                          key={ticket.id}
                          className={cn(
                            "hover:bg-gray-50 transition-colors cursor-pointer",
                            ticket.unreadCount > 0 && "bg-blue-50"
                          )}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStarToggle(ticket.id)
                                }}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                {ticket.isStarred ? (
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                ) : (
                                  <StarOff className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900">{ticket.subject}</p>
                                  {ticket.unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                      {ticket.unreadCount}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-1">{ticket.lastMessage}</p>
                                <p className="text-xs text-gray-400 mt-1">#{ticket.ticketNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{ticket.customer.name}</p>
                              <p className="text-xs text-gray-500">{ticket.customer.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <ChannelIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{getChannelLabel(ticket.channel)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(ticket.status)}
                          </td>
                          <td className="px-6 py-4">
                            {getPriorityBadge(ticket.priority)}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-700">
                              {new Date(ticket.updatedAt).toLocaleDateString('nl-NL')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(ticket.updatedAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTicket(ticket)
                              }}
                            >
                              Bekijk
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Toont {startIndex + 1} tot {endIndex} van {filteredTickets.length} tickets
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Vorige
                  </Button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Pagina {currentPage} van {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Volgende
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  )
}
