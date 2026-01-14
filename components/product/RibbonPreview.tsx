'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface RibbonPreviewProps {
  text: string
  color: string
  onChange?: (text: string) => void
  className?: string
}

const ribbonColors = {
  rood: '#dc2626',
  roze: '#ec4899',
  blauw: '#3b82f6',
  geel: '#eab308',
  groen: '#22c55e',
  paars: '#a855f7',
  oranje: '#f97316',
  wit: '#ffffff',
  zwart: '#1f2937',
}

export default function RibbonPreview({ text, color, onChange, className }: RibbonPreviewProps) {
  const editableRef = useRef<HTMLDivElement>(null)
  const ribbonColor = ribbonColors[color as keyof typeof ribbonColors] || ribbonColors.rood

  // Sync contentEditable with text prop
  useEffect(() => {
    if (editableRef.current && editableRef.current.textContent !== text) {
      editableRef.current.textContent = text
    }
  }, [text])

  return (
    <div className={cn('relative', className)}>
      {/* Lint preview */}
      <div className="relative w-full max-w-md mx-auto">
        {/* Bloemen illustratie (placeholder) */}
        <div className="relative bg-gradient-to-b from-green-50 via-pink-50 to-green-100 rounded-lg overflow-hidden aspect-[3/4] flex items-center justify-center shadow-md">
          {/* Decoratieve bloemen icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <svg className="w-32 h-32 text-primary-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>

          {/* Lint */}
          <div
            className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 h-20 flex items-center justify-center shadow-xl z-10"
            style={{
              backgroundColor: ribbonColor,
              borderTop: `4px solid ${color === 'wit' ? '#e5e7eb' : 'rgba(0,0,0,0.15)'}`,
              borderBottom: `4px solid ${color === 'wit' ? '#e5e7eb' : 'rgba(0,0,0,0.15)'}`,
            }}
          >
            {/* Lint tekst - perfect gecentreerd en direct bewerkbaar */}
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div
                ref={editableRef}
                contentEditable={!!onChange}
                suppressContentEditableWarning
                onInput={(e) => {
                  if (onChange) {
                    const newText = e.currentTarget.textContent || ''
                    if (newText.length <= 30) {
                      onChange(newText)
                    } else {
                      e.currentTarget.textContent = newText.slice(0, 30)
                      onChange(newText.slice(0, 30))
                    }
                  }
                }}
                className="text-center px-3 py-2 font-bold text-lg md:text-xl leading-tight w-full cursor-text"
                style={{
                  color: color === 'wit' || color === 'geel' ? '#1f2937' : '#ffffff',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  textShadow: color === 'wit' || color === 'geel' ? 'none' : '0 2px 4px rgba(0,0,0,0.3)',
                  minHeight: '2.5rem',
                }}
                data-placeholder="Je tekst hier..."
              />
            </div>
          </div>

          {/* Decoratieve lint uiteinden (driehoekjes) */}
          <div
            className="absolute top-1/2 left-0 transform -translate-y-1/2 w-10 h-10 z-20"
            style={{
              backgroundColor: ribbonColor,
              clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
              borderTop: `4px solid ${color === 'wit' ? '#e5e7eb' : 'rgba(0,0,0,0.15)'}`,
              borderBottom: `4px solid ${color === 'wit' ? '#e5e7eb' : 'rgba(0,0,0,0.15)'}`,
            }}
          />
          <div
            className="absolute top-1/2 right-0 transform -translate-y-1/2 w-10 h-10 z-20"
            style={{
              backgroundColor: ribbonColor,
              clipPath: 'polygon(100% 0, 0 50%, 100% 100%)',
              borderTop: `4px solid ${color === 'wit' ? '#e5e7eb' : 'rgba(0,0,0,0.15)'}`,
              borderBottom: `4px solid ${color === 'wit' ? '#e5e7eb' : 'rgba(0,0,0,0.15)'}`,
            }}
          />
        </div>
      </div>
      <style jsx global>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: ${color === 'wit' || color === 'geel' ? '#6b7280' : 'rgba(255,255,255,0.7)'};
          font-style: italic;
        }
      `}</style>
    </div>
  )
}
