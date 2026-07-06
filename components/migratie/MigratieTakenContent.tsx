'use client'

import { useMemo, useState } from 'react'
import { useMigrationStatusContext } from '@/components/migratie/MigrationStatusContext'
import { TaskCard, statusLabels } from '@/components/migratie/migratie-ui'
import type { MigrationTaskStatus } from '@/lib/migration/status'
import Card from '@/components/ui/Card'

export default function MigratieTakenContent() {
  const { status } = useMigrationStatusContext()
  const [taskFilter, setTaskFilter] = useState<MigrationTaskStatus | 'all'>('all')
  const [phaseFilter, setPhaseFilter] = useState<string>('all')

  const filteredTasks = useMemo(() => {
    if (!status) return []
    return status.tasks.filter((task) => {
      if (taskFilter !== 'all' && task.status !== taskFilter) return false
      if (phaseFilter !== 'all' && task.phase !== phaseFilter) return false
      return true
    })
  }, [status, taskFilter, phaseFilter])

  const taskCounts = useMemo(() => {
    if (!status) return { todo: 0, in_progress: 0, done: 0, blocked: 0, all: 0, open: 0 }
    return {
      all: status.tasks.length,
      todo: status.tasks.filter((t) => t.status === 'todo').length,
      in_progress: status.tasks.filter((t) => t.status === 'in_progress').length,
      done: status.tasks.filter((t) => t.status === 'done').length,
      blocked: status.tasks.filter((t) => t.status === 'blocked').length,
      open: status.tasks.filter((t) => t.status !== 'done').length,
    }
  }, [status])

  const groupedTasks = useMemo(() => {
    if (!status) return []
    return status.phases
      .map((phase) => ({
        phase,
        tasks: filteredTasks.filter((task) => task.phase === phase.id),
      }))
      .filter((group) => group.tasks.length > 0)
  }, [status, filteredTasks])

  const phaseStats = useMemo(() => {
    if (!status) return []
    return status.phases.map((phase) => {
      const phaseTasks = status.tasks.filter((t) => t.phase === phase.id)
      const open = phaseTasks.filter((t) => t.status !== 'done').length
      return { ...phase, total: phaseTasks.length, open, done: phaseTasks.length - open }
    })
  }, [status])

  if (!status) return null

  return (
    <>
      <Card className="mb-6 border-amber-200 bg-amber-50/60 p-5">
        <p className="text-sm text-gray-800">
          <strong>{taskCounts.open} openstaande taken</strong> van {taskCounts.all} totaal — inclusief
          migratie, SEO, thema, alle 19 wensen van Sam en livegang.
        </p>
        <p className="mt-1 text-xs text-gray-600">
          Taken met een afspraak-badge komen rechtstreeks uit de afspraken/wensenlijst.
        </p>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'todo', 'in_progress', 'done', 'blocked'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setTaskFilter(filter)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              taskFilter === filter
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {filter === 'all' ? 'Alles' : statusLabels[filter]} ({taskCounts[filter]})
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setPhaseFilter('all')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            phaseFilter === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
          }`}
        >
          Alle fases
        </button>
        {phaseStats.map((phase) => (
          <button
            key={phase.id}
            onClick={() => setPhaseFilter(phase.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              phaseFilter === phase.id
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {phase.title} ({phase.open} open)
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {groupedTasks.map(({ phase, tasks }) => {
          const openInPhase = tasks.filter((t) => t.status !== 'done').length
          return (
            <section key={phase.id}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{phase.title}</h2>
                  <p className="text-sm text-gray-500">{phase.description}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {openInPhase} open · {tasks.length} in filter
                </span>
              </div>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} phaseTitle={phase.title} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="p-8 text-center text-sm text-gray-500">
          Geen taken voor dit filter.
        </Card>
      )}
    </>
  )
}
