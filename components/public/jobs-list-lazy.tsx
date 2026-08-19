"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import type { Job, Paginated } from "@/types"
import { listJobs, type JobsQuery } from "@/lib/api/jobs"
import { JobCard } from "@/components/public/job-card"
import { Button } from "@/components/ui/button"

const PER_PAGE = 9

export function JobsListLazy({
  initial,
  query,
}: {
  initial: Paginated<Job>
  query: JobsQuery
}) {
  const [jobs, setJobs] = React.useState<Job[]>(initial.data)
  const [page, setPage] = React.useState(initial.page)
  const [totalPages, setTotalPages] = React.useState(initial.totalPages)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)
  // Track the query signature so a filter change triggers a hard reset even if
  // the component instance is reused across route param updates.
  const querySignature = React.useMemo(() => JSON.stringify(query), [query])
  const initialSignatureRef = React.useRef(querySignature)

  React.useEffect(() => {
    if (querySignature === initialSignatureRef.current) return
    initialSignatureRef.current = querySignature
    setJobs(initial.data)
    setPage(initial.page)
    setTotalPages(initial.totalPages)
    setError(null)
  }, [querySignature, initial])

  const hasMore = page < totalPages

  const loadMore = React.useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    setError(null)
    try {
      const next = await listJobs({ ...query, page: page + 1, perPage: PER_PAGE })
      setJobs((prev) => {
        const seen = new Set(prev.map((job) => job.id))
        const deduped = next.data.filter((job) => !seen.has(job.id))
        return [...prev, ...deduped]
      })
      setPage(next.page)
      setTotalPages(next.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat lowongan berikutnya.")
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, query])

  React.useEffect(() => {
    if (!hasMore) return
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            loadMore()
            break
          }
        }
      },
      { rootMargin: "600px 0px" },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} variant="compact" />
        ))}
      </div>

      {hasMore ? (
        <div ref={sentinelRef} className="mt-6 flex flex-col items-center gap-3">
          {loading ? (
            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              Memuat lowongan berikutnya…
            </div>
          ) : (
            <Button
              variant="outline"
              className="rounded-full border-black/10 bg-white text-slate-700 shadow-[0_3px_0_rgba(23,23,23,.04)] hover:-translate-y-0.5 hover:border-[#3f95e8]/50 hover:bg-[#f7f9fb] hover:text-[#171717]"
              onClick={loadMore}
            >
              Muat lebih banyak
            </Button>
          )}
          {error ? (
            <div className="rounded-full border border-[#ffd36a] bg-white px-4 py-2 text-sm font-semibold text-[#9a6700]">Tidak dapat memuat lowongan berikutnya. Coba lagi.</div>
          ) : null}
        </div>
      ) : jobs.length > PER_PAGE ? (
        <div className="mt-6 text-center text-xs uppercase tracking-[0.14em] text-slate-400">
          Semua lowongan telah ditampilkan
        </div>
      ) : null}
    </>
  )
}
