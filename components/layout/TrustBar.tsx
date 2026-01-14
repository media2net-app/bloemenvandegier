'use client'

import { useState, useEffect } from 'react'
import { Star, Truck, Shield, Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export default function TrustBar() {
  const trustItems = [
    {
      icon: Star,
      text: '9.1 uit 4700+ reviews',
      highlight: '9.1',
    },
    {
      icon: Truck,
      text: 'Bezorging in heel Nederland & België',
    },
    {
      icon: Shield,
      text: '7 dagen versgarantie',
    },
    {
      icon: Heart,
      text: 'Meer bloemen voor je geld',
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-scroll slideshow on mobile
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trustItems.length)
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [trustItems.length])

  return (
    <div className="bg-primary-50 border-b border-primary-100">
      <div className="container mx-auto px-4 py-3">
        {/* Desktop: Show all items */}
        <div className="hidden md:flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700">
          {trustItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary-600" />
                <span>
                  {item.highlight ? (
                    <>
                      <span className="font-bold text-primary-600">{item.highlight}</span>{' '}
                      {item.text.replace(item.highlight, '')}
                    </>
                  ) : (
                    item.text
                  )}
                </span>
              </div>
            )
          })}
        </div>

        {/* Mobile: Slideshow */}
        <div className="md:hidden relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {trustItems.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={index}
                  className="min-w-full flex items-center justify-center gap-2 text-sm text-gray-700"
                >
                  <Icon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                  <span className="text-center">
                    {item.highlight ? (
                      <>
                        <span className="font-bold text-primary-600">{item.highlight}</span>{' '}
                        {item.text.replace(item.highlight, '')}
                      </>
                    ) : (
                      item.text
                    )}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-2">
            {trustItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  index === currentIndex
                    ? 'w-6 bg-primary-600'
                    : 'w-1.5 bg-primary-300'
                )}
                aria-label={`Ga naar slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
