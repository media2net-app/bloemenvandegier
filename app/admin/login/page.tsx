'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, Shield, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('demo@bloemenvandegier.nl')
  const [password, setPassword] = useState('Admin@Bloemen2024!')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Simulate admin login
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, accept any password with the demo email
      if (email === 'demo@bloemenvandegier.nl') {
        // Store admin session (you can use localStorage or a store)
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_authenticated', 'true')
          localStorage.setItem('admin_email', email)
        }
        router.push('/admin')
      } else {
        setError('Ongeldige inloggegevens. Gebruik demo@bloemenvandegier.nl')
      }
    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo.svg"
              alt="Bloemen van De Gier"
              width={200}
              height={50}
              className="h-12 w-auto mx-auto brightness-0 invert"
            />
          </Link>
        </div>

        {/* Admin Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-white/20">
          {/* Admin Badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="p-2 bg-primary-500 rounded-full">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          </div>
          
          <p className="text-center text-gray-600 mb-6">Beveiligde toegang tot het admin dashboard</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors bg-white"
                  placeholder="admin@bloemenvandegier.nl"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Onthoud mij</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                'Bezig met inloggen...'
              ) : (
                <>
                  Inloggen als Admin
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-sm text-primary-800">
              <strong>Demo account:</strong> De gegevens zijn al ingevuld. Klik op "Inloggen als Admin" om door te gaan.
            </p>
          </div>

          {/* Back to Site Link */}
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
            >
              ← Terug naar website
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-xs">
            <Shield className="inline h-3 w-3 mr-1" />
            Beveiligde verbinding
          </p>
        </div>
      </div>
    </div>
  )
}
