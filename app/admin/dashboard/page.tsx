"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowUpRight,
  Database,
  FilePenLine,
  FileText,
  Globe2,
  Layers,
} from "lucide-react"

import { AdminListRow } from "@/components/admin/admin-list-row"
import { AdminQueuePanel } from "@/components/admin/admin-queue-panel"
import { AdminSectionHeader } from "@/components/admin/admin-section-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminStatTile } from "@/components/admin/admin-stat-tile"
import { AdminStatusBadge } from "@/components/admin/admin-status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAdminDashboardSummary } from "@/lib/api/admin-dashboard"
import type { AdminDashboardSummary } from "@/types/landing-content"

export default function AdminDashboardPage() {
  const [summary, setSummary] = React.useState<AdminDashboardSummary | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true

    getAdminDashboardSummary()
      .then((data) => {
        if (active) {
          setSummary(data)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard")
        }
      })

    return () => {
      active = false
    }
  }, [])

  if (error) {
    return (
      <AdminShell>
        <section className="border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-[var(--shadow-sm)]">
          <div className="text-lg font-semibold text-red-800">Dashboard failed to load</div>
          <p className="mt-2">{error}</p>
          <Button className="mt-4 rounded-none" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </section>
      </AdminShell>
    )
  }

  if (!summary) {
    return (
      <AdminShell>
        <section className="border border-[var(--brand-shell-strong)] bg-white p-5 text-sm text-slate-600 shadow-[var(--shadow-sm)]">
          Loading dashboard...
        </section>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <section className="border border-[var(--brand-shell-strong)] bg-[linear-gradient(135deg,#ffffff_0%,#f5f9ff_60%,#eef6ff_100%)] p-4 shadow-[var(--shadow-md)] md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <AdminSectionHeader
            eyebrow="Admin workspace"
            title="Keep jobs and landing content moving."
            description="Review raw jobs, publish ready listings, and update the public landing page from one squared workspace."
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 sm:min-w-[260px]">
              <Input
                readOnly
                value="Search UI placeholder"
                className="h-11 rounded-none border border-border bg-background text-muted-foreground"
              />
            </div>
            <Button asChild className="h-11 rounded-none">
              <Link href="/admin/raw-data">Review jobs</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-none">
              <Link href="/admin/content">Edit landing CMS</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-none">
              <Link href="/admin/scrape-runs">Scraper runs</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-[var(--brand-shell-strong)] bg-white p-5 shadow-[var(--shadow-sm)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 border border-sky-100 bg-sky-50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700">
                <FilePenLine className="size-3.5" />
                Landing CMS
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-ink)]">
                  Landing page content is controlled from the dashboard.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                  Edit hero copy, featured job rules, benefits, trusted companies, and CTA blocks with the same squared visual language as the public landing page.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="h-11 rounded-none">
                <Link href="/admin/content">Open CMS editor</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-none">
                <Link href="/">Preview landing page</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="grid gap-3 border border-[var(--brand-shell-strong)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[var(--shadow-sm)]">
          <div className="border-b border-[var(--brand-shell-strong)] pb-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Content status
            </div>
            <div className="mt-2 text-lg font-semibold text-[var(--brand-ink)]">
              {summary.content.hasDraft ? "Draft changes are ready" : "Published content is in sync"}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border border-[var(--brand-shell-strong)] bg-white p-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Status</div>
              <div className="mt-3 flex items-center gap-2">
                <AdminStatusBadge status={summary.content.status} />
              </div>
            </div>
            <div className="border border-[var(--brand-shell-strong)] bg-white p-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Last update</div>
              <div className="mt-2 text-sm font-medium text-[var(--brand-ink)]">
                {summary.content.updatedAt ? new Date(summary.content.updatedAt).toLocaleString("id-ID") : "No update yet"}
              </div>
            </div>
            <div className="border border-[var(--brand-shell-strong)] bg-white p-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Last publish</div>
              <div className="mt-2 text-sm font-medium text-[var(--brand-ink)]">
                {summary.content.publishedAt ? new Date(summary.content.publishedAt).toLocaleString("id-ID") : "Not published"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatTile
          label="Needs review"
          value={summary.statusCounts.raw}
          hint="Raw jobs waiting for cleanup and approval."
          icon={Database}
          status="raw"
        />
        <AdminStatTile
          label="Ready to publish"
          value={summary.statusCounts.draft}
          hint="Drafted jobs that need a final publishing pass."
          icon={FileText}
          status="draft"
        />
        <AdminStatTile
          label="Published jobs"
          value={summary.statusCounts.published}
          hint={`${summary.catalog.totalCategories} categories across ${summary.catalog.totalSources} sources.`}
          icon={Globe2}
          status="published"
        />
        <AdminStatTile
          label="Needs attention"
          value={summary.statusCounts.attention}
          hint="Rejected or duplicate jobs that still need operator attention."
          icon={AlertTriangle}
          status="attention"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <AdminQueuePanel
          title="Needs review"
          description="Fresh raw jobs that should be cleaned up first."
          action={
            <Button asChild variant="outline" className="rounded-none">
              <Link href="/admin/raw-data">Open review queue</Link>
            </Button>
          }
        >
          {summary.priorityQueues.needsReview.length > 0 ? (
            summary.priorityQueues.needsReview.map((item) => (
              <AdminListRow
                key={item.id}
                title={item.title}
                description={item.companyName}
                href={item.href}
                status={item.status}
                meta={item.updatedAt ? new Date(item.updatedAt).toLocaleString("id-ID") : null}
              />
            ))
          ) : (
            <div className="border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
              No raw jobs are waiting right now.
            </div>
          )}
        </AdminQueuePanel>

        <AdminQueuePanel
          title="Ready to publish"
          description="Drafted jobs that look close to ready."
          action={
            <Button asChild variant="outline" className="rounded-none">
              <Link href="/admin/jobs">Open job drafts</Link>
            </Button>
          }
        >
          {summary.priorityQueues.readyToPublish.length > 0 ? (
            summary.priorityQueues.readyToPublish.map((item) => (
              <AdminListRow
                key={item.id}
                title={item.title}
                description={item.companyName}
                href={item.href}
                status={item.status}
                meta={item.updatedAt ? new Date(item.updatedAt).toLocaleString("id-ID") : null}
              />
            ))
          ) : (
            <div className="border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
              No draft jobs are ready to publish yet.
            </div>
          )}
        </AdminQueuePanel>

        <AdminQueuePanel
          title="Landing content"
          description="CMS status for the public landing page."
          action={
            <Button asChild variant="outline" className="rounded-none">
              <Link href="/admin/content">Open content editor</Link>
            </Button>
          }
        >
          {summary.priorityQueues.landingContentDrafts.length > 0 ? (
            summary.priorityQueues.landingContentDrafts.map((item) => (
              <AdminListRow
                key={item.id}
                title={item.title}
                description="Draft changes are waiting to be published."
                href={item.href}
                status={item.status}
                meta={item.updatedAt ? new Date(item.updatedAt).toLocaleString("id-ID") : null}
              />
            ))
          ) : (
            <AdminListRow
              title="Landing page content"
              description="Published content is currently in sync."
              href="/admin/content"
              status={summary.content.status}
              meta={
                summary.content.publishedAt
                  ? `Published ${new Date(summary.content.publishedAt).toLocaleString("id-ID")}`
                  : "No published content yet"
              }
            />
          )}
        </AdminQueuePanel>
      </section>

      <AdminQueuePanel
        title="Recent activity"
        description="Latest job and content changes across the workspace."
        action={
          <Link
            href="/admin/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            View all
            <ArrowUpRight className="size-4" />
          </Link>
        }
      >
        <div className="grid gap-3 lg:grid-cols-2">
          {summary.recentActivity.map((item) => (
            <AdminListRow
              key={`${item.kind}-${item.id}`}
              title={item.title}
              description={item.description}
              href={item.href}
              status={item.status}
              meta={item.updatedAt ? new Date(item.updatedAt).toLocaleString("id-ID") : null}
            />
          ))}
        </div>
      </AdminQueuePanel>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="border border-[var(--brand-shell-strong)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Catalog coverage
              </div>
              <div className="mt-2 text-lg font-semibold text-[var(--brand-ink)]">
                {summary.catalog.totalCategories} categories
              </div>
            </div>
            <div className="grid size-11 place-items-center border border-[var(--brand-shell-strong)] bg-sky-50 text-[var(--brand-blue)]">
              <Layers className="size-4" />
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Sources currently tracked: {summary.catalog.totalSources}. Use this count to keep the public taxonomy and landing page messaging aligned.
          </p>
        </div>
        <div className="border border-[var(--brand-shell-strong)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[var(--shadow-sm)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Content + jobs ops
          </div>
          <div className="mt-2 text-lg font-semibold text-[var(--brand-ink)]">
            One workspace for review, publish, and homepage control
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            The dashboard now stays focused on the next operational action instead of full reporting. Use the queues above to decide what moves first.
          </p>
        </div>
      </section>
    </AdminShell>
  )
}
