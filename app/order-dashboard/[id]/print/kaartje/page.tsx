'use client'

import { useParams } from 'next/navigation'
import {
  PrintError,
  PrintLoading,
  PrintToolbar,
  printHelpers,
  usePrintOrder,
} from '@/components/order-dashboard/print-helpers'
import { KaartjeDocuments } from '@/components/order-dashboard/PrintDocuments'

export default function PrintKaartjePage() {
  const params = useParams()
  const id = String(params?.id || '')
  const { order, loading, error } = usePrintOrder(id)

  if (loading) return <PrintLoading />
  if (error || !order) return <PrintError message={error || 'Order niet gevonden'} />

  const cards = printHelpers.getKaartjeTexts(order)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { size: 148mm 105mm; margin: 0; }
          .card-sheet { page-break-after: always; border: none !important; margin: 0 !important; }
        }
      `}</style>
      <PrintToolbar title={`Kaartje #${order.number} · A6 dubbelgevouwen`} />

      {cards.length === 0 ? (
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <h1 className="text-xl font-bold">Geen kaartje bij #{order.number}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Deze bestelling heeft geen kaartjetekst in de orderregels.
          </p>
        </div>
      ) : (
        <KaartjeDocuments order={order} />
      )}
    </div>
  )
}
