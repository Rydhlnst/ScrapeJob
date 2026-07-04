"use client"

import * as React from "react"

import { listJobs } from "@/lib/api/jobs"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { JobsTable } from "@/components/admin/jobs-table"

export default function AdminJobsPage() {
  const [jobs, setJobs] = React.useState<any[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true

    listJobs({ admin: true, perPage: 50, page: 1, sort: "newest" })
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
  }, [])

  return (
    <AdminShell>
      <AdminHeader
        title="Blog Loker"
        description="Kelola hasil scrape yang sudah dipublish sebagai artikel lowongan yang masih bisa diedit ulang secara manual."
      />
      {error ? (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : loading ? (
        <div className="border border-border bg-card p-4 text-sm text-muted-foreground">Loading jobs...</div>
      ) : (
        <JobsTable jobs={jobs} title="Blog lowongan" />
      )}
    </AdminShell>
  )
}
