'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { X, Undo, CheckCircle } from 'lucide-react'
import { undoRedoManager, UndoAction } from '@/lib/utils/undo-redo'

export default function UndoToast() {
  const pathname = usePathname()
  const [action, setAction] = useState<UndoAction | null>(null)
  const [show, setShow] = useState(false)
  
  // Only show on admin pages
  if (!pathname || !pathname.startsWith('/admin')) {
    return null
  }

  useEffect(() => {
    let lastActionId: string | null = null
    
    // Listen for new actions
    const checkForActions = () => {
      const history = undoRedoManager.getHistory()
      if (history.length > 0) {
        const lastAction = history[0]
        if (lastAction && lastAction.id !== lastActionId) {
          lastActionId = lastAction.id
          setAction(lastAction)
          setShow(true)
          
          // Auto-hide after 5 seconds
          setTimeout(() => {
            setShow(false)
            setTimeout(() => setAction(null), 300)
          }, 5000)
        }
      }
    }

    const interval = setInterval(checkForActions, 500)
    return () => clearInterval(interval)
  }, [])

  const handleUndo = () => {
    if (action) {
      undoRedoManager.undo()
      setShow(false)
      setTimeout(() => setAction(null), 300)
    }
  }

  const handleDismiss = () => {
    setShow(false)
    setTimeout(() => setAction(null), 300)
  }

  if (!action || !show) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px] flex items-center gap-3">
        <div className="flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{action.description}</p>
          <p className="text-xs text-gray-500 mt-0.5">Klik op Ongedaan maken om terug te draaien</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1"
          >
            <Undo className="h-4 w-4" />
            Ongedaan maken
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
}
