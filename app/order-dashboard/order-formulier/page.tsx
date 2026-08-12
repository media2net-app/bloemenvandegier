'use client'

import { ExternalLink } from 'lucide-react'
import Button from '@/components/ui/Button'

const ORDER_FORM_URL = 'https://www.bloemenvandegier.nl/order-formulier'

export default function OrderFormulierPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-600">
          Live orderformulier vanuit de huidige shop.
        </p>
        <a href={ORDER_FORM_URL} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in nieuw tabblad
          </Button>
        </a>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <iframe
          src={ORDER_FORM_URL}
          title="Live orderformulier"
          className="h-[calc(100vh-230px)] min-h-[720px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  )
}
