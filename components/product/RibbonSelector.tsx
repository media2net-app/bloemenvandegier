'use client'

import Card from '@/components/ui/Card'
import RibbonPreview from './RibbonPreview'
import { cn } from '@/lib/utils/cn'

interface RibbonSelectorProps {
  ribbonText: string
  ribbonColor: string
  onTextChange: (text: string) => void
  onColorChange: (color: string) => void
}

const ribbonColors = [
  { name: 'rood', label: 'Rood', value: 'rood' },
  { name: 'roze', label: 'Roze', value: 'roze' },
  { name: 'blauw', label: 'Blauw', value: 'blauw' },
  { name: 'geel', label: 'Geel', value: 'geel' },
  { name: 'groen', label: 'Groen', value: 'groen' },
  { name: 'paars', label: 'Paars', value: 'paars' },
  { name: 'oranje', label: 'Oranje', value: 'oranje' },
  { name: 'wit', label: 'Wit', value: 'wit' },
  { name: 'zwart', label: 'Zwart', value: 'zwart' },
]

export default function RibbonSelector({
  ribbonText,
  ribbonColor,
  onTextChange,
  onColorChange,
}: RibbonSelectorProps) {
  return (
    <Card className="p-4">
      <label className="block mb-4 font-semibold text-gray-900">
        Lint toevoegen
      </label>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Lint opties */}
        <div className="space-y-4">
          {/* Kleur selectie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kleur lint:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ribbonColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => onColorChange(color.value)}
                  className={cn(
                    'relative aspect-square rounded-lg border-2 transition-all hover:scale-105',
                    ribbonColor === color.value
                      ? 'border-primary-500 ring-2 ring-primary-200 scale-105'
                      : 'border-gray-300 hover:border-primary-300'
                  )}
                  style={{
                    backgroundColor: getColorValue(color.value),
                  }}
                  aria-label={`Kies ${color.label} lint`}
                >
                  {ribbonColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tekst op lint - info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tekst op lint:
            </label>
            <div className="text-sm text-gray-600 mb-2">
              Typ direct in het voorbeeld hiernaast
            </div>
            <div className="text-xs text-gray-500">
              Max: 30 tekens ({ribbonText.length}/30)
            </div>
          </div>
        </div>

        {/* Preview - Direct bewerkbaar */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-3 text-center lg:text-left">
            Voorbeeld (klik om te bewerken):
          </div>
          <RibbonPreview text={ribbonText} color={ribbonColor} onChange={onTextChange} />
        </div>
      </div>
    </Card>
  )
}

function getColorValue(color: string): string {
  const colors: Record<string, string> = {
    rood: '#dc2626',
    roze: '#ec4899',
    blauw: '#3b82f6',
    geel: '#eab308',
    groen: '#22c55e',
    paars: '#a855f7',
    oranje: '#f97316',
    wit: '#ffffff',
    zwart: '#1f2937',
  }
  return colors[color] || colors.rood
}
