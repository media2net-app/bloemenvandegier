'use client'

import { useState } from 'react'
import { MessageSquare, Gift, Plus } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

interface ProductAddonsProps {
  onCardMessageChange?: (message: string) => void
  onAddonsChange?: (addons: string[]) => void
}

const availableAddons = [
  { id: 'kaartje', name: 'Kaartje schrijven', icon: MessageSquare, description: 'Voeg een persoonlijk kaartje toe aan je bestelling' },
  { id: 'verpakking', name: 'Feestelijke verpakking', icon: Gift, description: 'Extra feestelijke verpakking voor je cadeau' },
  { id: 'rozenvoeding', name: 'Rozenvoeding', icon: Plus, description: 'Voedingsmiddel voor langere levensduur' },
]

export default function ProductAddons({ 
  onCardMessageChange, 
  onAddonsChange 
}: ProductAddonsProps) {
  const [cardMessage, setCardMessage] = useState('')
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [showCardInput, setShowCardInput] = useState(false)

  const handleAddonToggle = (addonId: string) => {
    const newAddons = selectedAddons.includes(addonId)
      ? selectedAddons.filter(id => id !== addonId)
      : [...selectedAddons, addonId]
    
    setSelectedAddons(newAddons)
    onAddonsChange?.(newAddons)

    // Auto-show card input when kaartje is selected
    if (addonId === 'kaartje' && !selectedAddons.includes('kaartje')) {
      setShowCardInput(true)
    }
  }

  const handleCardMessageChange = (value: string) => {
    setCardMessage(value)
    onCardMessageChange?.(value)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">Maak je bestelling speciaal</h3>

      {/* Addons */}
      <div className="space-y-2">
        {availableAddons.map((addon) => {
          const Icon = addon.icon
          const isSelected = selectedAddons.includes(addon.id)
          
          return (
            <Card
              key={addon.id}
              className={cn(
                'p-4 cursor-pointer transition-all',
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'hover:border-primary-300'
              )}
              onClick={() => handleAddonToggle(addon.id)}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleAddonToggle(addon.id)}
                  className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-5 w-5 text-primary-600" />
                    <span className="font-semibold text-gray-900">{addon.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{addon.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Card Message Input */}
      {(showCardInput || selectedAddons.includes('kaartje')) && (
        <Card className="p-4 border-primary-200 bg-primary-50">
          <label className="block mb-2 font-semibold text-gray-900">
            <MessageSquare className="inline h-4 w-4 mr-2 text-primary-600" />
            Persoonlijk kaartje
          </label>
          <textarea
            value={cardMessage}
            onChange={(e) => handleCardMessageChange(e.target.value)}
            placeholder="Schrijf hier je persoonlijke boodschap..."
            className="w-full min-h-[100px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            maxLength={500}
          />
          <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
            <span>Maximaal 500 karakters</span>
            <span>{cardMessage.length}/500</span>
          </div>
        </Card>
      )}
    </div>
  )
}
