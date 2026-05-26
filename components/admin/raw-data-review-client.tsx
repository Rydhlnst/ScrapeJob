"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  CheckCheck,
  CircleCheckBig,
  CircleX,
  ExternalLink,
  FileSearch,
  Loader2,
  ListFilter,
  MapPin,
  Search,
  Send,
  Sparkles,
} from "lucide-react"

import type { ScrapedJob, ScrapedJobStatus } from "@/types/job"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getScrapedJobs } from "@/src/features/admin/scraped-jobs/api/get-scraped-jobs"
import { approveScrapedJob } from "@/src/features/admin/scraped-jobs/api/approve-scraped-job"
import { publishScrapedJob } from "@/src/features/admin/scraped-jobs/api/publish-scraped-job"
import { rejectScrapedJob } from "@/src/features/admin/scraped-jobs/api/reject-scraped-job"

type Stats = {
  pending: number
  approved: number
  rejected: number
  published: number
}

function cleanJobTitle(value: string) {
  return value.replace(/^job\s*card\s*title\s*:\s*/i, "").trim()
}

function statusLabel(status: ScrapedJobStatus | "all") {
  if (status === "all") return "All"
  switch (status) {
    case "pending":
      return "Pending"
    case "approved":
      return "Approved"
    case "rejected":
      return "Rejected"
    case "published":
      return "Published"
    default:
      return "Duplicate"
  }
}

function statusBadgeClass(status: ScrapedJobStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800 hover:bg-amber-100"
    case "approved":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    case "rejected":
      return "bg-red-100 text-red-700 hover:bg-red-100"
    case "published":
      return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
    default:
      return "bg-slate-100 text-slate-700 hover:bg-slate-100"
  }
}

function sourceBadgeClass(source: string) {
  const key = source.toLowerCase()
  if (key.includes("glints")) return "bg-sky-100 text-sky-800 hover:bg-sky-100"
  if (key.includes("jobstreet")) return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100"
  if (key.includes("linkedin")) return "bg-blue-100 text-blue-800 hover:bg-blue-100"
  if (key.includes("loker")) return "bg-cyan-100 text-cyan-800 hover:bg-cyan-100"
  return "bg-slate-100 text-slate-700 hover:bg-slate-100"
}

function statusIcon(status: ScrapedJobStatus) {
  switch (status) {
    case "approved":
      return <CircleCheckBig className="h-4 w-4" />
    case "rejected":
      return <CircleX className="h-4 w-4" />
    case "published":
      return <Send className="h-4 w-4" />
    default:
      return <FileSearch className="h-4 w-4" />
  }
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
  const [stats, setStats] = React.useState<Stats>({
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
  const [sourceFilter, setSourceFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState<ScrapedJobStatus | "all">("pending")

  const refreshStats = React.useCallback(async () => {
    const [pending, approved, rejected, published] = await Promise.all([
      getScrapedJobs("pending", 1, 1),
      getScrapedJobs("approved", 1, 1),
      getScrapedJobs("rejected", 1, 1),
      getScrapedJobs("published", 1, 1),
    ])

    setStats({
      pending: pending.total,
      approved: approved.total,
      rejected: rejected.total,
      published: published.total,
    })
  }, [])

  const refresh = React.useCallback(
    async (nextPage = 1, currentStatus: ScrapedJobStatus | "all" = statusFilter) => {
      try {
        setLoading(true)
        setError(null)

        if (currentStatus === "all") {
          const [pending, approved, rejected, published] = await Promise.all([
            getScrapedJobs("pending", 1, ALL_PAGE_SIZE),
            getScrapedJobs("approved", 1, ALL_PAGE_SIZE),
            getScrapedJobs("rejected", 1, ALL_PAGE_SIZE),
            getScrapedJobs("published", 1, ALL_PAGE_SIZE),
          ])

          const merged = [...pending.data, ...approved.data, ...rejected.data, ...published.data].sort((a, b) =>
            (b.scrapedAt ?? "").localeCompare(a.scrapedAt ?? ""),
          )

          const localTotal = merged.length
          const localTotalPages = Math.max(1, Math.ceil(localTotal / PER_PAGE))
          const safePage = Math.min(nextPage, localTotalPages)
          const start = (safePage - 1) * PER_PAGE
          const paged = merged.slice(start, start + PER_PAGE)

          setJobs(paged)
          setPage(safePage)
          setTotal(localTotal)
          setTotalPages(localTotalPages)
        } else {
          const result = await getScrapedJobs(currentStatus, nextPage, PER_PAGE)
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
    [ALL_PAGE_SIZE, PER_PAGE, statusFilter],
  )

  React.useEffect(() => {
    void Promise.all([refresh(1, statusFilter), refreshStats()])
  }, [refresh, refreshStats, statusFilter])

  const sources = React.useMemo(() => {
    const all = new Set(jobs.map((job) => job.source).filter(Boolean))
    return ["all", ...Array.from(all)]
  }, [jobs])

  const filteredJobs = React.useMemo(() => {
    return jobs.filter((job) => {
      const text = `${job.title} ${job.company} ${job.location ?? ""}`.toLowerCase()
      const textMatch = search.trim() === "" || text.includes(search.trim().toLowerCase())
      const sourceMatch = sourceFilter === "all" || job.source === sourceFilter
      return textMatch && sourceMatch
    })
  }, [jobs, search, sourceFilter])

  const allChecked = filteredJobs.length > 0 && selected.length === filteredJobs.length
  const selectedCount = selected.length

  const pageItems = React.useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }
    if (page <= 3) {
      return [1, 2, 3, 4, "ellipsis-right", totalPages] as const
    }
    if (page >= totalPages - 2) {
      return [1, "ellipsis-left", totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const
    }
    return [1, "ellipsis-left", page - 1, page, page + 1, "ellipsis-right", totalPages] as const
  }, [page, totalPages])

  async function runAction(id: string, action: "approve" | "reject" | "publish") {
    setBusyId(id)
    try {
      if (action === "approve") {
        await approveScrapedJob(id)
        toast.success("Job berhasil di-approve.")
      } else if (action === "reject") {
        await rejectScrapedJob(id)
        toast.success("Job berhasil di-reject.")
      } else {
        await publishScrapedJob(id)
        toast.success("Job berhasil dipublish.")
      }
      const targetPage = jobs.length === 1 && page > 1 ? page - 1 : page
      await Promise.all([refresh(targetPage), refreshStats()])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Aksi gagal."
      toast.error(message)
    } finally {
      setBusyId(null)
    }
  }

  const statsCards = [
    {
      key: "pending",
      label: "Pending Jobs",
      count: stats.pending,
      icon: FileSearch,
      accent: "text-amber-600",
    },
    {
      key: "approved",
      label: "Approved Jobs",
      count: stats.approved,
      icon: CheckCheck,
      accent: "text-blue-600",
    },
    {
      key: "rejected",
      label: "Rejected Jobs",
      count: stats.rejected,
      icon: CircleX,
      accent: "text-red-600",
    },
    {
      key: "published",
      label: "Published Jobs",
      count: stats.published,
      icon: Send,
      accent: "text-emerald-600",
    },
  ] as const

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((item) => (
          <Card key={item.key} className="border border-border shadow-sm">
            <CardHeader>
              <CardDescription className="flex items-center justify-between text-xs uppercase tracking-wide">
                {item.label}
                <item.icon className={`h-4 w-4 ${item.accent}`} />
              </CardDescription>
              <CardTitle className="text-2xl">{item.count}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="border border-border shadow-sm">
        <CardHeader className="gap-3 border-b border-border">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Review Queue</CardTitle>
              <CardDescription>
                Showing {filteredJobs.length} of {total} {statusLabel(statusFilter).toLowerCase()} jobs
              </CardDescription>
            </div>
            {selectedCount > 0 ? (
              <Button size="sm">
                <Sparkles className="h-4 w-4" />
                Bulk Publish ({selectedCount})
              </Button>
            ) : null}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, company, or location"
                className="pl-9"
              />
            </div>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item === "all" ? "All sources" : item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ScrapedJobStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => void refresh(1)}>
              <ListFilter className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 pb-1 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading scraped jobs...
              </div>
              {Array.from({ length: 6 }, (_, idx) => (
                <Skeleton key={idx} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
              Failed to load scraped jobs. Please try refresh again.
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No pending scraped jobs to review.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Run scraper again or change the filter to see other statuses.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allChecked}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelected(filteredJobs.map((job) => job.id))
                            } else {
                              setSelected([])
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="min-w-[260px]">Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job) => {
                      const checked = selected.includes(job.id)
                      const busy = busyId === job.id
                      const title = cleanJobTitle(job.title)

                      return (
                        <TableRow key={job.id}>
                          <TableCell>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => {
                                if (value) {
                                  setSelected((prev) => [...prev, job.id])
                                } else {
                                  setSelected((prev) => prev.filter((id) => id !== job.id))
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="max-w-[420px]">
                            <div className="space-y-1">
                              <p className="truncate font-semibold text-foreground">{title}</p>
                              <div className="text-xs text-muted-foreground">
                                Scraped: {formatDate(job.scrapedAt)}
                                {job.employmentType ? ` • ${job.employmentType}` : ""}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{job.company || <span className="text-muted-foreground">Unknown company</span>}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-sm">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{job.location ?? <span className="text-muted-foreground">-</span>}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={sourceBadgeClass(job.source)}>{job.source}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusBadgeClass(job.status)}>
                              {statusIcon(job.status)}
                              {statusLabel(job.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button asChild variant="ghost" size="sm">
                                <Link href={job.sourceUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                  View Source
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-700 hover:bg-red-50"
                                disabled={busy}
                                onClick={() => void runAction(job.id, "reject")}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() => void runAction(job.id, "approve")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                disabled={busy}
                                onClick={() => void runAction(job.id, "publish")}
                              >
                                Publish
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 ? (
                <div className="flex flex-col gap-3 border-t border-border pt-4 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, total)} of {total}{" "}
                    {statusLabel(statusFilter).toLowerCase()} jobs
                  </p>
                  <Pagination className="mx-0 w-auto justify-start md:justify-end">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(event) => {
                            event.preventDefault()
                            if (page > 1) {
                              void refresh(page - 1)
                            }
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
                                if (item !== page) {
                                  void refresh(item)
                                }
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
                            if (page < totalPages) {
                              void refresh(page + 1)
                            }
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
