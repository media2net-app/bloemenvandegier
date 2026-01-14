'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  CheckCircle,
  Circle,
  Package,
  MapPin,
  Truck,
  User,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  ShoppingCart,
  ListChecks
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils/format'

interface OrderItem {
  id: string
  name: string
  quantity: number
  sku: string
  location: string
  image?: string
  picked: boolean
}

interface Order {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone: string
  }
  deliveryDate: string
  deliveryTime: 'day' | 'evening'
  address: {
    street: string
    houseNumber: string
    postalCode: string
    city: string
  }
  items: OrderItem[]
  notes?: string
}

const mockOrder: Order = {
  id: 'ORD1001',
  orderNumber: '#1001',
  customer: {
    name: 'Jan Jansen',
    email: 'jan.jansen@example.com',
    phone: '+31 6 12345678',
  },
  deliveryDate: new Date().toISOString().split('T')[0],
  deliveryTime: 'day',
  address: {
    street: 'Hoofdstraat',
    houseNumber: '123',
    postalCode: '1234 AB',
    city: 'Amsterdam',
  },
  items: [
    {
      id: '1',
      name: 'Boeket Rode Rozen',
      quantity: 1,
      sku: 'ROS-001',
      location: 'A-12-3',
      picked: false,
    },
    {
      id: '2',
      name: 'Glazen Vaas',
      quantity: 1,
      sku: 'VAAS-001',
      location: 'B-5-2',
      picked: false,
    },
    {
      id: '3',
      name: 'Persoonlijk Kaartje',
      quantity: 1,
      sku: 'CARD-001',
      location: 'C-1-1',
      picked: false,
    },
  ],
  notes: 'Graag voor de deur plaatsen',
}

export default function OrderPickerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams?.get('order') || 'ORD1001'

  const [order, setOrder] = useState<Order>(mockOrder)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // In a real app, load order by ID
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setOrder(mockOrder)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading order:', error)
      setIsLoading(false)
    }
  }

  const handlePickItem = (itemId: string) => {
    setOrder({
      ...order,
      items: order.items.map(item =>
        item.id === itemId ? { ...item, picked: !item.picked } : item
      ),
    })
  }

  const handleNextStep = () => {
    if (currentStep < order.items.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // All items picked, show completion
      if (order.items.every(item => item.picked)) {
        setIsComplete(true)
      }
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // In a real app, this would mark the order as picked
    alert('Order succesvol gepickt!')
    router.push('/admin/bestellingen')
  }

  const currentItem = order.items[currentStep]
  const allPicked = order.items.every(item => item.picked)
  const progress = (order.items.filter(item => item.picked).length / order.items.length) * 100

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Order laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* iPad Frame */}
      <div className="relative w-full max-w-4xl">
        {/* iPad Outer Frame */}
        <div className="bg-gray-800 rounded-[3rem] p-4 shadow-2xl">
          {/* iPad Screen */}
          <div className="bg-white rounded-[2.5rem] overflow-hidden">
            {/* Status Bar */}
            <div className="bg-primary-600 text-white px-6 py-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="font-semibold">Order Picker</span>
              </div>
              <div className="flex items-center gap-4">
                <span>{new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</span>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-3 border border-white rounded-sm">
                    <div className="w-5 h-2 bg-white rounded-sm m-0.5"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="h-[calc(100vh-200px)] max-h-[900px] overflow-y-auto">
              {isComplete ? (
                /* Completion Screen */
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Voltooid!</h2>
                    <p className="text-gray-600">Alle items zijn succesvol gepickt</p>
                  </div>
                  
                  <Card className="p-6 mb-6 text-left">
                    <h3 className="font-bold text-gray-900 mb-4">Order Overzicht</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ordernummer:</span>
                        <span className="font-medium">{order.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Klant:</span>
                        <span className="font-medium">{order.customer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items gepickt:</span>
                        <span className="font-medium">{order.items.length} / {order.items.length}</span>
                      </div>
                    </div>
                  </Card>

                  <Button
                    onClick={handleComplete}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-lg"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Voltooien
                  </Button>
                </div>
              ) : (
                <>
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold mb-1">{order.orderNumber}</h1>
                        <p className="text-primary-100">Order Picker</p>
                      </div>
                      <Badge variant="default" className="bg-white text-primary-600">
                        Stap {currentStep + 1} van {order.items.length}
                      </Badge>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-primary-500 rounded-full h-3 mb-4">
                      <div
                        className="bg-white h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(order.deliveryDate).toLocaleDateString('nl-NL')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span>{order.deliveryTime === 'day' ? 'Overdag' : 'Avond'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Item Card */}
                  <div className="p-6">
                    <Card className="p-6 border-2 border-primary-200">
                      <div className="flex items-start gap-6">
                        {/* Item Icon/Image */}
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 bg-primary-100 rounded-xl flex items-center justify-center">
                            <Package className="h-12 w-12 text-primary-600" />
                          </div>
                        </div>

                        {/* Item Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                {currentItem.name}
                              </h2>
                              <p className="text-gray-600">SKU: {currentItem.sku}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-primary-600">
                                {currentItem.quantity}x
                              </div>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-3">
                              <MapPin className="h-6 w-6 text-yellow-600" />
                              <div>
                                <p className="text-xs text-yellow-700 font-medium mb-1">Locatie</p>
                                <p className="text-xl font-bold text-yellow-900">{currentItem.location}</p>
                              </div>
                            </div>
                          </div>

                          {/* Pick Status */}
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handlePickItem(currentItem.id)}
                              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold transition-all ${
                                currentItem.picked
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {currentItem.picked ? (
                                <>
                                  <CheckCircle className="h-6 w-6" />
                                  <span>Gepickt</span>
                                </>
                              ) : (
                                <>
                                  <Circle className="h-6 w-6" />
                                  <span>Nog niet gepickt</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* All Items List */}
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <ListChecks className="h-5 w-5" />
                        Alle Items ({order.items.filter(item => item.picked).length} / {order.items.length})
                      </h3>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div
                            key={item.id}
                            className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                              index === currentStep
                                ? 'border-primary-500 bg-primary-50'
                                : item.picked
                                ? 'border-green-200 bg-green-50'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {item.picked ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              ) : (
                                <Circle className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${index === currentStep ? 'text-primary-900' : 'text-gray-900'}`}>
                                {item.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.quantity}x • Locatie: {item.location}
                              </p>
                            </div>
                            {index === currentStep && (
                              <Badge variant="default" className="bg-primary-600 text-white">
                                Huidige
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <Card className="p-4 mt-6 bg-gray-50">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">Klant</p>
                          <p className="font-medium text-gray-900">{order.customer.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Bezorgadres</p>
                          <p className="font-medium text-gray-900">
                            {order.address.street} {order.address.houseNumber}
                          </p>
                          <p className="text-gray-600">
                            {order.address.postalCode} {order.address.city}
                          </p>
                        </div>
                      </div>
                      {order.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Notitie</p>
                              <p className="text-sm text-gray-900">{order.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
                    <Button
                      onClick={handlePreviousStep}
                      disabled={currentStep === 0}
                      variant="outline"
                      className="flex-1"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Vorige
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      disabled={currentStep === order.items.length - 1 && !allPicked}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                    >
                      {currentStep === order.items.length - 1 ? (
                        <>
                          <Check className="h-5 w-5 mr-2" />
                          Voltooien
                        </>
                      ) : (
                        <>
                          Volgende
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
