'use client'

import { useState } from 'react'
import { Calendar, Clock, CheckCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

interface DeliveryDateSelectorProps {
  onDateSelect?: (date: string, time: 'day' | 'evening') => void
  className?: string
}

export default function DeliveryDateSelector({ onDateSelect, className }: DeliveryDateSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<'day' | 'evening'>('day')
  const [isExpanded, setIsExpanded] = useState(false)

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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value
    setSelectedDate(date)
    
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

    if (onDateSelect && date && isDateAvailable(date)) {
      onDateSelect(date, selectedTime)
    }
  }

  const handleTimeChange = (time: 'day' | 'evening') => {
    setSelectedTime(time)
    if (onDateSelect && selectedDate && isDateAvailable(selectedDate)) {
      onDateSelect(selectedDate, time)
    }
  }

  // Get quick date options
  const getQuickDates = () => {
    const dates: Array<{ label: string; value: string; date: Date }> = []
    const today = new Date()
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      if (date.getDay() !== 0) { // Skip Sundays
        const isTomorrow = i === 1
        dates.push({
          label: isTomorrow ? 'Morgen' : date.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' }),
          value: date.toISOString().split('T')[0],
          date
        })
      }
    }
    
    return dates.slice(0, 5)
  }

  const quickDates = getQuickDates()
  const hasSelection = selectedDate && isDateAvailable(selectedDate)

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-bold text-gray-900">Kies je bezorgdatum</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {isExpanded ? 'Minder opties' : 'Meer opties'}
          </button>
        </div>

        {/* Quick Date Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Snelle keuze
          </label>
          <div className="flex flex-wrap gap-2">
            {quickDates.map((quickDate) => {
              const isSelected = selectedDate === quickDate.value
              return (
                <button
                  key={quickDate.value}
                  type="button"
                  onClick={() => {
                    setSelectedDate(quickDate.value)
                    if (onDateSelect) {
                      onDateSelect(quickDate.value, selectedTime)
                    }
                  }}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium",
                    isSelected
                      ? "border-primary-500 bg-primary-500 text-white"
                      : "border-gray-300 text-gray-700 hover:border-primary-300 hover:bg-primary-50"
                  )}
                >
                  {quickDate.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Expanded Date Picker */}
        {isExpanded && (
          <div>
            <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
              Of kies een specifieke datum
            </label>
            <input
              type="date"
              id="deliveryDate"
              min={getMinDate()}
              max={getMaxDate()}
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        )}

        {/* Time Selection */}
        {hasSelection && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary-600" />
              Bezorgtijd
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTimeChange('day')}
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
                onClick={() => handleTimeChange('evening')}
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
        )}

        {/* Selected Date Display */}
        {hasSelection && (
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900 mb-1">
                  Bezorging geselecteerd
                </p>
                <p className="text-sm text-green-800">
                  <strong>{formatDate(selectedDate)}</strong> tussen{' '}
                  <strong>{selectedTime === 'day' ? '09:00 - 17:00' : '17:00 - 21:00'}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            • Bestel vandaag voor 23:59, bezorging morgen mogelijk<br />
            • Geen bezorging op zondag<br />
            • Bezorging in heel Nederland en België
          </p>
        </div>
      </div>
    </Card>
  )
}
