'use client'

import { useMemo } from 'react'
import { useMigrationStatusContext } from '@/components/migratie/MigrationStatusContext'
import Card from '@/components/ui/Card'

export default function MigratieFasesContent() {
  const { status } = useMigrationStatusContext()

  const phaseProgress = useMemo(() => {
    if (!status) return []
    return status.phases.map((phase) => {
      const phaseTasks = status.tasks.filter((task) => task.phase === phase.id)
      const done = phaseTasks.filter((task) => task.status === 'done').length
      const total = phaseTasks.length
      return {
        ...phase,
        done,
        total,
        percent: total ? Math.round((done / total) * 100) : 0,
      }
    })
  }, [status])

  if (!status) return null

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {phaseProgress.map((phase) => (
        <Card key={phase.id} className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Fase {phase.order}
              </p>
              <h3 className="font-semibold text-gray-900">{phase.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{phase.description}</p>
            </div>
            <span className="text-lg font-bold text-primary-600">{phase.percent}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary-500"
              style={{ width: `${phase.percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {phase.done}/{phase.total} taken afgerond
          </p>
        </Card>
      ))}
    </div>
  )
}
