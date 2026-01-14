'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Tag,
  FileText,
  Settings,
  ShoppingCart,
  Package,
  BarChart3
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface Task {
  id: string
  title: string
  description: string
  assignedTo: 'sam' | 'chiel'
  status: 'todo' | 'in_progress' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

const categories = [
  { name: 'Webshop', icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
  { name: 'Producten', icon: Package, color: 'bg-green-100 text-green-600' },
  { name: 'Marketing', icon: BarChart3, color: 'bg-purple-100 text-purple-600' },
  { name: 'Technisch', icon: Settings, color: 'bg-orange-100 text-orange-600' },
  { name: 'Algemeen', icon: FileText, color: 'bg-gray-100 text-gray-600' },
]

const users = {
  sam: { name: 'Sam de Gier', role: 'Eigenaar', avatar: '👨‍💼' },
  chiel: { name: 'Chiel', role: 'Developer', avatar: '👨‍💻' },
}

export default function AdminTakenPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: 'sam' as 'sam' | 'chiel',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'Algemeen',
    dueDate: '',
  })

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('admin_authenticated')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
    }

    loadTasks()
  }, [router])

  const loadTasks = async () => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock tasks with dummy data for Sam and Chiel
      const mockTasks: Task[] = [
        // Tasks for Sam (Owner)
        {
          id: '1',
          title: 'Nieuwe productcategorie toevoegen: Zomerbloemen',
          description: 'Een nieuwe categorie aanmaken voor zomerbloemen met bijbehorende producten en afbeeldingen.',
          assignedTo: 'sam',
          status: 'todo',
          priority: 'high',
          category: 'Producten',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          title: 'Marketing campagne voor Moederdag opzetten',
          description: 'Google Ads en Facebook campagne voorbereiden voor Moederdag periode. Budget bepalen en advertenties maken.',
          assignedTo: 'sam',
          status: 'in_progress',
          priority: 'urgent',
          category: 'Marketing',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          title: 'Leveranciers contacten voor nieuwe bloemensoorten',
          description: 'Contact opnemen met leveranciers voor nieuwe seizoensbloemen. Prijzen vergelijken en bestellingen plaatsen.',
          assignedTo: 'sam',
          status: 'todo',
          priority: 'medium',
          category: 'Algemeen',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          title: 'Klantfeedback analyseren en verbeterpunten noteren',
          description: 'Alle klantreviews en feedback doorlezen. Belangrijkste verbeterpunten identificeren en actieplan maken.',
          assignedTo: 'sam',
          status: 'done',
          priority: 'low',
          category: 'Algemeen',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '5',
          title: 'Nieuwe bezorgroutes optimaliseren',
          description: 'Bezorgroutes analyseren en optimaliseren voor efficiëntere bezorging. Brandstofkosten reduceren.',
          assignedTo: 'sam',
          status: 'in_progress',
          priority: 'medium',
          category: 'Algemeen',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        // Tasks for Chiel (Developer)
        {
          id: '6',
          title: 'Performance optimalisatie productoverzicht pagina',
          description: 'Productoverzicht pagina optimaliseren voor snellere laadtijden. Lazy loading implementeren en images comprimeren.',
          assignedTo: 'chiel',
          status: 'in_progress',
          priority: 'high',
          category: 'Technisch',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '7',
          title: 'WooCommerce migratie afronden',
          description: 'Laatste stappen van WooCommerce migratie voltooien. Product data syncen en testen of alles correct werkt.',
          assignedTo: 'chiel',
          status: 'todo',
          priority: 'urgent',
          category: 'Technisch',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '8',
          title: 'Admin dashboard statistieken real-time maken',
          description: 'Statistieken in admin dashboard real-time updaten met WebSocket of polling. Live data tonen.',
          assignedTo: 'chiel',
          status: 'todo',
          priority: 'medium',
          category: 'Technisch',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '9',
          title: 'Mobile responsive verbeteringen',
          description: 'Mobile weergave van productdetail pagina verbeteren. Touch gestures toevoegen en mobile menu optimaliseren.',
          assignedTo: 'chiel',
          status: 'done',
          priority: 'medium',
          category: 'Technisch',
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '10',
          title: 'API endpoints documenteren',
          description: 'Alle API endpoints documenteren met Swagger/OpenAPI. Voorbeelden toevoegen en error handling beschrijven.',
          assignedTo: 'chiel',
          status: 'todo',
          priority: 'low',
          category: 'Technisch',
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '11',
          title: 'Checkout flow bug fixes',
          description: 'Bugs in checkout flow oplossen. Postcode validatie verbeteren en betalingsgateway errors afhandelen.',
          assignedTo: 'chiel',
          status: 'in_progress',
          priority: 'high',
          category: 'Webshop',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '12',
          title: 'SEO meta tags toevoegen aan alle productpagina\'s',
          description: 'Dynamische SEO meta tags implementeren voor alle productpagina\'s. Open Graph tags toevoegen voor social sharing.',
          assignedTo: 'chiel',
          status: 'todo',
          priority: 'medium',
          category: 'Technisch',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      setTasks(mockTasks)
      setFilteredTasks(mockTasks)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading tasks:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let currentTasks = [...tasks]

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      currentTasks = currentTasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      currentTasks = currentTasks.filter(task => task.status === statusFilter)
    }

    // Apply assignee filter
    if (assigneeFilter !== 'all') {
      currentTasks = currentTasks.filter(task => task.assignedTo === assigneeFilter)
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      currentTasks = currentTasks.filter(task => task.priority === priorityFilter)
    }

    setFilteredTasks(currentTasks)
  }, [searchQuery, statusFilter, assigneeFilter, priorityFilter, tasks])

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      alert('Titel is verplicht')
      return
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      status: 'todo',
      priority: newTask.priority,
      category: newTask.category,
      dueDate: newTask.dueDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setTasks(prev => [task, ...prev])
    setNewTask({
      title: '',
      description: '',
      assignedTo: 'sam',
      priority: 'medium',
      category: 'Algemeen',
      dueDate: '',
    })
    setShowNewTaskModal(false)
    alert('Taak succesvol aangemaakt!')
  }

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
    ))
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Weet je zeker dat je deze taak wilt verwijderen?')) {
      setTasks(prev => prev.filter(task => task.id !== taskId))
    }
  }

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return <Badge variant="default" className="bg-gray-100 text-gray-800">Te doen</Badge>
      case 'in_progress':
        return <Badge variant="warning">Bezig</Badge>
      case 'done':
        return <Badge variant="success">Afgerond</Badge>
      case 'cancelled':
        return <Badge variant="error">Geannuleerd</Badge>
    }
  }

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Laag</Badge>
      case 'medium':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Gemiddeld</Badge>
      case 'high':
        return <Badge variant="warning">Hoog</Badge>
      case 'urgent':
        return <Badge variant="error">Urgent</Badge>
    }
  }

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName)
    return category ? category.icon : FileText
  }

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName)
    return category ? category.color : 'bg-gray-100 text-gray-600'
  }

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    sam: tasks.filter(t => t.assignedTo === 'sam' && t.status !== 'done').length,
    chiel: tasks.filter(t => t.assignedTo === 'chiel' && t.status !== 'done').length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Taken laden...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="ml-64">
        {/* Top Bar */}
        <div className="bg-primary-600 text-white px-8 py-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Taken</h1>
              <p className="text-primary-100 text-sm mt-1">
                Beheer taken en to-do's voor het team
              </p>
            </div>
            <Button 
              onClick={() => setShowNewTaskModal(true)}
              className="bg-white text-primary-600 hover:bg-primary-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Taak
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Totaal Taken</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-primary-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Te Doen</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todo}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bezig</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Afgerond</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.done}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Sam de Gier</p>
                  <p className="text-xl font-bold text-gray-900">{stats.sam} openstaande taken</p>
                </div>
                <div className="text-4xl">👨‍💼</div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Chiel</p>
                  <p className="text-xl font-bold text-gray-900">{stats.chiel} openstaande taken</p>
                </div>
                <div className="text-4xl">👨‍💻</div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Zoek taken..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="all">Alle statussen</option>
                  <option value="todo">Te doen</option>
                  <option value="in_progress">Bezig</option>
                  <option value="done">Afgerond</option>
                  <option value="cancelled">Geannuleerd</option>
                </select>
              </div>
              <div>
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="all">Iedereen</option>
                  <option value="sam">Sam de Gier</option>
                  <option value="chiel">Chiel</option>
                </select>
              </div>
              <div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="all">Alle prioriteiten</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">Hoog</option>
                  <option value="medium">Gemiddeld</option>
                  <option value="low">Laag</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Geen taken gevonden.</p>
              </Card>
            ) : (
              filteredTasks.map((task) => {
                const CategoryIcon = getCategoryIcon(task.category)
                const categoryColor = getCategoryColor(task.category)
                const assignee = users[task.assignedTo]
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'

                return (
                  <Card key={task.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-3">
                          <div className={`p-2 rounded-lg ${categoryColor}`}>
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                              {getStatusBadge(task.status)}
                              {getPriorityBadge(task.priority)}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{assignee.name} ({assignee.role})</span>
                              </div>
                              {task.dueDate && (
                                <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {isOverdue && '⚠️ '}
                                    {new Date(task.dueDate).toLocaleDateString('nl-NL')}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                <span>{task.category}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        >
                          <option value="todo">Te doen</option>
                          <option value="in_progress">Bezig</option>
                          <option value="done">Afgerond</option>
                          <option value="cancelled">Geannuleerd</option>
                        </select>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Verwijder taak"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl m-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Nieuwe Taak</h2>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titel *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Taak titel..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschrijving
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Taak beschrijving..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Toewijzen aan
                  </label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value as 'sam' | 'chiel' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="sam">Sam de Gier (Eigenaar)</option>
                    <option value="chiel">Chiel (Developer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioriteit
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="low">Laag</option>
                    <option value="medium">Gemiddeld</option>
                    <option value="high">Hoog</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categorie
                  </label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline (optioneel)
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowNewTaskModal(false)}
                  className="border-gray-300"
                >
                  Annuleren
                </Button>
                <Button
                  onClick={handleCreateTask}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  Taak Aanmaken
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
