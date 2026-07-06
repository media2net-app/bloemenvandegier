'use client'

import Card from '@/components/ui/Card'
import {
  MIGRATION_AGREEMENTS,
  SCOPE_LABELS,
  SCOPE_COLORS,
  AUTHOR_LABELS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  type AgreementItem,
} from '@/lib/migration/agreements'
import type { MigrationStatus } from '@/lib/migration/status'
import { useMigrationStatusContext } from '@/components/migratie/MigrationStatusContext'
import { ScrollText, Mail } from 'lucide-react'

function resolveItemStatus(
  item: AgreementItem,
  migrationStatus: MigrationStatus | null
): AgreementItem['taskStatus'] | undefined {
  if (item.taskId && migrationStatus) {
    const task = migrationStatus.tasks.find((t) => t.id === item.taskId)
    if (task) {
      if (task.status === 'blocked') return 'in_progress'
      if (task.status === 'done' || task.status === 'in_progress' || task.status === 'todo') {
        return task.status
      }
    }
  }
  return item.taskStatus
}

function TaskStatusBadge({ status }: { status: AgreementItem['taskStatus'] }) {
  if (!status) return null
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${TASK_STATUS_COLORS[status]}`}
    >
      {TASK_STATUS_LABELS[status]}
    </span>
  )
}

function ScopeBadge({ scope }: { scope: AgreementItem['scope'] }) {
  if (!scope) return null
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${SCOPE_COLORS[scope]}`}
    >
      {SCOPE_LABELS[scope]}
    </span>
  )
}

function authorColor(author: keyof typeof AUTHOR_LABELS) {
  switch (author) {
    case 'chiel':
      return 'bg-primary-100 text-primary-800'
    case 'sam':
      return 'bg-secondary-100 text-secondary-800'
    case 'roald':
      return 'bg-purple-100 text-purple-800'
  }
}

export default function AfsprakenSection() {
  const { status } = useMigrationStatusContext()

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-primary-100 p-2">
          <ScrollText className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Afspraken</h2>
          <p className="text-sm text-gray-500">
            Onderlinge afspraken Chiel &amp; Sam per mail — scope en verwachtingen
          </p>
        </div>
      </div>

      <Card className="mb-6 border-primary-200 bg-primary-50/50 p-5">
        <div className="flex gap-3">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
          <div className="text-sm text-gray-700">
            <p>
              <strong>Kernafspraak:</strong> WooCommerce 1:1 naar Shopify. Extra wensen (lint,
              order-picker dashboard, koeriers, etc.) alleen als ze binnen de afgesproken scope
              passen — nieuwe punten eerst per mail afstemmen.
            </p>
            <p className="mt-2 text-gray-600">
              Development stopt na oplevering. Chiel blijft beschikbaar voor vragen, geen
              uitvoerend werk daarna.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {MIGRATION_AGREEMENTS.map((section) => (
          <Card key={section.id} className="overflow-hidden p-0">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-gray-900">{section.title}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${authorColor(section.author)}`}
                >
                  {AUTHOR_LABELS[section.author]}
                </span>
              </div>
              {section.intro && (
                <p className="mt-2 text-sm text-gray-600">{section.intro}</p>
              )}
            </div>

            <ol className="divide-y divide-gray-100">
              {section.items.map((item, index) => (
                <li key={item.id} className="flex gap-4 px-6 py-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm text-gray-800">{item.text}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <TaskStatusBadge status={resolveItemStatus(item, status)} />
                        <ScopeBadge scope={item.scope} />
                      </div>
                    </div>
                    {item.note && (
                      <p className="mt-2 text-xs text-gray-500 italic">{item.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
        {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => (
          <span
            key={key}
            className={`rounded-full px-2 py-0.5 font-medium ring-1 ${TASK_STATUS_COLORS[key as keyof typeof TASK_STATUS_COLORS]}`}
          >
            {label}
          </span>
        ))}
        {Object.entries(SCOPE_LABELS).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className={`rounded-full px-2 py-0.5 font-medium ring-1 ${SCOPE_COLORS[key as keyof typeof SCOPE_COLORS]}`}
            >
              {label}
            </span>
          </span>
        ))}
      </div>
    </section>
  )
}
