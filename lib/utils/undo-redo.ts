// Undo/Redo utility for admin actions

export interface UndoAction {
  id: string
  type: string
  description: string
  undo: () => void
  redo: () => void
  timestamp: number
}

class UndoRedoManager {
  private undoStack: UndoAction[] = []
  private redoStack: UndoAction[] = []
  private maxStackSize = 50

  addAction(action: Omit<UndoAction, 'id' | 'timestamp'>) {
    const fullAction: UndoAction = {
      ...action,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    }

    this.undoStack.push(fullAction)
    this.redoStack = [] // Clear redo stack when new action is added

    // Limit stack size
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift()
    }

    return fullAction
  }

  undo(): UndoAction | null {
    if (this.undoStack.length === 0) return null

    const action = this.undoStack.pop()!
    action.undo()
    this.redoStack.push(action)

    return action
  }

  redo(): UndoAction | null {
    if (this.redoStack.length === 0) return null

    const action = this.redoStack.pop()!
    action.redo()
    this.undoStack.push(action)

    return action
  }

  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  clear() {
    this.undoStack = []
    this.redoStack = []
  }

  getHistory(): UndoAction[] {
    return [...this.undoStack].reverse()
  }
}

// Singleton instance
export const undoRedoManager = new UndoRedoManager()
