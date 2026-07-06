'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  CheckCircle2,
  Package,
  Image as ImageIcon,
  Link2,
  Layers,
  AlertTriangle,
  Terminal,
  User,
  ArrowRight,
  Rocket,
} from 'lucide-react'
import { useMigrationStatusContext } from '@/components/migratie/MigrationStatusContext'
import { StatCard } from '@/components/migratie/migratie-ui'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

export default function MigratieOverviewContent() {
  const { status } = useMigrationStatusContext()

  const taskCounts = useMemo(() => {
    if (!status) return { done: 0, all: 0 }
    return {
      all: status.tasks.length,
      done: status.tasks.filter((t) => t.status === 'done').length,
    }
  }, [status])

  if (!status) return null

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-6 text-white">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-primary-100">Totale voortgang</p>
              <p className="text-4xl font-bold">{status.overallProgress}%</p>
              <p className="mt-1 text-sm text-primary-100">
                {taskCounts.done} van {taskCounts.all} taken afgerond
              </p>
            </div>
            <div className="text-right text-sm text-primary-100">
              <p>Laatst bijgewerkt</p>
              <p className="font-medium text-white">
                {new Date(status.updatedAt).toLocaleString('nl-NL')}
              </p>
              {status.stats.lastImportAt && (
                <p className="mt-1">
                  Import: {new Date(status.stats.lastImportAt).toLocaleString('nl-NL')}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-primary-700/50">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${status.overallProgress}%` }}
            />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-secondary-200 p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-secondary-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-secondary-100 p-3">
              <User className="h-6 w-6 text-secondary-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Gids voor Sam</h2>
              <p className="mt-1 max-w-xl text-sm text-gray-600">
                Shopify Admin als dagelijkse werkplek, dagelijkse taken, en status van alle wensen
                uit de afspraken.
              </p>
            </div>
          </div>
          <Link
            href="/migratie/sam"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary-700"
          >
            Open gids
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>

      <Card className="overflow-hidden border-primary-200 p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-primary-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary-100 p-3">
              <Rocket className="h-6 w-6 text-primary-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Blok B — Livegang</h2>
              <p className="mt-1 max-w-xl text-sm text-gray-600">
                Betalingen, cadeaubonnen, testbestelling en domeinwissel. Checklist en agenda voor
                het gesprek met Sam.
              </p>
            </div>
          </div>
          <Link
            href="/migratie/golive"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Open checklist
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Package}
          label="WC producten"
          value={String(status.stats.wcProducts)}
          sub={`${status.stats.wcProductsWithImages} met afbeelding`}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          icon={CheckCircle2}
          label="Shopify gepubliceerd"
          value={String(status.stats.shopifyPublished)}
          sub={
            status.stats.shopifyPublished >= status.stats.wcProducts
              ? 'Alle producten live'
              : `${status.stats.wcProducts - status.stats.shopifyPublished} nog te gaan`
          }
          color="text-green-600 bg-green-50"
        />
        <StatCard
          icon={Link2}
          label="301 redirects"
          value={status.stats.redirectCount.toLocaleString('nl-NL')}
          sub="Geïmporteerd in Shopify"
          color="text-purple-600 bg-purple-50"
        />
        <StatCard
          icon={Layers}
          label="Collecties"
          value={String(status.stats.collectionCount)}
          sub="WC categorieën → Shopify"
          color="text-orange-600 bg-orange-50"
        />
      </div>

      {status.stats.wcProducts > 0 && (
        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Productimport</h2>
            <Badge variant={status.stats.shopifyFailed > 0 ? 'warning' : 'success'}>
              {status.stats.shopifyPublished}/{status.stats.wcProducts} live
            </Badge>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-secondary-500 transition-all"
              style={{
                width: `${Math.min(100, Math.round((status.stats.shopifyPublished / status.stats.wcProducts) * 100))}%`,
              }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" />
              {status.stats.wcProductsWithImages} met afbeelding
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {status.stats.wcProductsWithoutImages} zonder afbeelding in WC
            </span>
            {status.stats.shopifyFailed > 0 && (
              <span className="text-red-600">{status.stats.shopifyFailed} mislukt</span>
            )}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Terminal className="h-5 w-5" />
          Nuttige commando&apos;s
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            { label: 'Volledige import + publish', cmd: 'npm run import:shopify-all' },
            { label: 'Import hervatten', cmd: 'npm run import:shopify-all:resume' },
            { label: 'Alleen publiceren', cmd: 'npm run import:shopify-publish:all' },
            { label: 'API token testen', cmd: 'npm run shopify:token' },
            { label: 'Collecties importeren', cmd: 'npm run import:shopify-collections' },
            { label: 'Redirects importeren', cmd: 'npm run import:shopify-redirects' },
            { label: 'Producten aan collecties', cmd: 'npm run import:shopify-assign-collections' },
            { label: 'Dubbele producten opruimen', cmd: 'npm run import:shopify-cleanup -- --execute' },
            { label: 'WC → Shopify CSV', cmd: 'npm run import:shopify-csv' },
            { label: 'WC data ophalen (REST API)', cmd: 'npm run wc:fetch-all' },
            { label: 'WC connectie testen', cmd: 'npm run wc:fetch-status' },
          ].map((item) => (
            <div
              key={item.cmd}
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <p className="text-sm font-medium text-gray-700">{item.label}</p>
              <code className="mt-1 block text-xs text-primary-700">{item.cmd}</code>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
