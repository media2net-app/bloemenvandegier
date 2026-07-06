'use client'

import { useEffect, useState, type ComponentType } from 'react'
import Link from 'next/link'
import {
  Rocket,
  CreditCard,
  Gift,
  Truck,
  Globe,
  ClipboardCheck,
  ExternalLink,
  PlayCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  User,
  Printer,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import {
  BLOCK_B_INTRO,
  DEMO_URLS,
  CARD_PRINT_SETUP,
  DOMAIN_SWITCH,
  GIFT_CARD_SETUP,
  OWNER_LABELS,
  PAYMENT_SETUP,
  POST_GOLIVE,
  SAM_CALL_AGENDA,
  SHIPPING_SETUP,
  TEST_ORDER_CHECKLIST,
  type GoliveStep,
} from '@/lib/migration/block-b-golive'
import type { GoliveAuditReport } from '@/lib/migration/golive-audit'
import { SHOPIFY_ADMIN_URL } from '@/lib/migration/sam-onboarding'

function StepList({ steps, audit }: { steps: GoliveStep[]; audit: GoliveAuditReport | null }) {
  return (
    <ul className="divide-y divide-gray-100">
      {steps.map((step) => {
        const auditCheck = audit?.checks?.find((c) => c.id === step.id)
        return (
          <li key={step.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <div className="mt-0.5 shrink-0">
              {auditCheck ? (
                auditCheck.passed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-amber-500" />
                )
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-gray-900">{step.title}</p>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                  {OWNER_LABELS[step.owner]}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{step.description}</p>
              {step.doneWhen && (
                <p className="mt-1 text-xs text-gray-500">Klaar als: {step.doneWhen}</p>
              )}
              {auditCheck && !auditCheck.passed && (
                <p className="mt-1 text-xs font-medium text-amber-700">{auditCheck.detail}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {step.adminUrl && (
                  <a
                    href={step.adminUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100"
                  >
                    Admin <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {step.storefrontUrl && (
                  <a
                    href={step.storefrontUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-secondary-50 px-2.5 py-1 text-xs font-medium text-secondary-700 hover:bg-secondary-100"
                  >
                    Storefront <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <Icon className="h-5 w-5 text-primary-600" />
        {title}
      </h2>
      {children}
    </Card>
  )
}

export default function BlockBSection() {
  const [audit, setAudit] = useState<GoliveAuditReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/migratie/golive-audit')
      .then((res) => res.json())
      .then((data) => setAudit(data.audit ?? null))
      .catch(() => setAudit(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Rocket className="h-7 w-7 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Blok B — Livegang met Sam</h1>
        </div>
        <p className="max-w-3xl text-gray-600">{BLOCK_B_INTRO}</p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-secondary-600 to-secondary-500 p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-secondary-100">Go-live status</p>
              {loading ? (
                <p className="text-2xl font-bold">Laden…</p>
              ) : audit ? (
                <>
                  <p className="text-3xl font-bold">
                    {audit.passed}/{audit.total} checks
                  </p>
                  <p className="mt-1 text-sm text-secondary-100">
                    Laatste audit: {new Date(audit.generatedAt).toLocaleString('nl-NL')}
                  </p>
                </>
              ) : (
                <p className="text-lg font-medium">Nog geen audit — draai npm run audit:golive</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={SHOPIFY_ADMIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
              >
                Shopify Admin <ExternalLink className="h-4 w-4" />
              </a>
              <Link
                href="/migratie/sam"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
              >
                <User className="h-4 w-4" />
                Sam-gids
              </Link>
            </div>
          </div>
          {audit && (
            <div className="mt-4 flex flex-wrap gap-2">
              {audit.checks.map((check) => (
                <span
                  key={check.id}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    check.passed ? 'bg-green-500/25 text-green-100' : 'bg-white/20 text-white'
                  }`}
                >
                  {check.passed ? '✓' : '○'} {check.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      <SectionCard icon={PlayCircle} title="Agenda gesprek vandaag (~80 min)">
        <ol className="space-y-3">
          {SAM_CALL_AGENDA.map((item, i) => (
            <li key={item.topic} className="flex gap-3 text-sm">
              <span className="shrink-0 font-mono text-xs text-gray-400">{String(i + 1).padStart(2, '0')}</span>
              <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-700">{item.time}</span>
              <span className="text-gray-900">{item.topic}</span>
              <span className="ml-auto shrink-0 text-gray-500">
                {item.who === 'both' ? 'Sam + Chiel' : item.who === 'sam' ? 'Sam' : 'Chiel'}
              </span>
            </li>
          ))}
        </ol>
      </SectionCard>

      <SectionCard icon={ExternalLink} title="Demo-URLs">
        <ul className="grid gap-2 sm:grid-cols-2">
          {DEMO_URLS.map((demo) => (
            <li key={demo.url}>
              <a
                href={demo.url}
                target={demo.url.startsWith('http') ? '_blank' : undefined}
                rel={demo.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="block rounded-lg border border-gray-200 px-4 py-3 hover:border-primary-300 hover:bg-primary-50/50"
              >
                <p className="font-medium text-primary-700">{demo.label}</p>
                {demo.note && <p className="mt-0.5 text-xs text-gray-500">{demo.note}</p>}
              </a>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard icon={CreditCard} title="1. Betalingen">
        <StepList steps={PAYMENT_SETUP} audit={audit} />
      </SectionCard>

      <SectionCard icon={Gift} title="2. Cadeaubonnen">
        <StepList steps={GIFT_CARD_SETUP} audit={audit} />
      </SectionCard>

      <SectionCard icon={Truck} title="3. Verzending & pakbon">
        <StepList steps={SHIPPING_SETUP} audit={audit} />
      </SectionCard>

      <SectionCard icon={Printer} title="3b. Kaartje printen">
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          De oude <strong>Order Printer</strong>-app van Shopify is niet meer beschikbaar. Gebruik de
          ingebouwde pakbon (aanbevolen) of <strong>Order Printer Pro</strong> (gratis app).
        </p>
        <p className="mb-4 text-sm text-gray-600">
          Templates in project:{' '}
          <code className="rounded bg-gray-100 px-1 text-xs">order-printer-pro-kaartje-template.liquid</code>
          {' '}(liggend A6, 3:2 — zoals WC)
        </p>
        <StepList steps={CARD_PRINT_SETUP} audit={audit} />
      </SectionCard>

      <SectionCard icon={ClipboardCheck} title="4. Testbestelling">
        <StepList steps={TEST_ORDER_CHECKLIST} audit={audit} />
      </SectionCard>

      <SectionCard icon={Globe} title="5. Domeinwissel (na groene checks)">
        <p className="mb-4 text-sm text-amber-800 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
          Doe de domeinwissel pas als betalingen, gift cards en testbestelling allemaal groen zijn.
          Redirects (1.944) staan al klaar in Shopify.
        </p>
        <StepList steps={DOMAIN_SWITCH} audit={audit} />
      </SectionCard>

      <SectionCard icon={RefreshCw} title="6. Na livegang">
        <StepList steps={POST_GOLIVE} audit={audit} />
      </SectionCard>

      <Card className="border-dashed border-gray-300 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          <strong>Audit verversen:</strong>{' '}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">npm run audit:golive</code>
          {' '}— controleert Shopify Payments, gift cards, NL-verzending en domein via API.
        </p>
      </Card>
    </div>
  )
}
