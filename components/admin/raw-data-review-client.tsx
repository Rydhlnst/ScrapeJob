"use client"

import * as React from "react"
import { toast } from "sonner"

import type { ScrapedJob, ScrapedJobStatus } from "@/types/job"
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
import { getScrapedJobs } from "@/src/features/admin/scraped-jobs/api/get-scraped-jobs"
import { approveScrapedJob } from "@/src/features/admin/scraped-jobs/api/approve-scraped-job"
import { publishScrapedJob } from "@/src/features/admin/scraped-jobs/api/publish-scraped-job"
import { rejectScrapedJob } from "@/src/features/admin/scraped-jobs/api/reject-scraped-job"
import { cleanScrapedJobWithAi } from "@/src/features/admin/scraped-jobs/api/clean-scraped-job"
import { bulkCleanScrapedJobsWithAi } from "@/src/features/admin/scraped-jobs/api/bulk-clean-scraped-jobs"
import { bulkApproveScrapedJobs } from "@/src/features/admin/scraped-jobs/api/bulk-approve-scraped-jobs"
import { bulkRejectScrapedJobs } from "@/src/features/admin/scraped-jobs/api/bulk-reject-scraped-jobs"
import { bulkPublishScrapedJobs } from "@/src/features/admin/scraped-jobs/api/bulk-publish-scraped-jobs"
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
  if (status === "approved") return "Approved"
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

export function RawDataReviewClient() {
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
  const selectedJobs = React.useMemo(
    () => jobs.filter((job) => selected.includes(job.id)),
    [jobs, selected],
  )
  const canPublish = React.useCallback((job: ScrapedJob) => job.status === "approved", [])
  const canBulkPublish = selectedJobs.length > 0 && selectedJobs.every(canPublish)

  const pageItems = React.useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1)
    if (page <= 3) return [1, 2, 3, 4, "ellipsis-right", totalPages] as const
    if (page >= totalPages - 2) return [1, "ellipsis-left", totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const
    return [1, "ellipsis-left", page - 1, page, page + 1, "ellipsis-right", totalPages] as const
  }, [page, totalPages])

  async function runAction(id: string, action: RowAction) {
    setBusyId(id)
    try {
      if (action === "approve") await approveScrapedJob(id)
      if (action === "reject") await rejectScrapedJob(id)
      if (action === "publish") await publishScrapedJob(id)
      if (action === "clean_ai") await cleanScrapedJobWithAi(id)
      const targetPage = jobs.length === 1 && page > 1 ? page - 1 : page
      await Promise.all([refresh(targetPage), refreshStats()])
      toast.success("Action completed.")
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
      } else if (action === "publish") {
        await bulkPublishScrapedJobs(selected)
      }
      await Promise.all([refresh(page), refreshStats()])
      toast.success(`Bulk ${action} completed.`)
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
      <ReviewStatsCards stats={stats} />

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="gap-4 border-b border-border/70 bg-muted/20">
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

        <CardContent className="space-y-4 p-4 md:p-6">
          <BulkActionBar
            selectedCount={selectedCount}
            busy={batchBusy}
            publishDisabled={!canBulkPublish}
            onApproveSelected={() => void runBulkAction("approve")}
            onRejectSelected={() => void runBulkAction("reject")}
            onPublishSelected={() => void runBulkAction("publish")}
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
                canPublish={canPublish}
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
