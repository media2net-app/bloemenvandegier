'use client'

import { useParams } from 'next/navigation'
import {
  PrintError,
  PrintLoading,
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

  async function openPdf() {
    const res = await fetch('/api/order-dashboard/kaartjes-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIds: [order!.id] }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'PDF mislukt')
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { size: 148mm 105mm; margin: 0; }
          .card-sheet {
            page-break-after: always;
            border: none !important;
            margin: 0 !important;
            width: 148mm !important;
            height: 105mm !important;
          }
          .card-sheet:last-child { page-break-after: auto; }
        }
      `}</style>
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <p className="text-sm font-medium text-gray-700">
          Kaartje #{order.number} · A6 dubbelgevouwen (tekst rechts)
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void openPdf()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Open PDF
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Printen
          </button>
        </div>
      </div>

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
