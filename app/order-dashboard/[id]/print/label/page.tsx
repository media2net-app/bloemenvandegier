'use client'

import { useParams } from 'next/navigation'
import {
  PrintError,
  PrintLoading,
  PrintToolbar,
  usePrintOrder,
} from '@/components/order-dashboard/print-helpers'
import { LabelDocument } from '@/components/order-dashboard/PrintDocuments'

export default function PrintLabelPage() {
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
          body { margin: 0; }
          @page { size: 62mm 100mm; margin: 0; }
          .label-sheet { page-break-after: always; border: none !important; margin: 0 !important; }
        }
      `}</style>
      <PrintToolbar title={`Label #${order.number} · 62×100 mm`} />
      <LabelDocument order={order} />
    </div>
  )
}
