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
          html, body, .min-h-screen {
            background: #fff !important;
            color: #000 !important;
            min-height: 0 !important;
            height: auto !important;
          }
          .print-sheet, .print-sheet * { color: #000 !important; visibility: visible !important; }
          @page { size: A4; margin: 12mm; }
          .print-sheet {
            page-break-inside: auto;
            break-inside: auto;
          }
          .print-sheet-break { page-break-after: always; break-after: page; }
          .print-sheet-last { page-break-after: auto !important; break-after: auto !important; }
          .pakbon-products { border-collapse: collapse !important; }
          .pakbon-product-row-sep td {
            border-bottom: 2px solid #000 !important;
            padding-bottom: 12px !important;
          }
          .pakbon-extra-highlight {
            border-left: 3px solid #000 !important;
          }
        }
      `}</style>
      <PrintToolbar
        title={`Pakbon #${order.number} · A4`}
        hint="Tip (Safari/macOS): kies “Alle pagina’s”. Alleen lange bestellingen lopen door op een 2e pagina."
      />
      <PakbonDocument order={order} pageIndex={1} pageTotal={1} isLast />
    </div>
  )
}
