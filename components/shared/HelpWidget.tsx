'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, HelpCircle, X, User } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export default function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)

  // Close widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const staff = [
    { name: 'Sam de Gier', status: 'online', avatar: '👨‍💼' },
    { name: 'Rolf de Gier', status: 'online', avatar: '👨‍💼' },
  ]

  return (
    <div className="fixed bottom-6 left-6 z-50" ref={widgetRef}>
      {/* Widget Panel */}
      {isOpen && (
        <div className="absolute bottom-20 left-0 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 ease-out">
          {/* Header */}
          <div className="bg-primary-500 text-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">Hulp nodig?</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Sluiten"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-primary-100">
              We helpen je graag verder!
            </p>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* FAQ Link */}
            <Link
              href="/veelgestelde-vragen"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors group"
            >
              <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                <HelpCircle className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Meest gestelde vragen</h4>
                <p className="text-sm text-gray-600">Bekijk veelgestelde vragen</p>
              </div>
            </Link>

            {/* Chat Section */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Start een chat</h4>
              <div className="space-y-2">
                {staff.map((person, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // TODO: Implement chat functionality
                      alert(`Chat met ${person.name} wordt binnenkort beschikbaar!`)
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors group"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-xl group-hover:bg-primary-200 transition-colors">
                        {person.avatar}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{person.name}</span>
                        <span className="text-xs text-green-600 font-medium">● Online</span>
                      </div>
                      <p className="text-sm text-gray-600">Klik om te chatten</p>
                    </div>
                    <MessageCircle className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300",
          isOpen
            ? "bg-primary-600 rotate-45"
            : "bg-primary-500 hover:bg-primary-600 hover:scale-110"
        )}
        aria-label="Hulp nodig?"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  )
}
