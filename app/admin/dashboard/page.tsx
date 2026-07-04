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

import { useAdminLanguage } from "@/components/admin/admin-language"
import { AdminListRow } from "@/components/admin/admin-list-row"
import { AdminQueuePanel } from "@/components/admin/admin-queue-panel"
import { AdminSectionHeader } from "@/components/admin/admin-section-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminStatTile } from "@/components/admin/admin-stat-tile"
import { AdminStatusBadge } from "@/components/admin/admin-status-badge"
import { Button } from "@/components/ui/button"
import { getAdminDashboardSummary } from "@/lib/api/admin-dashboard"
import type { AdminDashboardSummary } from "@/types/landing-content"

const copy = {
  en: {
    failedTitle: "Dashboard failed to load",
    reload: "Reload",
    loading: "Loading dashboard...",
    eyebrow: "Admin workspace",
    heroTitle: "Keep jobs and landing content moving.",
    heroDescription: "Review raw jobs, publish ready listings, and update the public landing page from one squared workspace.",
    reviewJobs: "Review jobs",
    editCms: "Edit landing CMS",
    scraperRuns: "Scraper runs",
    landingCms: "Landing CMS",
    landingTitle: "Landing page content is controlled from the dashboard.",
    landingDescription: "Edit hero copy, featured job rules, benefits, trusted companies, and CTA blocks with the same squared visual language as the public landing page.",
    openCms: "Open CMS editor",
    previewLanding: "Preview landing page",
    contentStatus: "Content status",
    draftReady: "Draft changes are ready",
    publishedSync: "Published content is in sync",
    status: "Status",
    lastUpdate: "Last update",
    noUpdate: "No update yet",
    lastPublish: "Last publish",
    notPublished: "Not published",
    needsReview: "Needs review",
    needsReviewHint: "Raw jobs waiting for cleanup and approval.",
    readyToPublish: "Ready to publish",
    readyToPublishHint: "Drafted jobs that need a final publishing pass.",
    publishedJobs: "Published jobs",
    needsAttention: "Needs attention",
    needsAttentionHint: "Rejected or duplicate jobs that still need operator attention.",
    queueNeedsReviewTitle: "Needs review",
    queueNeedsReviewDescription: "Fresh raw jobs that should be cleaned up first.",
    openReviewQueue: "Open review queue",
    noRawJobs: "No raw jobs are waiting right now.",
    queueReadyTitle: "Ready to publish",
    queueReadyDescription: "Drafted jobs that look close to ready.",
    openJobDrafts: "Open job drafts",
    noDraftReady: "No draft jobs are ready to publish yet.",
    landingContentTitle: "Landing content",
    landingContentDescription: "CMS status for the public landing page.",
    openContentEditor: "Open content editor",
    waitingToPublish: "Draft changes are waiting to be published.",
    landingPageContent: "Landing page content",
    currentlyInSync: "Published content is currently in sync.",
    publishedPrefix: "Published",
    noPublishedYet: "No published content yet",
    recentActivityTitle: "Recent activity",
    recentActivityDescription: "Latest job and content changes across the workspace.",
    viewAll: "View all",
    catalogCoverage: "Catalog coverage",
    categoriesSuffix: "categories",
    sourcesTrackedPrefix: "Sources currently tracked:",
    sourcesTrackedSuffix: "Use this count to keep the public taxonomy and landing page messaging aligned.",
    opsTitle: "Content + jobs ops",
    opsHeading: "One workspace for review, publish, and homepage control",
    opsDescription: "The dashboard now stays focused on the next operational action instead of full reporting. Use the queues above to decide what moves first.",
  },
  id: {
    failedTitle: "Dashboard gagal dimuat",
    reload: "Muat ulang",
    loading: "Memuat dashboard...",
    eyebrow: "Ruang admin",
    heroTitle: "Jaga lowongan dan konten landing tetap bergerak.",
    heroDescription: "Tinjau lowongan mentah, publikasikan listing yang siap, dan perbarui landing page publik dari satu workspace yang rapi.",
    reviewJobs: "Review lowongan",
    editCms: "Edit CMS landing",
    scraperRuns: "Proses scraper",
    landingCms: "CMS Landing",
    landingTitle: "Konten landing page dikendalikan dari dashboard.",
    landingDescription: "Edit copy hero, aturan featured jobs, benefit, perusahaan terpercaya, dan blok CTA dengan bahasa visual yang sama seperti landing page publik.",
    openCms: "Buka editor CMS",
    previewLanding: "Preview landing page",
    contentStatus: "Status konten",
    draftReady: "Perubahan draft siap",
    publishedSync: "Konten terbit sinkron",
    status: "Status",
    lastUpdate: "Update terakhir",
    noUpdate: "Belum ada update",
    lastPublish: "Publish terakhir",
    notPublished: "Belum dipublikasikan",
    needsReview: "Perlu direview",
    needsReviewHint: "Lowongan mentah yang menunggu dibersihkan dan disetujui.",
    readyToPublish: "Siap publish",
    readyToPublishHint: "Lowongan draft yang butuh tahap publish terakhir.",
    publishedJobs: "Lowongan terbit",
    needsAttention: "Perlu perhatian",
    needsAttentionHint: "Lowongan reject atau duplikat yang masih perlu perhatian operator.",
    queueNeedsReviewTitle: "Perlu direview",
    queueNeedsReviewDescription: "Lowongan mentah terbaru yang perlu dibersihkan lebih dulu.",
    openReviewQueue: "Buka antrean review",
    noRawJobs: "Tidak ada lowongan mentah yang menunggu sekarang.",
    queueReadyTitle: "Siap publish",
    queueReadyDescription: "Lowongan draft yang sudah hampir siap tayang.",
    openJobDrafts: "Buka draft lowongan",
    noDraftReady: "Belum ada draft lowongan yang siap dipublikasikan.",
    landingContentTitle: "Konten landing",
    landingContentDescription: "Status CMS untuk landing page publik.",
    openContentEditor: "Buka editor konten",
    waitingToPublish: "Perubahan draft sedang menunggu dipublikasikan.",
    landingPageContent: "Konten landing page",
    currentlyInSync: "Konten terbit sedang sinkron.",
    publishedPrefix: "Dipublikasikan",
    noPublishedYet: "Belum ada konten terbit",
    recentActivityTitle: "Aktivitas terbaru",
    recentActivityDescription: "Perubahan lowongan dan konten terbaru di seluruh workspace.",
    viewAll: "Lihat semua",
    catalogCoverage: "Cakupan katalog",
    categoriesSuffix: "kategori",
    sourcesTrackedPrefix: "Sumber yang sedang dilacak:",
    sourcesTrackedSuffix: "Gunakan jumlah ini agar taksonomi publik dan pesan landing page tetap selaras.",
    opsTitle: "Operasional konten + lowongan",
    opsHeading: "Satu workspace untuk review, publish, dan kontrol homepage",
    opsDescription: "Dashboard sekarang fokus ke tindakan operasional berikutnya, bukan laporan penuh. Gunakan antrean di atas untuk menentukan prioritas berikutnya.",
  },
} as const

export default function AdminDashboardPage() {
  const [summary, setSummary] = React.useState<AdminDashboardSummary | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const { language } = useAdminLanguage()
  const t = copy[language]

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
          <div className="text-lg font-semibold text-red-800">{t.failedTitle}</div>
          <p className="mt-2">{error}</p>
          <Button className="mt-4 rounded-none" onClick={() => window.location.reload()}>
            {t.reload}
          </Button>
        </section>
      </AdminShell>
    )
  }

  if (!summary) {
    return (
      <AdminShell>
        <section className="border border-[var(--brand-shell-strong)] bg-white p-5 text-sm text-slate-600 shadow-[var(--shadow-sm)]">
          {t.loading}
        </section>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <section className="border border-[var(--brand-shell-strong)] bg-[linear-gradient(135deg,#ffffff_0%,#f5f9ff_60%,#eef6ff_100%)] p-4 shadow-[var(--shadow-md)] md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <AdminSectionHeader
            eyebrow={t.eyebrow}
            title={t.heroTitle}
            description={t.heroDescription}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-11 rounded-none">
              <Link href="/admin/raw-data">{t.reviewJobs}</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-none">
              <Link href="/admin/content">{t.editCms}</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-none">
              <Link href="/admin/scrape-runs">{t.scraperRuns}</Link>
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
                {t.landingCms}
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-ink)]">
                  {t.landingTitle}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                  {t.landingDescription}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="h-11 rounded-none">
                <Link href="/admin/content">{t.openCms}</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-none">
                <Link href="/">{t.previewLanding}</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="grid gap-3 border border-[var(--brand-shell-strong)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[var(--shadow-sm)]">
          <div className="border-b border-[var(--brand-shell-strong)] pb-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {t.contentStatus}
            </div>
            <div className="mt-2 text-lg font-semibold text-[var(--brand-ink)]">
              {summary.content.hasDraft ? t.draftReady : t.publishedSync}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border border-[var(--brand-shell-strong)] bg-white p-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t.status}</div>
              <div className="mt-3 flex items-center gap-2">
                <AdminStatusBadge status={summary.content.status} />
              </div>
            </div>
            <div className="border border-[var(--brand-shell-strong)] bg-white p-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t.lastUpdate}</div>
              <div className="mt-2 text-sm font-medium text-[var(--brand-ink)]">
                {summary.content.updatedAt ? new Date(summary.content.updatedAt).toLocaleString("id-ID") : t.noUpdate}
              </div>
            </div>
            <div className="border border-[var(--brand-shell-strong)] bg-white p-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t.lastPublish}</div>
              <div className="mt-2 text-sm font-medium text-[var(--brand-ink)]">
                {summary.content.publishedAt ? new Date(summary.content.publishedAt).toLocaleString("id-ID") : t.notPublished}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatTile
          label={t.needsReview}
          value={summary.statusCounts.raw}
          hint={t.needsReviewHint}
          icon={Database}
          status="raw"
        />
        <AdminStatTile
          label={t.readyToPublish}
          value={summary.statusCounts.draft}
          hint={t.readyToPublishHint}
          icon={FileText}
          status="draft"
        />
        <AdminStatTile
          label={t.publishedJobs}
          value={summary.statusCounts.published}
          hint={`${summary.catalog.totalCategories} ${t.categoriesSuffix} across ${summary.catalog.totalSources} sources.`}
          icon={Globe2}
          status="published"
        />
        <AdminStatTile
          label={t.needsAttention}
          value={summary.statusCounts.attention}
          hint={t.needsAttentionHint}
          icon={AlertTriangle}
          status="attention"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <AdminQueuePanel
          title={t.queueNeedsReviewTitle}
          description={t.queueNeedsReviewDescription}
          action={
            <Button asChild variant="outline" className="rounded-none">
              <Link href="/admin/raw-data">{t.openReviewQueue}</Link>
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
              {t.noRawJobs}
            </div>
          )}
        </AdminQueuePanel>

        <AdminQueuePanel
          title={t.queueReadyTitle}
          description={t.queueReadyDescription}
          action={
            <Button asChild variant="outline" className="rounded-none">
              <Link href="/admin/jobs">{t.openJobDrafts}</Link>
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
              {t.noDraftReady}
            </div>
          )}
        </AdminQueuePanel>

        <AdminQueuePanel
          title={t.landingContentTitle}
          description={t.landingContentDescription}
          action={
            <Button asChild variant="outline" className="rounded-none">
              <Link href="/admin/content">{t.openContentEditor}</Link>
            </Button>
          }
        >
          {summary.priorityQueues.landingContentDrafts.length > 0 ? (
            summary.priorityQueues.landingContentDrafts.map((item) => (
              <AdminListRow
                key={item.id}
                title={item.title}
                description={t.waitingToPublish}
                href={item.href}
                status={item.status}
                meta={item.updatedAt ? new Date(item.updatedAt).toLocaleString("id-ID") : null}
              />
            ))
          ) : (
            <AdminListRow
              title={t.landingPageContent}
              description={t.currentlyInSync}
              href="/admin/content"
              status={summary.content.status}
              meta={
                summary.content.publishedAt
                  ? `${t.publishedPrefix} ${new Date(summary.content.publishedAt).toLocaleString("id-ID")}`
                  : t.noPublishedYet
              }
            />
          )}
        </AdminQueuePanel>
      </section>

      <AdminQueuePanel
        title={t.recentActivityTitle}
        description={t.recentActivityDescription}
        action={
          <Link
            href="/admin/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            {t.viewAll}
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
                {t.catalogCoverage}
              </div>
              <div className="mt-2 text-lg font-semibold text-[var(--brand-ink)]">
                {summary.catalog.totalCategories} {t.categoriesSuffix}
              </div>
            </div>
            <div className="grid size-11 place-items-center border border-[var(--brand-shell-strong)] bg-sky-50 text-[var(--brand-blue)]">
              <Layers className="size-4" />
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {t.sourcesTrackedPrefix} {summary.catalog.totalSources}. {t.sourcesTrackedSuffix}
          </p>
        </div>
        <div className="border border-[var(--brand-shell-strong)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[var(--shadow-sm)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {t.opsTitle}
          </div>
          <div className="mt-2 text-lg font-semibold text-[var(--brand-ink)]">
            {t.opsHeading}
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {t.opsDescription}
          </p>
        </div>
      </section>
    </AdminShell>
  )
}
