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
          html, body { background: #fff !important; color: #000 !important; }
          .print-sheet, .print-sheet * { color: #000 !important; visibility: visible !important; }
          @page { size: A4; margin: 12mm; }
          .print-sheet { page-break-after: always; break-after: page; }
        }
      `}</style>
      <PrintToolbar
        title={`Pakbon #${order.number} · A4`}
        hint="Tip (Safari/macOS): kies “Alle pagina’s”, niet “Selectie”."
      />
      <PakbonDocument order={order} pageIndex={1} pageTotal={1} />
    </div>
  )
}
