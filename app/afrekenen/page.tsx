'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart/store'
import { formatPrice } from '@/lib/utils/format'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { 
  User, Mail, Phone, MapPin, Calendar, Clock, CreditCard, 
  Lock, ArrowLeft, Truck, Package, CheckCircle, Shield 
} from 'lucide-react'

type DeliveryTime = 'day' | 'evening'
type PaymentMethod = 'ideal' | 'creditcard' | 'paypal' | 'banktransfer'

interface FormData {
  // Personal info
  firstName: string
  lastName: string
  email: string
  phone: string
  
  // Delivery address
  street: string
  houseNumber: string
  postalCode: string
  city: string
  country: string
  
  // Delivery options
  deliveryDate: string
  deliveryTime: DeliveryTime
  insuredDelivery: boolean
  
  // Payment
  paymentMethod: PaymentMethod
  
  // Additional
  notes: string
  newsletter: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    country: 'Nederland',
    deliveryDate: '',
    deliveryTime: 'day',
    insuredDelivery: false,
    paymentMethod: 'ideal',
    notes: '',
    newsletter: false,
  })
  
  const [isLookingUpAddress, setIsLookingUpAddress] = useState(false)
  const [addressLookupError, setAddressLookupError] = useState('')

  // Get minimum delivery date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // Get maximum delivery date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    return maxDate.toISOString().split('T')[0]
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('nl-NL', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  useEffect(() => {
    // Set default delivery date to tomorrow
    if (!formData.deliveryDate) {
      setFormData(prev => ({ ...prev, deliveryDate: getMinDate() }))
    }
  }, [])

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/')
    }
  }, [items, router])

  const subtotal = getTotal()
  const deliveryCost = 4.95
  const insuredDeliveryCost = formData.insuredDelivery ? 7.50 : 0
  const total = subtotal + deliveryCost + insuredDeliveryCost

  // Postcode lookup function
  const lookupAddress = async (postalCode: string, houseNumber: string) => {
    if (!postalCode || !houseNumber) return
    
    // Format postcode (remove spaces, uppercase)
    const formattedPostcode = postalCode.replace(/\s/g, '').toUpperCase()
    
    // Validate Dutch postcode format (1234AB)
    if (!/^\d{4}[A-Z]{2}$/.test(formattedPostcode)) {
      return
    }
    
    setIsLookingUpAddress(true)
    setAddressLookupError('')
    
    try {
      // Use PostcodeAPI.nu (free tier available)
      // In production, you would use your own API key
      const response = await fetch(
        `https://api.postcodeapi.nu/v3/lookup/${formattedPostcode}/${houseNumber}`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.results && data.results.length > 0) {
          const result = data.results[0]
          setFormData(prev => ({
            ...prev,
            street: result.street || prev.street,
            city: result.city || prev.city,
            postalCode: formattedPostcode.slice(0, 4) + ' ' + formattedPostcode.slice(4), // Format as 1234 AB
          }))
        }
      } else if (response.status === 404) {
        setAddressLookupError('Postcode en huisnummer niet gevonden')
      } else {
        setAddressLookupError('Kon adres niet ophalen. Controleer de gegevens.')
      }
    } catch (error) {
      console.error('Address lookup error:', error)
      // Fallback: try alternative API or show error
      setAddressLookupError('Kon adres niet ophalen. Vul handmatig in.')
    } finally {
      setIsLookingUpAddress(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Auto-fill address when postcode and house number are entered
  useEffect(() => {
    if (!formData.postalCode || !formData.houseNumber) return
    
    // Debounce the lookup
    const timeoutId = setTimeout(() => {
      lookupAddress(formData.postalCode, formData.houseNumber)
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [formData.postalCode, formData.houseNumber])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Clear cart and redirect to success page
    clearCart()
    router.push('/bestelling-bevestigd')
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar winkel
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Afrekenen</h1>
          <p className="text-gray-600 mt-2">Vul je gegevens in om je bestelling te voltooien</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Options - FIRST */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary-600" />
                  Levering
                </h2>
                <div className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Bezorgdatum *
                    </label>
                    <input
                      type="date"
                      id="deliveryDate"
                      name="deliveryDate"
                      required
                      min={getMinDate()}
                      max={getMaxDate()}
                      value={formData.deliveryDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                    {formData.deliveryDate && (
                      <p className="mt-2 text-sm text-gray-600">
                        Geselecteerde datum: <strong>{formatDate(formData.deliveryDate)}</strong>
                      </p>
                    )}
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Bezorgtijd *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, deliveryTime: 'day' }))}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          formData.deliveryTime === 'day'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">Overdag</div>
                            <div className="text-sm text-gray-600 mt-1">09:00 - 17:00</div>
                          </div>
                          {formData.deliveryTime === 'day' && (
                            <CheckCircle className="h-5 w-5 text-primary-600" />
                          )}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, deliveryTime: 'evening' }))}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          formData.deliveryTime === 'evening'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">Avondlevering</div>
                            <div className="text-sm text-gray-600 mt-1">17:00 - 22:00</div>
                          </div>
                          {formData.deliveryTime === 'evening' && (
                            <CheckCircle className="h-5 w-5 text-primary-600" />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Insured Delivery Option */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary-300 bg-gray-50">
                      <input
                        type="checkbox"
                        name="insuredDelivery"
                        checked={formData.insuredDelivery}
                        onChange={handleInputChange}
                        className="mt-1 mr-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="h-5 w-5 text-primary-600" />
                          <span className="font-semibold text-gray-900">Verzekerde levering</span>
                          <span className="ml-auto font-bold text-primary-600">+{formatPrice('7.50')}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Wij garanderen levering op de gekozen dag. Als we niet kunnen leveren, krijg je je geld terug.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </Card>

              {/* Personal Information */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary-600" />
                  Persoonlijke gegevens
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      Voornaam *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Achternaam *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      E-mailadres *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Telefoonnummer *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+31 6 12345678"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>
              </Card>

              {/* Delivery Address */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary-600" />
                  Bezorgadres
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                        Postcode *
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="1234AB"
                        maxLength={7}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none uppercase"
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Huisnummer *
                      </label>
                      <input
                        type="text"
                        id="houseNumber"
                        name="houseNumber"
                        required
                        value={formData.houseNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      />
                    </div>
                    <div className="flex items-end">
                      {isLookingUpAddress && (
                        <div className="flex items-center gap-2 text-sm text-primary-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                          <span>Adres ophalen...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {addressLookupError && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                      {addressLookupError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                        Straatnaam *
                      </label>
                      <input
                        type="text"
                        id="street"
                        name="street"
                        required
                        value={formData.street}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        readOnly={isLookingUpAddress}
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        Woonplaats *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        readOnly={isLookingUpAddress}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                        Land *
                      </label>
                      <select
                        id="country"
                        name="country"
                        required
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      >
                        <option value="Nederland">Nederland</option>
                        <option value="België">België</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                  Betaalmethode
                </h2>
                <div className="space-y-3">
                  {[
                    { value: 'ideal', label: 'iDEAL', description: 'Betaal direct via je bank' },
                    { value: 'creditcard', label: 'Creditcard', description: 'Visa, Mastercard, Amex' },
                    { value: 'paypal', label: 'PayPal', description: 'Betaal met je PayPal account' },
                    { value: 'banktransfer', label: 'Bankoverschrijving', description: 'Handmatige betaling' },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.paymentMethod === method.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-300 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={formData.paymentMethod === method.value}
                        onChange={handleInputChange}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{method.label}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                      {formData.paymentMethod === method.value && (
                        <CheckCircle className="h-5 w-5 text-primary-600 ml-2" />
                      )}
                    </label>
                  ))}
                </div>
              </Card>

              {/* Additional Notes */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Extra opmerkingen</h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Heb je speciale instructies voor de bezorger? Laat het hier weten..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                />
                <label className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    name="newsletter"
                    checked={formData.newsletter}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Ik wil graag op de hoogte blijven van aanbiedingen en nieuws
                  </span>
                </label>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary-600" />
                    Bestellingsoverzicht
                  </h2>

                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={item.image || '/images/placeholder-flower.svg'}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                          <p className="text-xs text-gray-600">Aantal: {item.quantity}</p>
                          {item.addons && item.addons.length > 0 && (
                            <div className="mt-1">
                              {item.addons.map((addon) => (
                                <p key={addon.id} className="text-xs text-gray-500">
                                  + {addon.name}
                                </p>
                              ))}
                            </div>
                          )}
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {formatPrice((item.price * item.quantity + (item.addons?.reduce((sum, a) => sum + a.price, 0) || 0) * item.quantity).toFixed(2))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotaal</span>
                      <span>{formatPrice(subtotal.toFixed(2))}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Bezorgkosten</span>
                      <span>{formatPrice(deliveryCost.toFixed(2))}</span>
                    </div>
                    {formData.insuredDelivery && (
                      <div className="flex justify-between text-gray-700">
                        <span className="flex items-center gap-1">
                          <Shield className="h-4 w-4 text-primary-600" />
                          Verzekerde levering
                        </span>
                        <span>{formatPrice(insuredDeliveryCost.toFixed(2))}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                      <span>Totaal</span>
                      <span>{formatPrice(total.toFixed(2))}</span>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Lock className="h-4 w-4" />
                      <span>Veilig betalen met SSL encryptie</span>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Bezig met verwerken...' : `Bestelling plaatsen - ${formatPrice(total.toFixed(2))}`}
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Door te bestellen ga je akkoord met onze{' '}
                      <Link href="/algemene-voorwaarden" className="text-primary-600 hover:underline">
                        algemene voorwaarden
                      </Link>
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
