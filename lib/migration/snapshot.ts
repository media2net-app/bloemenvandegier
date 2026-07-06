import fs from 'fs'
import path from 'path'
import type { GoliveAuditReport } from './golive-audit'
import type { MigrationStats, MigrationTask, MigrationTaskStatus } from './status'

const SNAPSHOT_PATH = 'data/migration-snapshot.json'

export interface MigrationSnapshotTask {
  id: string
  status: MigrationTaskStatus
  completedAt?: string
}

/** Alleen voortgang en tellingen — geen API-keys, productlijsten of redirect-URL's. */
export interface MigrationSnapshot {
  version: 1
  generatedAt: string
  tasks: MigrationSnapshotTask[]
  stats: MigrationStats
  goliveAudit: GoliveAuditReport | null
}

function snapshotFullPath() {
  return path.join(process.cwd(), SNAPSHOT_PATH)
}

export function readMigrationSnapshot(): MigrationSnapshot | null {
  const fullPath = snapshotFullPath()
  if (!fs.existsSync(fullPath)) return null
  try {
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as MigrationSnapshot
    if (data.version !== 1 || !Array.isArray(data.tasks)) return null
    return data
  } catch {
    return null
  }
}

/** Gebruik snapshot op Vercel / machines zonder lokale data/import auditbestanden. */
export function shouldUseMigrationSnapshot(): boolean {
  const importReport = path.join(process.cwd(), 'data/import/shopify-import-all-report.json')
  return !fs.existsSync(importReport) && readMigrationSnapshot() !== null
}

export function applySnapshotOverlay(
  tasks: MigrationTask[],
  stats: MigrationStats,
  snapshot: MigrationSnapshot
): { tasks: MigrationTask[]; stats: MigrationStats } {
  const statusById = new Map(snapshot.tasks.map((task) => [task.id, task]))

  const mergedTasks = tasks.map((task) => {
    const snap = statusById.get(task.id)
    if (!snap) return task
    return {
      ...task,
      status: snap.status,
      completedAt: snap.completedAt ?? task.completedAt,
    }
  })

  return {
    tasks: mergedTasks,
    stats: { ...stats, ...snapshot.stats },
  }
}

export function buildMigrationSnapshot(input: {
  tasks: MigrationTask[]
  stats: MigrationStats
  goliveAudit: GoliveAuditReport | null
}): MigrationSnapshot {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    tasks: input.tasks.map(({ id, status, completedAt }) => ({
      id,
      status,
      ...(completedAt ? { completedAt } : {}),
    })),
    stats: input.stats,
    goliveAudit: input.goliveAudit,
  }
}

export function writeMigrationSnapshot(snapshot: MigrationSnapshot): string {
  const fullPath = snapshotFullPath()
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf-8')
  return fullPath
}

export const MIGRATION_SNAPSHOT_PATH = SNAPSHOT_PATH
