'use client'

import { useParams } from 'next/navigation'
import {
  PrintError,
  PrintLoading,
  PrintToolbar,
  usePrintOrder,
} from '@/components/order-dashboard/print-helpers'
import { PrintA4Styles } from '@/components/order-dashboard/print-styles'
import { PakbonDocument } from '@/components/order-dashboard/PrintDocuments'

export default function PrintPakbonPage() {
  const params = useParams()
  const id = String(params?.id || '')
  const { order, loading, error } = usePrintOrder(id)

  if (loading) return <PrintLoading />
  if (error || !order) return <PrintError message={error || 'Order niet gevonden'} />

  return (
    <div className="min-h-screen bg-white text-black" style={{ backgroundColor: '#fff' }}>
      <PrintA4Styles />
      <PrintToolbar
        title={`Pakbon #${order.number} · A4`}
        hint="Tip (Safari/macOS): kies “Alle pagina’s”. Alleen lange bestellingen lopen door op een 2e pagina."
      />
      <PakbonDocument order={order} pageIndex={1} pageTotal={1} isLast />
    </div>
  )
}
