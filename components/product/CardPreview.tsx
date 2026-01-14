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
    if (editableRef.current && editableRef.current.innerText !== message) {
      editableRef.current.innerText = message
    }
  }, [message])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText || ''
    if (text.length <= 150) {
      onChange(text)
    } else {
      // Truncate to 150 characters
      const truncated = text.slice(0, 150)
      e.currentTarget.innerText = truncated
      onChange(truncated)
      // Move cursor to end
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(e.currentTarget)
      range.collapse(false)
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    // If empty, ensure cursor is positioned correctly
    if (!e.currentTarget.innerText.trim() && !e.currentTarget.innerHTML.trim()) {
      // Add a zero-width space to ensure the div is not empty, which helps with centering
      e.currentTarget.innerHTML = '<br>'
      const range = document.createRange()
      const selection = window.getSelection()
      range.setStart(e.currentTarget, 0)
      range.collapse(true)
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }

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
            onInput={handleInput}
            onFocus={handleFocus}
            className="w-full text-center px-3 py-4 text-gray-800 text-base md:text-lg leading-relaxed font-serif bg-transparent border-none focus:outline-none"
            style={{
              textAlign: 'center',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'pre-wrap',
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
