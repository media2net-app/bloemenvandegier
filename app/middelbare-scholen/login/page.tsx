'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/lib/auth/store'
import Button from '@/components/ui/Button'
import { Mail, Lock, ArrowRight, School, Heart } from 'lucide-react'

export default function MiddelbareScholenLoginPage() {
  const router = useRouter()
  const loginMiddelbareSchool = useAuthStore((state) => state.loginMiddelbareSchool)
  const [email, setEmail] = useState('middelbare-school@voorbeeld.nl')
  const [password, setPassword] = useState('demo123')
  const [schoolName, setSchoolName] = useState('Middelbare School De Vlieger')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password || !schoolName) {
      setError('Vul alle velden in')
      return
    }

    setIsLoading(true)

    try {
      const success = await loginMiddelbareSchool(email, password, schoolName)
      if (success) {
        router.push('/middelbare-scholen/valentijn')
      } else {
        setError('Inloggen mislukt. Probeer het opnieuw.')
      }
    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo.svg"
              alt="Bloemen van De Gier"
              width={200}
              height={50}
              className="h-12 w-auto mx-auto"
            />
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
              <School className="h-8 w-8 text-pink-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Middelbare Scholen Login</h1>
            <p className="text-gray-600">Toegang tot Valentijn assortiment</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* School Name */}
            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-2">
                Naam van de school *
              </label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="schoolName"
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  placeholder="Bijv. Middelbare School De Vlieger"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mailadres *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  placeholder="contact@school.nl"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Wachtwoord *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-pink-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-gray-900 mb-1">Valentijn Campagne 2026</p>
                  <p>Na inloggen krijg je toegang tot ons speciale Valentijn assortiment met voordelige prijzen voor middelbare scholen.</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                'Bezig met inloggen...'
              ) : (
                <>
                  Inloggen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-pink-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Demo account:</strong> De gegevens zijn al ingevuld. Klik op "Inloggen" om door te gaan.
            </p>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Nog geen account?{' '}
              <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
                Neem contact op
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
