'use client'

import { Calendar } from 'lucide-react'

interface DeliveryDateProps {
  className?: string
}

export default function DeliveryDate({ className }: DeliveryDateProps) {
  // Today is Tuesday, January 13, 2026
  const today = new Date(2026, 0, 13) // Month is 0-indexed (0 = January)
  const now = new Date()
  const currentHour = now.getHours()
  
  // If ordered before 23:59, delivery is next day
  // If ordered after cutoff (usually 23:59), delivery is day after next
  const cutoffHour = 23 // 23:59 cutoff
  const isBeforeCutoff = currentHour < cutoffHour
  
  // Calculate next available delivery date
  const nextDelivery = new Date(today)
  nextDelivery.setDate(today.getDate() + (isBeforeCutoff ? 1 : 2))
  
  // Skip Sundays (no delivery on Sundays typically)
  while (nextDelivery.getDay() === 0) {
    nextDelivery.setDate(nextDelivery.getDate() + 1)
  }
  
  // Format date in Dutch
  const dayNames = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
  const monthNames = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
  
  const dayName = dayNames[nextDelivery.getDay()]
  const day = nextDelivery.getDate()
  const month = monthNames[nextDelivery.getMonth()]
  const year = nextDelivery.getFullYear()
  
  const formattedDate = `${dayName} ${day} ${month} ${year}`
  
  return (
    <div className={`flex items-center gap-2 text-sm text-gray-700 ${className}`}>
      <Calendar className="h-4 w-4 text-primary-600 flex-shrink-0" />
      <span>
        <span className="font-medium">Eerst beschikbare levering:</span>{' '}
        <span className="text-primary-600 font-semibold">{formattedDate}</span>
      </span>
    </div>
  )
}
