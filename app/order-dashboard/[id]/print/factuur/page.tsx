'use client'

import { useParams } from 'next/navigation'
import {
  PrintError,
  PrintLoading,
  PrintToolbar,
  usePrintOrder,
} from '@/components/order-dashboard/print-helpers'
import { FactuurDocument } from '@/components/order-dashboard/PrintDocuments'

export default function PrintFactuurPage() {
  const params = useParams()
  const id = String(params?.id || '')
  const { order, loading, error } = usePrintOrder(id)

  if (loading) return <PrintLoading />
  if (error || !order) return <PrintError message={error || 'Order niet gevonden'} />

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 12mm; }
        }
      `}</style>
      <PrintToolbar title={`Factuur #${order.number}`} />
      <FactuurDocument order={order} />
    </div>
  )
}
