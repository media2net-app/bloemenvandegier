'use client'

import { Suspense } from 'react'
import BulkPrintContent from '@/components/order-dashboard/BulkPrintContent'
import { PrintLoading } from '@/components/order-dashboard/print-helpers'

export default function BulkPrintPage() {
  return (
    <Suspense fallback={<PrintLoading />}>
      <BulkPrintContent />
    </Suspense>
  )
}
