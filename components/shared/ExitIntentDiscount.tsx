'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import { Mail, X, Copy, CheckCircle } from 'lucide-react'

const STORAGE_EMAIL_KEY = 'bdg_discount_email'
const STORAGE_CLAIMED_KEY = 'bdg_discount_claimed_10'

function isValidEmail(email: string) {
  // simple, practical check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export default function ExitIntentDiscount() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const hasShownRef = useRef(false)
  const enableBeforeUnloadRef = useRef(false)

  const discountCode = 'DEGIER10'

  const alreadyClaimed = useMemo(() => {
    if (typeof window === 'undefined') return true
    return (
      window.localStorage.getItem(STORAGE_CLAIMED_KEY) === 'true' ||
      !!window.localStorage.getItem(STORAGE_EMAIL_KEY)
    )
  }, [])

  useEffect(() => {
    if (alreadyClaimed) return

    // Enable the native leave-confirm after a short delay (avoid immediate annoyance).
    const enableTimer = window.setTimeout(() => {
      enableBeforeUnloadRef.current = true
    }, 8000)

    const onMouseOut = (e: MouseEvent) => {
      if (alreadyClaimed) return
      if (hasShownRef.current) return
      if (open) return

      // Exit intent: mouse moves out of viewport at the top (towards tab/URL bar)
      const relatedTarget = (e as any).relatedTarget as Node | null
      const toElement = (e as any).toElement as Node | null
      if (relatedTarget || toElement) return

      if (typeof e.clientY === 'number' && e.clientY <= 0) {
        hasShownRef.current = true
        setOpen(true)
      }
    }

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (alreadyClaimed) return
      if (!enableBeforeUnloadRef.current) return
      if (open) return

      // NOTE: browsers do not allow custom text here; this triggers a native confirm dialog.
      e.preventDefault()
      e.returnValue = ''
      return ''
    }

    window.addEventListener('mouseout', onMouseOut)
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      window.clearTimeout(enableTimer)
      window.removeEventListener('mouseout', onMouseOut)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [alreadyClaimed, open])

  const emailOk = isValidEmail(email)
  const showError = touched && !emailOk

  const close = () => setOpen(false)

  const onSubmit = async () => {
    setTouched(true)
    if (!emailOk) return

    // Save locally (no backend connected yet)
    try {
      window.localStorage.setItem(STORAGE_EMAIL_KEY, email.trim())
      window.localStorage.setItem(STORAGE_CLAIMED_KEY, 'true')
    } catch {
      // ignore storage errors
    }

    setSubmitted(true)
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(discountCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  if (alreadyClaimed) return null
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="10% korting popup"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <Card className="w-full max-w-lg p-6 relative">
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 rounded-md p-2 text-gray-500 hover:bg-gray-100"
          aria-label="Sluiten"
        >
          <X className="h-5 w-5" />
        </button>

        {!submitted ? (
          <>
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-full bg-primary-50 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">Wacht! Pak 10% korting</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Laat je e-mail achter en ontvang direct je kortingscode voor je bestelling.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="exitDiscountEmail" className="block text-sm font-medium text-gray-700 mb-2">
                E-mailadres
              </label>
              <input
                id="exitDiscountEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="naam@voorbeeld.nl"
                className={cn(
                  'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none',
                  showError ? 'border-red-300' : 'border-gray-300'
                )}
              />
              {showError && (
                <p className="mt-2 text-sm text-red-600">Vul een geldig e-mailadres in.</p>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button variant="outline" onClick={close}>
                Nee bedankt
              </Button>
              <Button onClick={onSubmit}>Ontvang 10% code</Button>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Door je e-mail achter te laten, ga je akkoord met het ontvangen van de kortingscode.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">Je code is klaar</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Gebruik deze kortingscode bij het afrekenen:
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="font-mono text-lg font-semibold text-gray-900">{discountCode}</div>
              <Button variant="outline" size="sm" onClick={copyCode}>
                <Copy className="h-4 w-4 mr-2" />
                {copied ? 'Gekopieerd' : 'Kopieer'}
              </Button>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={close}>Verder shoppen</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

