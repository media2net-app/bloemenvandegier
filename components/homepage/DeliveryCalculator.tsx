'use client'

import { useState } from 'react'
import { Calendar, Clock, Truck, CheckCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

export default function DeliveryCalculator() {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<'day' | 'evening'>('day')
  const [showResults, setShowResults] = useState(false)

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // Get maximum date (30 days from now)
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

  // Check if date is available (not Sunday)
  const isDateAvailable = (dateString: string) => {
    if (!dateString) return false
    const date = new Date(dateString)
    return date.getDay() !== 0 // No delivery on Sunday
  }

  const handleCalculate = () => {
    if (selectedDate && isDateAvailable(selectedDate)) {
      setShowResults(true)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value
    setSelectedDate(date)
    setShowResults(false)
    
    // Auto-check if Sunday
    if (date) {
      const selected = new Date(date)
      if (selected.getDay() === 0) {
        // If Sunday, suggest next day
        const nextDay = new Date(selected)
        nextDay.setDate(selected.getDate() + 1)
        setSelectedDate(nextDay.toISOString().split('T')[0])
      }
    }
  }

  const availableDates = []
  const today = new Date()
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    if (date.getDay() !== 0) { // Skip Sundays
      availableDates.push(date.toISOString().split('T')[0])
    }
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
              Wanneer wil je de bloemen ontvangen?
            </h2>
            <p className="text-gray-600 text-lg">
              Kies je bezorgdatum en tijdstip - wij zorgen dat je bloemen op tijd aankomen
            </p>
          </div>

          <Card className="p-8">
            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  Selecteer bezorgdatum
                </label>
                <input
                  type="date"
                  id="deliveryDate"
                  min={getMinDate()}
                  max={getMaxDate()}
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-lg"
                />
                {selectedDate && (
                  <p className="mt-2 text-sm text-gray-600">
                    Geselecteerd: <strong>{formatDate(selectedDate)}</strong>
                  </p>
                )}
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary-600" />
                  Bezorgtijd
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTime('day')}
                    className={cn(
                      "p-4 border-2 rounded-lg transition-all text-left",
                      selectedTime === 'day'
                        ? "border-primary-500 bg-primary-50 shadow-md"
                        : "border-gray-300 hover:border-primary-300"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-5 w-5 text-primary-600" />
                      <span className="font-bold text-gray-900">Overdag</span>
                    </div>
                    <p className="text-sm text-gray-600">09:00 - 17:00</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTime('evening')}
                    className={cn(
                      "p-4 border-2 rounded-lg transition-all text-left",
                      selectedTime === 'evening'
                        ? "border-primary-500 bg-primary-50 shadow-md"
                        : "border-gray-300 hover:border-primary-300"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-5 w-5 text-primary-600" />
                      <span className="font-bold text-gray-900">Avond</span>
                    </div>
                    <p className="text-sm text-gray-600">17:00 - 21:00</p>
                  </button>
                </div>
              </div>

              {/* Quick Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Of kies een snelle optie:
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableDates.slice(0, 5).map((date) => {
                    const dateObj = new Date(date)
                    const isSelected = selectedDate === date
                    const isTomorrow = date === getMinDate()
                    
                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => {
                          setSelectedDate(date)
                          setShowResults(false)
                        }}
                        className={cn(
                          "px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium",
                          isSelected
                            ? "border-primary-500 bg-primary-500 text-white"
                            : "border-gray-300 text-gray-700 hover:border-primary-300 hover:bg-primary-50"
                        )}
                      >
                        {isTomorrow ? 'Morgen' : dateObj.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Calculate Button */}
              <Button
                onClick={handleCalculate}
                disabled={!selectedDate || !isDateAvailable(selectedDate)}
                className="w-full"
                size="lg"
              >
                <Truck className="h-5 w-5 mr-2" />
                Bekijk beschikbare producten voor deze datum
              </Button>

              {/* Results */}
              {showResults && selectedDate && (
                <div className="mt-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-green-900 mb-2">
                        Bezorging beschikbaar!
                      </h3>
                      <p className="text-green-800 mb-4">
                        Je bloemen kunnen bezorgd worden op <strong>{formatDate(selectedDate)}</strong> tussen <strong>{selectedTime === 'day' ? '09:00 - 17:00' : '17:00 - 21:00'}</strong>.
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        className="border-green-600 text-green-700 hover:bg-green-100"
                      >
                        <a href="/boeketten">
                          Bekijk beschikbare boeketten
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <Truck className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Bezorginformatie</p>
                    <ul className="space-y-1">
                      <li>• Bestel vandaag voor 23:59, bezorging morgen mogelijk</li>
                      <li>• Geen bezorging op zondag</li>
                      <li>• Bezorging in heel Nederland en België</li>
                      <li>• Bezorgkosten: €4,95 (gratis vanaf €50)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
