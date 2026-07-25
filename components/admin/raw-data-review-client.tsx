"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import type { ScrapedJob, ScrapedJobStatus } from "@/types/job"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { getScrapedJobs } from "@/src/features/admin/scraped-jobs/api/get-scraped-jobs"
import { updateScrapedJob } from "@/src/features/admin/scraped-jobs/api/update-scraped-job"
import { approveScrapedJob } from "@/src/features/admin/scraped-jobs/api/approve-scraped-job"
import { rejectScrapedJob } from "@/src/features/admin/scraped-jobs/api/reject-scraped-job"
import { cleanScrapedJobWithAi } from "@/src/features/admin/scraped-jobs/api/clean-scraped-job"
import { bulkCleanScrapedJobsWithAi, getBulkCleanStatus, type BulkCleanStatus } from "@/src/features/admin/scraped-jobs/api/bulk-clean-scraped-jobs"
import { bulkApproveScrapedJobs } from "@/src/features/admin/scraped-jobs/api/bulk-approve-scraped-jobs"
import { bulkRejectScrapedJobs } from "@/src/features/admin/scraped-jobs/api/bulk-reject-scraped-jobs"
import { BulkActionBar } from "@/components/dashboard/scraped-review/bulk-action-bar"
import { ReviewEmptyState } from "@/components/dashboard/scraped-review/empty-state"
import { ReviewErrorState } from "@/components/dashboard/scraped-review/error-state"
import { ReviewFilters } from "@/components/dashboard/scraped-review/review-filters"
import { ReviewLoadingState } from "@/components/dashboard/scraped-review/loading-state"
import { ReviewStatsCards } from "@/components/dashboard/scraped-review/review-stats"
import { ReviewTable } from "@/components/dashboard/scraped-review/review-table"
import type { RowAction, ReviewStats } from "@/components/dashboard/scraped-review/types"
import { draftReviewSchema } from "@/lib/validations/admin/draft-review.schema"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function cleanJobTitle(value: string) {
  return value.replace(/^job\s*card\s*title\s*:\s*/i, "").trim()
}

function normalizeLocation(value: string | null) {
  if (!value) return null
  const cleaned = value.trim()
  const blocked = new Set(["di mana", "dimana", "where", "lokasi", "location", "semua lokasi", "all locations"])
  if (blocked.has(cleaned.toLowerCase())) return null
  return cleaned
}

function statusLabel(status: ScrapedJobStatus | "all") {
  if (status === "all") return "All"
  if (status === "pending") return "Pending"
  if (status === "approved") return "Draft Created"
  if (status === "rejected") return "Rejected"
  if (status === "published") return "Published"
  return "Duplicate"
}

function statusBadgeClass(status: ScrapedJobStatus) {
  if (status === "pending") return "bg-amber-100 text-amber-800 hover:bg-amber-100"
  if (status === "approved") return "bg-blue-100 text-blue-800 hover:bg-blue-100"
  if (status === "rejected") return "bg-red-100 text-red-700 hover:bg-red-100"
  if (status === "published") return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
  return "bg-slate-100 text-slate-700 hover:bg-slate-100"
}

function sourceBadgeClass(source: string) {
  const key = source.toLowerCase()
  if (key.includes("glints")) return "bg-sky-100 text-sky-800 hover:bg-sky-100"
  if (key.includes("jobstreet")) return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100"
  if (key.includes("linkedin")) return "bg-blue-100 text-blue-800 hover:bg-blue-100"
  if (key.includes("indeed")) return "bg-cyan-100 text-cyan-800 hover:bg-cyan-100"
  return "bg-slate-100 text-slate-700 hover:bg-slate-100"
}

function formatDate(date: string | null) {
  if (!date) return "-"
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function ensureHtml(value?: string | null): string {
  if (!value?.trim()) return ""
  if (/<[a-z][\s\S]*>/i.test(value)) return value
  return `<p>${value.replace(/\n/g, "<br />")}</p>`
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </div>
  )
}

function DraftReviewSheet({
  job,
  open,
  onOpenChange,
  onSaved,
}: {
  job: ScrapedJob | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (updated: ScrapedJob) => void
}) {
  const [title, setTitle] = React.useState("")
  const [company, setCompany] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [salary, setSalary] = React.useState("")
  const [employmentType, setEmploymentType] = React.useState("")
  const [summary, setSummary] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<"title" | "company" | "description", string>>>({})

  React.useEffect(() => {
    if (!job) return
    setTitle(cleanJobTitle(job.title))
    setCompany(job.company ?? "")
    setLocation(job.location ?? "")
    setSalary(job.salary ?? "")
    setEmploymentType(job.employmentType ?? "")
    setSummary(job.descriptionSummary ?? "")
    setDescription(ensureHtml(job.description))
    setFieldErrors({})
  }, [job])

  async function handleSave() {
    if (!job) return
    const parsed = draftReviewSchema.safeParse({ title, company, location, description })
    if (!parsed.success) {
      const next: Partial<Record<"title" | "company" | "description", string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (typeof key === "string" && !(key in next)) {
          next[key as "title" | "company" | "description"] = issue.message
        }
      }
      setFieldErrors(next)
      toast.error(parsed.error.issues[0]?.message ?? "Draft is invalid")
      return
    }
    setFieldErrors({})
    setIsSaving(true)
    try {
      const updated = await updateScrapedJob(job.id, {
        title,
        company,
        location: location || null,
        salary: salary || null,
        employment_type: employmentType || null,
        description: description || null,
        description_summary: summary || null,
      })
      toast.success("Draft saved.")
      onSaved(updated)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-3xl">
        {job ? (
          <>
            <SheetHeader className="border-b border-border pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={job.draftStatus === "drafted_ai" ? "rounded-none border-sky-100 bg-sky-50 text-sky-700" : "rounded-none border-slate-200 bg-slate-100 text-slate-600"}
                >
                  {job.draftStatus === "drafted_ai" ? "Drafted by AI" : "Drafted Raw"}
                </Badge>
                <Badge className={`rounded-full px-2.5 ${statusBadgeClass(job.status)}`}>{statusLabel(job.status)}</Badge>
              </div>
              <SheetTitle className="mt-2 text-xl">{cleanJobTitle(job.title)}</SheetTitle>
              <SheetDescription>
                Edit the raw draft below, then save. Move it to Draft to continue in the Blog Loker editor.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-5 p-4">
              <div className="space-y-1.5">
                <FieldLabel>Title</FieldLabel>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-none" aria-invalid={Boolean(fieldErrors.title)} />
                {fieldErrors.title ? <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p> : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel>Company</FieldLabel>
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} className="rounded-none" aria-invalid={Boolean(fieldErrors.company)} />
                  {fieldErrors.company ? <p className="mt-1 text-xs text-red-600">{fieldErrors.company}</p> : null}
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>Location</FieldLabel>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-none" placeholder="e.g. Jakarta" />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>Employment Type</FieldLabel>
                  <Input value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="rounded-none" placeholder="e.g. Full-time" />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>Salary</FieldLabel>
                  <Input value={salary} onChange={(e) => setSalary(e.target.value)} className="rounded-none" placeholder="e.g. Rp 6jt–10jt" />
                </div>
              </div>

              <div className="space-y-1.5">
                <FieldLabel>Summary</FieldLabel>
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="min-h-[80px] rounded-none"
                  placeholder="Short AI-generated summary of the job"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel>Description</FieldLabel>
                  <a
                    href={job.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-sky-700 underline-offset-4 hover:underline"
                  >
                    Open source
                  </a>
                </div>
                <RichTextEditor value={description} onChange={setDescription} />
                {fieldErrors.description ? <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p> : null}
              </div>

              {job.failReason ? (
                <div className="rounded-none border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  AI failed: {job.failReason}
                </div>
              ) : null}

              <div className="flex gap-2 border-t border-border pt-4">
                <Button type="button" className="rounded-none" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save draft"}
                </Button>
                <Button type="button" variant="outline" className="rounded-none" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

const VALID_STATUS_FILTERS: ReadonlyArray<ScrapedJobStatus | "all"> = [
  "all",
  "pending",
  "approved",
  "rejected",
  "duplicate",
  "published",
]

export function RawDataReviewClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const PER_PAGE = 15
  const [jobs, setJobs] = React.useState<ScrapedJob[]>([])
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(1)
  const [stats, setStats] = React.useState<ReviewStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    duplicate: 0,
    published: 0,
  })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [selected, setSelected] = React.useState<string[]>([])
  const [search, setSearch] = React.useState("")
  const [searchInput, setSearchInput] = React.useState("")
  const [sourceFilter, setSourceFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState<ScrapedJobStatus | "all">(() => {
    // A.5: honor ?status=… deep-link from admin sidebar.
    const initial = searchParams?.get("status")
    if (initial && VALID_STATUS_FILTERS.includes(initial as ScrapedJobStatus | "all")) {
      return initial as ScrapedJobStatus | "all"
    }
    return "pending"
  })
  const [previewJob, setPreviewJob] = React.useState<ScrapedJob | null>(null)
  const [pendingConfirm, setPendingConfirm] = React.useState<
    | null
    | { kind: "row-reject"; id: string; label: string }
    | { kind: "bulk-reject"; ids: string[] }
  >(null)
  const [cleanBatch, setCleanBatch] = React.useState<BulkCleanStatus | null>(null)
  // Monotonic epoch — increment before every refresh/refreshStats run so
  // late responses from cancelled queries can be dropped instead of clobbering
  // fresh state (fixes the debounced-search vs status-filter race).
  const refreshEpochRef = React.useRef(0)

  const refreshStats = React.useCallback(async () => {
    // Fetch each bucket independently so a single failure does not leave the
    // whole stats row stale. Any bucket that errors keeps its previous value.
    const results = await Promise.allSettled([
      getScrapedJobs("pending", 1, 1),
      getScrapedJobs("approved", 1, 1),
      getScrapedJobs("rejected", 1, 1),
      getScrapedJobs("duplicate", 1, 1),
      getScrapedJobs("published", 1, 1),
    ])
    const failures = results.filter((r) => r.status === "rejected")
    if (failures.length > 0) {
      console.error("[raw-data-review] some stats buckets failed", failures)
      if (failures.length === results.length) {
        toast.error("Gagal memperbarui statistik review.")
      }
    }
    setStats((prev) => ({
      pending: results[0].status === "fulfilled" ? results[0].value.total : prev.pending,
      approved: results[1].status === "fulfilled" ? results[1].value.total : prev.approved,
      rejected: results[2].status === "fulfilled" ? results[2].value.total : prev.rejected,
      duplicate: results[3].status === "fulfilled" ? results[3].value.total : prev.duplicate,
      published: results[4].status === "fulfilled" ? results[4].value.total : prev.published,
    }))
  }, [])

  const refresh = React.useCallback(
    async (nextPage = 1, currentStatus: ScrapedJobStatus | "all" = statusFilter) => {
      const epoch = ++refreshEpochRef.current
      try {
        setLoading(true)
        setError(null)

        // A.7: single server-side paginated call for every mode including
        // "all" — empty status = backend returns rows across all buckets.
        const result = await getScrapedJobs(currentStatus, nextPage, PER_PAGE, search, sourceFilter)
        // B.6: drop stale response — a newer refresh has already started.
        if (epoch !== refreshEpochRef.current) return
        setJobs(result.data)
        setPage(result.page)
        setTotal(result.total)
        setTotalPages(Math.max(1, result.totalPages))

        setSelected([])
      } catch (err) {
        if (epoch !== refreshEpochRef.current) return
        const message = err instanceof Error ? err.message : "Failed to load scraped jobs."
        setError(message)
        toast.error(message)
      } finally {
        if (epoch === refreshEpochRef.current) setLoading(false)
      }
    },
    [PER_PAGE, search, sourceFilter, statusFilter],
  )

  React.useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  React.useEffect(() => {
    Promise.all([refresh(1, statusFilter), refreshStats()]).catch((err) => {
      console.error("[raw-data-review] initial load failed", err)
    })
  }, [refresh, refreshStats, statusFilter])

  const sources = React.useMemo(() => {
    const all = new Set(jobs.map((job) => job.source).filter(Boolean))
    return Array.from(all)
  }, [jobs])

  const allChecked = jobs.length > 0 && selected.length === jobs.length
  const selectedCount = selected.length
  const batchBusy = busyId === "__batch__"
  const pageItems = React.useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1)
    if (page <= 3) return [1, 2, 3, 4, "ellipsis-right", totalPages] as const
    if (page >= totalPages - 2) return [1, "ellipsis-left", totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const
    return [1, "ellipsis-left", page - 1, page, page + 1, "ellipsis-right", totalPages] as const
  }, [page, totalPages])

  async function runAction(id: string, action: RowAction) {
    if (action === "reject") {
      const target = jobs.find((j) => j.id === id)
      setPendingConfirm({ kind: "row-reject", id, label: cleanJobTitle(target?.title ?? "This job") })
      return
    }
    await performAction(id, action)
  }

  async function performAction(id: string, action: RowAction) {
    setBusyId(id)
    try {
      let draftId: string | null = null

      if (action === "approve") {
        const draft = await approveScrapedJob(id)
        draftId = draft.id
      }
      if (action === "reject") await rejectScrapedJob(id)
      if (action === "clean_ai") {
        // AI cleanup is now queued asynchronously; the caller receives 202 and
        // must poll until draft_status flips to drafted_ai (or fail_reason).
        await cleanScrapedJobWithAi(id)
        toast.success("AI cleanup queued. Refreshing status...")
        // Short polling loop — refresh a few times over ~30s so the UI doesn't
        // hang forever if the worker crashes.
        for (let attempt = 0; attempt < 10; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 3000))
          await refresh(page)
          const row = jobs.find((j) => j.id === id)
          if (!row) break
          if (row.draftStatus === "drafted_ai" || row.failReason) break
        }
        return
      }

      const targetPage = jobs.length === 1 && page > 1 ? page - 1 : page
      await Promise.all([refresh(targetPage), refreshStats()])

      if (draftId) {
        toast.success("Moved to Blog Loker draft.", {
          action: {
            label: "Open Draft",
            onClick: () => router.push(`/admin/jobs/${draftId}/edit`),
          },
        })
      } else {
        toast.success("Action completed.")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Aksi gagal.")
    } finally {
      setBusyId(null)
    }
  }
  async function runBulkAction(action: RowAction) {
    if (!selected.length) return
    if (action === "reject") {
      setPendingConfirm({ kind: "bulk-reject", ids: [...selected] })
      return
    }
    await performBulkAction(action)
  }

  async function pollCleanBatch(batchId: string) {
    // Poll every 3s until the batch reports finished_at or gets cancelled.
    // Cap total wait at ~5 minutes so a stuck worker doesn't leak the timer.
    const maxAttempts = 100
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const status = await getBulkCleanStatus(batchId)
        setCleanBatch(status)
        if (status.finished_at || status.cancelled) {
          await Promise.all([refresh(page), refreshStats()])
          toast.success(`Bulk AI cleanup done — ${status.processed} processed, ${status.failed} failed.`)
          return
        }
      } catch (err) {
        console.error("[bulk-clean-ai] status poll failed", err)
        // Keep going; the batch table may just not be ready yet.
      }
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }
    toast.message("Bulk AI cleanup is still running in the background.")
  }

  async function performBulkAction(action: RowAction) {
    if (!selected.length) return
    setBusyId("__batch__")
    try {
      if (action === "clean_ai") {
        const dispatched = await bulkCleanScrapedJobsWithAi(selected)
        toast.success(`Bulk AI cleanup queued (${dispatched.total} jobs).`)
        void pollCleanBatch(dispatched.batch_id)
        return
      } else if (action === "approve") {
        await bulkApproveScrapedJobs(selected)
      } else if (action === "reject") {
        await bulkRejectScrapedJobs(selected)
      }

      await Promise.all([refresh(page), refreshStats()])
      toast.success(action === "approve" ? "Selected jobs moved to Blog Loker drafts." : `Bulk ${action} completed.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk action failed.")
    } finally {
      setBusyId(null)
    }
  }
  const helpers = {
    cleanJobTitle,
    normalizeLocation,
    formatDate,
    sourceBadgeClass,
    statusBadgeClass,
    statusLabel,
  }

  return (
    <section className="space-y-6">
      <DraftReviewSheet
        job={previewJob}
        open={Boolean(previewJob)}
        onOpenChange={(open) => !open && setPreviewJob(null)}
        onSaved={(updated) => {
          setPreviewJob(updated)
          void refresh(page)
        }}
      />

      <AlertDialog open={pendingConfirm !== null} onOpenChange={(open) => !open && setPendingConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingConfirm?.kind === "bulk-reject"
                ? `Reject ${pendingConfirm.ids.length} scraped ${pendingConfirm.ids.length === 1 ? "job" : "jobs"}?`
                : "Reject this scraped job?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingConfirm?.kind === "row-reject"
                ? `"${pendingConfirm.label}" will be marked as rejected and hidden from the pending queue.`
                : "The selected scraped jobs will be marked as rejected. You can still find them via the Rejected filter."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-600"
              onClick={async (event) => {
                event.preventDefault()
                const confirmed = pendingConfirm
                setPendingConfirm(null)
                if (!confirmed) return
                if (confirmed.kind === "row-reject") {
                  await performAction(confirmed.id, "reject")
                } else {
                  await performBulkAction("reject")
                }
              }}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ReviewStatsCards stats={stats} />

      {cleanBatch ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <div>
            <div className="font-medium">Bulk AI cleanup — {cleanBatch.processed}/{cleanBatch.total} processed</div>
            <div className="text-xs text-sky-800">
              {cleanBatch.pending} pending · {cleanBatch.failed} failed · {cleanBatch.progress}%
              {cleanBatch.finished_at ? " · finished" : ""}
              {cleanBatch.cancelled ? " · cancelled" : ""}
            </div>
          </div>
          {cleanBatch.finished_at || cleanBatch.cancelled ? (
            <Button size="sm" variant="outline" className="rounded-none" onClick={() => setCleanBatch(null)}>
              Dismiss
            </Button>
          ) : null}
        </div>
      ) : null}

      <Card className="border-border shadow-sm">
        <CardHeader className="gap-4 border-b border-border bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Review Queue</CardTitle>
              <CardDescription>Showing {jobs.length} of {total} {statusLabel(statusFilter).toLowerCase()} jobs</CardDescription>
            </div>
            {selectedCount > 0 ? (
              <Button size="sm" variant="secondary">
                {selectedCount} selected
              </Button>
            ) : null}
          </div>

          <ReviewFilters
            searchInput={searchInput}
            sourceFilter={sourceFilter}
            statusFilter={statusFilter}
            sources={sources}
            onSearchInputChange={setSearchInput}
            onSourceFilterChange={setSourceFilter}
            onStatusFilterChange={setStatusFilter}
            onRefresh={() => void refresh(1)}
          />
        </CardHeader>

        <CardContent className="max-w-full overflow-x-hidden space-y-4 p-4 md:p-6">
          <BulkActionBar
            selectedCount={selectedCount}
            busy={batchBusy}
            onApproveSelected={() => void runBulkAction("approve")}
            onRejectSelected={() => void runBulkAction("reject")}
            onCleanAiSelected={() => void runBulkAction("clean_ai")}
            onClear={() => setSelected([])}
          />

          {loading ? (
            <ReviewLoadingState />
          ) : error ? (
            <ReviewErrorState onRetry={() => void refresh(1)} />
          ) : jobs.length === 0 ? (
            <ReviewEmptyState
              onReset={() => {
                setSearchInput("")
                setSearch("")
                setSourceFilter("all")
                setStatusFilter("pending")
              }}
            />
          ) : (
            <>
              <ReviewTable
                jobs={jobs}
                selected={selected}
                busyId={busyId}
                allChecked={allChecked}
                helpers={helpers}
                onToggleAll={(checked) => setSelected(checked ? jobs.map((job) => job.id) : [])}
                onToggleRow={(id, checked) =>
                  setSelected((prev) => (checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((item) => item !== id)))
                }
                onAction={runAction}
                onInspect={setPreviewJob}
              />

              {totalPages > 1 ? (
                <div className="flex flex-col gap-3 border-t border-border pt-4 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, total)} of {total} {statusLabel(statusFilter).toLowerCase()} jobs
                  </p>
                  <Pagination className="mx-0 w-auto justify-start md:justify-end">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(event) => {
                            event.preventDefault()
                            if (page > 1) void refresh(page - 1)
                          }}
                          className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                          text="Previous"
                        />
                      </PaginationItem>

                      {pageItems.map((item, index) =>
                        typeof item === "number" ? (
                          <PaginationItem key={item}>
                            <PaginationLink
                              href="#"
                              isActive={item === page}
                              onClick={(event) => {
                                event.preventDefault()
                                if (item !== page) void refresh(item)
                              }}
                            >
                              {item}
                            </PaginationLink>
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={`${item}-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ),
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(event) => {
                            event.preventDefault()
                            if (page < totalPages) void refresh(page + 1)
                          }}
                          className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                          text="Next"
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  )
}



