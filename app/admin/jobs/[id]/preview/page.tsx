"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import { getAdminJobById } from "@/lib/api/jobs"
import { JobPreviewBar } from "@/components/admin/job-preview-bar"
import { JobDetailContent } from "@/components/public/job-detail-content"
import { JobSummaryCard } from "@/components/public/job-summary-card"
import type { Job } from "@/types"

export default function AdminJobPreviewPage() {
  const params = useParams<{ id: string }>()
  const id = typeof params?.id === "string" ? params.id : ""
  const [job, setJob] = React.useState<Job | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!id) return
    let active = true

    getAdminJobById(id)
      .then((result) => {
        if (active) {
          setJob(result)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load job preview")
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [id])

  if (error) {
    return <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
  }

  if (loading || !job) {
    return <div className="border border-border bg-card p-4 text-sm text-muted-foreground">Loading preview...</div>
  }

  return (
    <div className="space-y-4">
      <JobPreviewBar jobId={job.id} />
      <main className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <JobDetailContent job={job} />
          <JobSummaryCard job={job} />
        </div>
      </main>
    </div>
  )
}
