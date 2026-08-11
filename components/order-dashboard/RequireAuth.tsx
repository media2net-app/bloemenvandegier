'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth/store'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const finish = () => setHydrated(true)
    if (useAuthStore.persist.hasHydrated()) {
      finish()
      return
    }
    return useAuthStore.persist.onFinishHydration(finish)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) router.replace('/login')
  }, [hydrated, isAuthenticated, router])

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Laden…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Doorsturen naar login…</p>
      </div>
    )
  }

  return <>{children}</>
}
