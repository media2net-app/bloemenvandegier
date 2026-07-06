'use client'

import Link from 'next/link'
import {
  User,
  Globe,
  CheckCircle2,
  Clock,
  Puzzle,
  Wrench,
  ExternalLink,
  ArrowRight,
  XCircle,
  LayoutDashboard,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import {
  ARCHITECTURE_POINTS,
  APP_PRICING_DISCLAIMER,
  DAILY_WORKFLOW,
  NOT_FOR_SAM,
  SAM_WISHES,
  SHOPIFY_ADMIN_URL,
  SHOPIFY_STOREFRONT_URL,
  WISH_STATUS_COLORS,
  WISH_STATUS_LABELS,
  type SamWish,
  type ShopifyAppRecommendation,
  type WishStatus,
} from '@/lib/migration/sam-onboarding'

function WishStatusIcon({ status }: { status: WishStatus }) {
  switch (status) {
    case 'done':
    case 'ready':
      return <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
    case 'partial':
      return <Clock className="h-4 w-4 shrink-0 text-amber-600" />
    case 'app':
      return <Puzzle className="h-4 w-4 shrink-0 text-blue-600" />
    case 'custom':
      return <Wrench className="h-4 w-4 shrink-0 text-purple-600" />
  }
}

function WishAppOptions({ apps }: { apps: ShopifyAppRecommendation[] }) {
  return (
    <div className="mt-3 space-y-2 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">
        Aanbevolen Shopify-apps
      </p>
      <ul className="space-y-2">
        {apps.map((app) => (
          <li
            key={app.name}
            className="rounded-md border border-blue-100 bg-white px-3 py-2.5 text-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary-700 hover:underline"
              >
                {app.name}
              </a>
              {app.recommended && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 ring-1 ring-green-200">
                  Aanbevolen
                </span>
              )}
              <span className="ml-auto shrink-0 font-semibold text-gray-900">{app.pricing}</span>
            </div>
            {app.pricingNote && (
              <p className="mt-1 text-xs leading-relaxed text-gray-600">{app.pricingNote}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function WishRow({ wish }: { wish: SamWish }) {
  return (
    <div className="flex gap-4 p-5">
      <WishStatusIcon status={wish.status} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-gray-900">{wish.text}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${WISH_STATUS_COLORS[wish.status]}`}
          >
            {WISH_STATUS_LABELS[wish.status]}
          </span>
          {wish.owner === 'sam' && (
            <span className="rounded-full bg-secondary-50 px-2 py-0.5 text-xs font-medium text-secondary-700 ring-1 ring-secondary-200">
              Jij kunt dit nu instellen
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600">{wish.how}</p>
        {wish.status === 'app' && wish.apps && wish.apps.length > 0 && (
          <WishAppOptions apps={wish.apps} />
        )}
      </div>
    </div>
  )
}

function statusSummary() {
  const counts = { ready: 0, partial: 0, app: 0, custom: 0, done: 0 }
  for (const wish of SAM_WISHES) counts[wish.status]++
  return counts
}

export default function SamOnboardingSection() {
  const counts = statusSummary()

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-secondary-600 to-secondary-500 p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-secondary-100">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">Gids voor Sam</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold">Werken in Shopify Admin</h2>
              <p className="mt-2 max-w-2xl text-sm text-secondary-100">
                De webshop draait op Shopify. Jouw dagelijkse werkplek is{' '}
                <strong className="text-white">Shopify Admin</strong> — niet het oude dashboard en
                niet localhost. Hieronder staat wat je nu al kunt, en welke wensen nog in
                ontwikkeling zijn.
              </p>
            </div>
            <a
              href={SHOPIFY_ADMIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-secondary-700 shadow-sm transition hover:bg-secondary-50"
            >
              <Globe className="h-4 w-4" />
              Open Shopify Admin
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
            <Link
              href="/migratie/golive"
              className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/25"
            >
              Blok B — Livegang
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Card>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Hoe het systeem is ingericht</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {ARCHITECTURE_POINTS.map((point) => (
            <Card key={point.role} className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {point.role}
              </p>
              <p className="mt-1 font-semibold text-gray-900">{point.system}</p>
              <p className="mt-2 text-sm text-gray-600">{point.note}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Dagelijks in Shopify Admin</h3>
        <div className="space-y-3">
          {DAILY_WORKFLOW.map((step, index) => (
            <Card key={step.title} className="p-5">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{step.title}</h4>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {step.path}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Jouw wensenlijst — status</h3>
            <p className="text-sm text-gray-500">
              Overzicht van alle punten uit de afspraken. Zie ook{' '}
              <Link href="/migratie/afspraken" className="text-primary-600 hover:underline">
                Afspraken
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className={`rounded-full px-2.5 py-1 font-medium ring-1 ${WISH_STATUS_COLORS.done}`}>
              {counts.done} afgerond
            </span>
            <span className={`rounded-full px-2.5 py-1 font-medium ring-1 ${WISH_STATUS_COLORS.ready}`}>
              {counts.ready} klaar
            </span>
            <span className={`rounded-full px-2.5 py-1 font-medium ring-1 ${WISH_STATUS_COLORS.partial}`}>
              {counts.partial} deels
            </span>
            <span className={`rounded-full px-2.5 py-1 font-medium ring-1 ${WISH_STATUS_COLORS.app}`}>
              {counts.app} app
            </span>
            <span className={`rounded-full px-2.5 py-1 font-medium ring-1 ${WISH_STATUS_COLORS.custom}`}>
              {counts.custom} maatwerk
            </span>
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-gray-100">
            {SAM_WISHES.map((wish) => (
              <WishRow key={wish.id} wish={wish} />
            ))}
          </div>
          <p className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
            {APP_PRICING_DISCLAIMER}
          </p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-red-100 bg-red-50/50 p-5">
          <div className="flex items-center gap-2 text-red-800">
            <XCircle className="h-5 w-5" />
            <h3 className="font-semibold">Niet gebruiken voor dagelijks werk</h3>
          </div>
          <ul className="mt-3 space-y-2">
            {NOT_FOR_SAM.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-red-900/80">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-gray-900">
            <LayoutDashboard className="h-5 w-5 text-primary-600" />
            <h3 className="font-semibold">Handige links</h3>
          </div>
          <ul className="mt-4 space-y-3">
            <li>
              <a
                href={SHOPIFY_ADMIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
              >
                Shopify Admin
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </li>
            <li>
              <a
                href={`${SHOPIFY_ADMIN_URL}/orders`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
              >
                Bestellingen
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </li>
            <li>
              <a
                href={`${SHOPIFY_ADMIN_URL}/products`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
              >
                Producten
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </li>
            <li>
              <a
                href={`${SHOPIFY_ADMIN_URL}/collections`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
              >
                Collecties (categorieën)
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </li>
            <li>
              <a
                href={SHOPIFY_STOREFRONT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
              >
                Webshop bekijken
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </li>
            <li>
              <Link
                href="/migratie/afspraken"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
              >
                Alle afspraken &amp; scope
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
