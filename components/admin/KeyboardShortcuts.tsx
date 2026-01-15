'use client'

import { X, Search, Save, Plus, Edit, Trash2, Download, Upload, Eye, Copy, Undo, Redo, Filter, Settings, Home, ArrowLeft, ArrowRight, Printer, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Shortcut {
  category: string
  shortcuts: Array<{
    keys: string[]
    description: string
    icon?: any
  }>
}

interface KeyboardShortcutsProps {
  isOpen: boolean
  onClose: () => void
}

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  if (!isOpen) return null

  const shortcuts: Shortcut[] = [
    {
      category: 'Navigatie',
      shortcuts: [
        { keys: ['Cmd', 'K'], description: 'Global search', icon: Search },
        { keys: ['?'], description: 'Toon shortcuts', icon: HelpCircle },
        { keys: ['Esc'], description: 'Sluit modals/menus', icon: X },
        { keys: ['Cmd', 'H'], description: 'Ga naar homepage', icon: Home },
        { keys: ['Cmd', '←'], description: 'Vorige pagina', icon: ArrowLeft },
        { keys: ['Cmd', '→'], description: 'Volgende pagina', icon: ArrowRight },
      ],
    },
    {
      category: 'Acties',
      shortcuts: [
        { keys: ['Cmd', 'S'], description: 'Opslaan', icon: Save },
        { keys: ['Cmd', 'N'], description: 'Nieuw item', icon: Plus },
        { keys: ['Cmd', 'E'], description: 'Bewerken', icon: Edit },
        { keys: ['Cmd', 'D'], description: 'Dupliceren', icon: Copy },
        { keys: ['Delete'], description: 'Verwijderen', icon: Trash2 },
        { keys: ['Cmd', 'Z'], description: 'Ongedaan maken', icon: Undo },
        { keys: ['Cmd', 'Shift', 'Z'], description: 'Opnieuw doen', icon: Redo },
      ],
    },
    {
      category: 'Data',
      shortcuts: [
        { keys: ['Cmd', 'E'], description: 'Export', icon: Download },
        { keys: ['Cmd', 'I'], description: 'Import', icon: Upload },
        { keys: ['Cmd', 'F'], description: 'Filter', icon: Filter },
        { keys: ['Cmd', 'P'], description: 'Print', icon: Printer },
      ],
    },
    {
      category: 'Weergave',
      shortcuts: [
        { keys: ['Cmd', 'V'], description: 'Preview', icon: Eye },
        { keys: ['Cmd', ',',], description: 'Instellingen', icon: Settings },
      ],
    },
  ]

  const getKeyDisplay = (key: string) => {
    const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
    
    if (key === 'Cmd') {
      return isMac ? '⌘' : 'Ctrl'
    }
    if (key === 'Shift') {
      return isMac ? '⇧' : 'Shift'
    }
    if (key === 'Alt') {
      return isMac ? '⌥' : 'Alt'
    }
    if (key === '←') return '←'
    if (key === '→') return '→'
    if (key === 'Esc') return 'Esc'
    if (key === 'Delete') return 'Del'
    if (key === '?') return '?'
    
    return key
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
              <p className="text-sm text-gray-600 mt-1">Sneltoetsen voor snellere workflow</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shortcuts.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    {category.category}
                  </h3>
                  <div className="space-y-2">
                    {category.shortcuts.map((shortcut, index) => {
                      const Icon = shortcut.icon
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {Icon && (
                              <div className="p-1.5 bg-white rounded border border-gray-200">
                                <Icon className="h-4 w-4 text-gray-600" />
                              </div>
                            )}
                            <span className="text-sm text-gray-700">
                              {shortcut.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, keyIndex) => (
                              <span key={keyIndex}>
                                <kbd className="px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded shadow-sm">
                                  {getKeyDisplay(key)}
                                </kbd>
                                {keyIndex < shortcut.keys.length - 1 && (
                                  <span className="mx-1 text-gray-400">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Tip */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Tip:</strong> Druk op <kbd className="px-2 py-1 text-xs font-semibold bg-white border border-blue-300 rounded">?</kbd> op elk moment om dit overzicht te openen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
