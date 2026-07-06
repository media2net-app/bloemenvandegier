/**
 * Genereert data/migration-snapshot.json voor het migratie-dashboard op Vercel.
 * Bevat alleen taakstatussen, tellingen en go-live checks — geen secrets of ruwe exportdata.
 *
 * Draai na audits/imports: npm run migration:snapshot
 */
import { readGoliveAudit } from '../lib/migration/golive-audit'
import {
  buildMigrationSnapshot,
  writeMigrationSnapshot,
} from '../lib/migration/snapshot'
import { getMigrationStatus } from '../lib/migration/status'

function main() {
  const status = getMigrationStatus()
  const snapshot = buildMigrationSnapshot({
    tasks: status.tasks,
    stats: status.stats,
    goliveAudit: readGoliveAudit(),
  })

  const written = writeMigrationSnapshot(snapshot)
  const done = status.tasks.filter((t) => t.status === 'done').length

  console.log(`Snapshot geschreven: ${written}`)
  console.log(`  Taken afgerond: ${done}/${status.tasks.length} (${status.overallProgress}%)`)
  console.log(`  Redirects: ${snapshot.stats.redirectCount}`)
  console.log(`  WC producten: ${snapshot.stats.wcProducts}`)
  console.log(`  Shopify gepubliceerd: ${snapshot.stats.shopifyPublished}`)
}

main()
