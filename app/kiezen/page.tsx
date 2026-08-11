'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeftRight, Package, ArrowRight, LogOut } from 'lucide-react'
import { useAuthStore } from '@/lib/auth/store'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function KiezenPage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-pink-50">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-12">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/logo.svg"
              alt="Bloemen van De Gier"
              width={180}
              height={45}
              className="h-10 w-auto"
            />
            <div>
              <p className="text-sm text-gray-500">Ingelogd als</p>
              <p className="font-medium text-gray-900">{user?.name || user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              logout()
              router.push('/login')
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Uitloggen
          </Button>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">Waar wil je naartoe?</h1>
        <p className="mb-8 text-gray-600">Kies het dashboard waarmee je wilt werken.</p>

        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/migratie" className="group block">
            <Card className="h-full border-2 border-transparent p-6 transition hover:border-primary-300 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <ArrowLeftRight className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary-700">
                Migratie dashboard
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                WooCommerce → Shopify: taken, livegang, handleiding en orderformulier voor Sam.
              </p>
              <span className="mt-6 inline-flex items-center text-sm font-semibold text-primary-600">
                Openen
                <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Card>
          </Link>

          <Link href="/order-dashboard" className="group block">
            <Card className="h-full border-2 border-transparent p-6 transition hover:border-primary-300 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Package className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary-700">
                Order dashboard
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Live WooCommerce-orders bekijken en pakbonnen, facturen en kaartjes printen.
              </p>
              <span className="mt-6 inline-flex items-center text-sm font-semibold text-primary-600">
                Openen
                <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
