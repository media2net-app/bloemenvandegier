'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardPreviewProps {
  message: string
  onChange: (value: string) => void
  className?: string
}

export default function CardPreview({ message, onChange, className }: CardPreviewProps) {
  const editableRef = useRef<HTMLDivElement>(null)

  // Sync contentEditable with message prop
  useEffect(() => {
    if (editableRef.current && editableRef.current.textContent !== message) {
      editableRef.current.textContent = message
    }
  }, [message])

  return (
    <div className={cn('relative', className)}>
      {/* Kaartje - liggend formaat (landscape) - Direct bewerkbaar */}
      <div className="relative w-full aspect-[3/2] max-w-md mx-auto bg-gradient-to-br from-white via-pink-50/30 to-primary-50/30 rounded-xl shadow-xl border-2 border-primary-200/50 p-6 md:p-8 overflow-hidden">
        {/* Decoratieve hoek elementen */}
        <div className="absolute top-3 left-3 w-8 h-8 border-2 border-primary-200/50 rounded-full opacity-30 pointer-events-none" />
        <div className="absolute top-3 right-3 w-8 h-8 border-2 border-primary-200/50 rounded-full opacity-30 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-2 border-primary-200/50 rounded-full opacity-30 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-2 border-primary-200/50 rounded-full opacity-30 pointer-events-none" />
        
        {/* Decoratieve lijnen bovenaan en onderaan */}
        <div className="absolute top-2 left-8 right-8 h-0.5 bg-primary-100/50 rounded-full pointer-events-none" />
        <div className="absolute bottom-2 left-8 right-8 h-0.5 bg-primary-100/50 rounded-full pointer-events-none" />

        {/* Kaartje tekst - Direct bewerkbaar, perfect gecentreerd */}
        <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => {
              const text = e.currentTarget.textContent || ''
              if (text.length <= 150) {
                onChange(text)
              } else {
                e.currentTarget.textContent = text.slice(0, 150)
                onChange(text.slice(0, 150))
              }
            }}
            className="w-full h-full text-center px-3 py-4 text-gray-800 text-base md:text-lg leading-relaxed font-serif bg-transparent border-none focus:outline-none overflow-auto"
            style={{
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
            data-placeholder="Schrijf hier je persoonlijke boodschap..."
          />
        </div>
        <style jsx global>{`
          [contenteditable][data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            font-style: italic;
          }
        `}</style>
      </div>
      
      {/* Character counter */}
      <div className="mt-2 text-center text-sm text-gray-500">
        Max: 150 tekens ({message.length}/150)
      </div>
    </div>
  )
}
