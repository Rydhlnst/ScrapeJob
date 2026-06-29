import Link from "next/link"
import {
  AlertTriangle,
  ArrowUpRight,
  Database,
  FileText,
  Globe2,
  Layers,
} from "lucide-react"

import { AdminListRow } from "@/components/admin/admin-list-row"
import { AdminQueuePanel } from "@/components/admin/admin-queue-panel"
import { AdminSectionHeader } from "@/components/admin/admin-section-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminStatTile } from "@/components/admin/admin-stat-tile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAdminDashboardSummary } from "@/lib/api/admin-dashboard"

export default async function AdminDashboardPage() {
  const summary = await getAdminDashboardSummary()

  return (
    <AdminShell>
      <section className="border border-border bg-card p-4 md:p-5">
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
        <div className="border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Catalog coverage
              </div>
              <div className="mt-2 text-lg font-semibold text-foreground">
                {summary.catalog.totalCategories} categories
              </div>
            </div>
            <div className="grid size-11 place-items-center border border-border bg-muted">
              <Layers className="size-4" />
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Sources currently tracked: {summary.catalog.totalSources}. Use this count to keep the public taxonomy and landing page messaging aligned.
          </p>
        </div>
        <div className="border border-border bg-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Content + jobs ops
          </div>
          <div className="mt-2 text-lg font-semibold text-foreground">
            One workspace for review, publish, and homepage control
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            The dashboard now stays focused on the next operational action instead of full reporting. Use the queues above to decide what moves first.
          </p>
        </div>
      </section>
    </AdminShell>
  )
}
