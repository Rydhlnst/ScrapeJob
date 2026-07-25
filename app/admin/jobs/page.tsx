"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { listJobs } from "@/lib/api/jobs"
import type { Job } from "@/types"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { JobsTable } from "@/components/admin/jobs-table"

const VALID_STATUSES = ["draft", "published", "archived"] as const
type AdminJobStatus = (typeof VALID_STATUSES)[number]

const TITLE_BY_STATUS: Record<AdminJobStatus, string> = {
  draft: "Draft Lowongan",
  published: "Published Lowongan",
  archived: "Archived Lowongan",
}

export default function AdminJobsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const statusParam = searchParams?.get("status") ?? "draft"
  const status: AdminJobStatus = (VALID_STATUSES as ReadonlyArray<string>).includes(statusParam)
    ? (statusParam as AdminJobStatus)
    : "draft"

  const keyword = searchParams?.get("keyword") ?? ""
  const source = searchParams?.get("source") ?? null
  const category = searchParams?.get("category") ?? null

  const [jobs, setJobs] = React.useState<Job[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [reloadTick, setReloadTick] = React.useState(0)

  React.useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    listJobs({
      admin: true,
      perPage: 50,
      page: 1,
      sort: "newest",
      status,
      keyword: keyword || undefined,
      source: source || undefined,
      category: category || undefined,
    })
      .then((result) => {
        if (active) {
          setJobs(result.data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load jobs")
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [status, keyword, source, category, reloadTick])

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams?.toString() ?? "")
    if (value === null || value === "") next.delete(key)
    else next.set(key, value)
    router.replace(`/admin/jobs?${next.toString()}`)
  }

  // Derive filter options from current dataset.
  const sources = React.useMemo(
    () => Array.from(new Set(jobs.map((j) => j.sourceName).filter(Boolean))).sort() as string[],
    [jobs],
  )
  const categories = React.useMemo(
    () =>
      Array.from(new Set(jobs.map((j) => j.category).filter(Boolean))).sort() as string[],
    [jobs],
  )

  return (
    <AdminShell>
      <AdminHeader
        title="Lowongan"
        description="Kelola draft dari raw scrape sebagai artikel lowongan dinamis sebelum dipublish."
      />
      {error ? (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : loading ? (
        <div className="border border-zinc-200 bg-white p-4 text-sm text-zinc-500">Loading jobs...</div>
      ) : (
        <JobsTable
          jobs={jobs}
          title={TITLE_BY_STATUS[status]}
          initialKeyword={keyword}
          onKeywordChange={(k) => updateParam("keyword", k)}
          onRefresh={() => setReloadTick((n) => n + 1)}
          filters={{
            sources,
            categories,
            activeSource: source ?? undefined,
            activeCategory: category ?? undefined,
            onSourceChange: (v) => updateParam("source", v),
            onCategoryChange: (v) => updateParam("category", v),
          }}
        />
      )}
    </AdminShell>
  )
}
