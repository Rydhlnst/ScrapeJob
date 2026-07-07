"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
import { bulkCleanScrapedJobsWithAi } from "@/src/features/admin/scraped-jobs/api/bulk-clean-scraped-jobs"
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

  React.useEffect(() => {
    if (!job) return
    setTitle(cleanJobTitle(job.title))
    setCompany(job.company ?? "")
    setLocation(job.location ?? "")
    setSalary(job.salary ?? "")
    setEmploymentType(job.employmentType ?? "")
    setSummary(job.descriptionSummary ?? "")
    setDescription(ensureHtml(job.description))
  }, [job])

  async function handleSave() {
    if (!job) return
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
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-none" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel>Company</FieldLabel>
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} className="rounded-none" />
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

export function RawDataReviewClient() {
  const router = useRouter()
  const PER_PAGE = 15
  const ALL_PAGE_SIZE = 100
  const [jobs, setJobs] = React.useState<ScrapedJob[]>([])
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(1)
  const [stats, setStats] = React.useState<ReviewStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    published: 0,
  })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [selected, setSelected] = React.useState<string[]>([])
  const [search, setSearch] = React.useState("")
  const [searchInput, setSearchInput] = React.useState("")
  const [sourceFilter, setSourceFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState<ScrapedJobStatus | "all">("pending")
  const [previewJob, setPreviewJob] = React.useState<ScrapedJob | null>(null)

  const refreshStats = React.useCallback(async () => {
    const [pending, approved, rejected, published] = await Promise.all([
      getScrapedJobs("pending", 1, 1),
      getScrapedJobs("approved", 1, 1),
      getScrapedJobs("rejected", 1, 1),
      getScrapedJobs("published", 1, 1),
    ])
    setStats({ pending: pending.total, approved: approved.total, rejected: rejected.total, published: published.total })
  }, [])

  const refresh = React.useCallback(
    async (nextPage = 1, currentStatus: ScrapedJobStatus | "all" = statusFilter) => {
      try {
        setLoading(true)
        setError(null)

        if (currentStatus === "all") {
          const [pending, approved, rejected, published] = await Promise.all([
            getScrapedJobs("pending", 1, ALL_PAGE_SIZE, search, sourceFilter),
            getScrapedJobs("approved", 1, ALL_PAGE_SIZE, search, sourceFilter),
            getScrapedJobs("rejected", 1, ALL_PAGE_SIZE, search, sourceFilter),
            getScrapedJobs("published", 1, ALL_PAGE_SIZE, search, sourceFilter),
          ])
          const merged = [...pending.data, ...approved.data, ...rejected.data, ...published.data].sort((a, b) =>
            (b.scrapedAt ?? "").localeCompare(a.scrapedAt ?? ""),
          )
          const localTotal = merged.length
          const localTotalPages = Math.max(1, Math.ceil(localTotal / PER_PAGE))
          const safePage = Math.min(nextPage, localTotalPages)
          const start = (safePage - 1) * PER_PAGE
          setJobs(merged.slice(start, start + PER_PAGE))
          setPage(safePage)
          setTotal(localTotal)
          setTotalPages(localTotalPages)
        } else {
          const result = await getScrapedJobs(currentStatus, nextPage, PER_PAGE, search, sourceFilter)
          setJobs(result.data)
          setPage(result.page)
          setTotal(result.total)
          setTotalPages(Math.max(1, result.totalPages))
        }

        setSelected([])
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load scraped jobs."
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    [ALL_PAGE_SIZE, PER_PAGE, search, sourceFilter, statusFilter],
  )

  React.useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  React.useEffect(() => {
    void Promise.all([refresh(1, statusFilter), refreshStats()])
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
    setBusyId(id)
    try {
      let cleanedJob: ScrapedJob | null = null
      let draftId: string | null = null

      if (action === "approve") {
        const draft = await approveScrapedJob(id)
        draftId = draft.id
      }
      if (action === "reject") await rejectScrapedJob(id)
      if (action === "clean_ai") cleanedJob = await cleanScrapedJobWithAi(id)

      const targetPage = jobs.length === 1 && page > 1 ? page - 1 : page
      await Promise.all([refresh(targetPage), refreshStats()])
      if (cleanedJob) setPreviewJob(cleanedJob)

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
    setBusyId("__batch__")
    try {
      if (action === "clean_ai") {
        await bulkCleanScrapedJobsWithAi(selected)
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
      <ReviewStatsCards stats={stats} />

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



