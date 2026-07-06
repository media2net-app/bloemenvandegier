'use client'

import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  ExternalLink,
  User,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { MigrationTask, MigrationTaskStatus } from '@/lib/migration/status'

export const statusLabels: Record<MigrationTaskStatus, string> = {
  todo: 'Te doen',
  in_progress: 'Bezig',
  done: 'Afgerond',
  blocked: 'Geblokkeerd',
}

export const statusBadgeVariant = (status: MigrationTaskStatus) => {
  switch (status) {
    case 'done':
      return 'success' as const
    case 'in_progress':
      return 'warning' as const
    case 'blocked':
      return 'error' as const
    default:
      return 'default' as const
  }
}

export const priorityColors: Record<MigrationTask['priority'], string> = {
  low: 'bg-blue-50 text-blue-700',
  medium: 'bg-yellow-50 text-yellow-700',
  high: 'bg-orange-50 text-orange-700',
  critical: 'bg-red-50 text-red-700',
}

export const assigneeLabels = {
  chiel: 'Chiel',
  sam: 'Sam',
  roald: 'Roald',
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub: string
  color: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{sub}</p>
        </div>
      </div>
    </Card>
  )
}

export function TaskCard({ task, phaseTitle }: { task: MigrationTask; phaseTitle: string }) {
  const StatusIcon =
    task.status === 'done'
      ? CheckCircle2
      : task.status === 'in_progress'
        ? Clock
        : task.status === 'blocked'
          ? AlertTriangle
          : Circle

  const iconColor =
    task.status === 'done'
      ? 'text-green-500'
      : task.status === 'in_progress'
        ? 'text-amber-500'
        : task.status === 'blocked'
          ? 'text-red-500'
          : 'text-gray-300'

  return (
    <Card className="p-5 transition-shadow hover:shadow-md">
      <div className="flex gap-4">
        <StatusIcon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900">{task.title}</h3>
            <Badge variant={statusBadgeVariant(task.status)}>{statusLabels[task.status]}</Badge>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{task.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="rounded bg-gray-100 px-2 py-1">{phaseTitle}</span>
            {task.agreementId && (
              <span className="rounded bg-amber-50 px-2 py-1 font-medium text-amber-800 ring-1 ring-amber-200">
                Afspraak {task.agreementId}
              </span>
            )}
            {task.assignee && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {assigneeLabels[task.assignee]}
              </span>
            )}
            {task.completedAt && (
              <span>Afgerond: {new Date(task.completedAt).toLocaleDateString('nl-NL')}</span>
            )}
          </div>
          {(task.command || task.link) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {task.command && (
                <code className="rounded bg-gray-100 px-2 py-1 text-xs text-primary-700">
                  {task.command}
                </code>
              )}
              {task.link && task.link.startsWith('http') && (
                <a
                  href={task.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
                >
                  Open link <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
