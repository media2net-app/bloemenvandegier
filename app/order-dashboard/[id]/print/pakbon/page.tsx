'use client'

import { useParams } from 'next/navigation'
import {
  PrintError,
  PrintLoading,
  PrintToolbar,
  usePrintOrder,
} from '@/components/order-dashboard/print-helpers'
import { PakbonDocument } from '@/components/order-dashboard/PrintDocuments'

export default function PrintPakbonPage() {
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
          @page { margin: 12mm; }
        }
      `}</style>
      <PrintToolbar title={`Pakbon #${order.number}`} />
      <PakbonDocument order={order} />
    </div>
  )
}
