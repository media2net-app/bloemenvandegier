'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth/store'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    if (!isAuthenticated) router.replace('/login')
  }, [ready, isAuthenticated, router])

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">{!ready ? 'Laden…' : 'Doorsturen naar login…'}</p>
      </div>
    )
  }

  return <>{children}</>
}
