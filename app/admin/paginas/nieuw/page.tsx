'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPaginaNieuwPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/paginas/bewerken/new')
  }, [router])

  return null
}
