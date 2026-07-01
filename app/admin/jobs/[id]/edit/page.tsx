"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { getAdminJobById } from "@/lib/api/jobs"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { JobEditorForm } from "@/components/admin/job-editor-form"
import { Button } from "@/components/ui/button"
import type { Job } from "@/types"

export default function AdminJobEditPage() {
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
          setError(err instanceof Error ? err.message : "Failed to load job")
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [id])

  return (
    <AdminShell>
      <AdminHeader
        title="Edit Job"
        description="Bedakan data mentah vs data yang sudah diedit. Raw description ada di accordion."
        actions={
          job ? (
            <Button asChild variant="outline" className="rounded-none">
              <Link href={`/admin/jobs/${job.id}/preview`}>Preview</Link>
            </Button>
          ) : null
        }
      />
      {error ? (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : loading ? (
        <div className="border border-border bg-card p-4 text-sm text-muted-foreground">Loading job...</div>
      ) : job ? (
        <div className="border border-border bg-card p-5">
          <JobEditorForm job={job} />
        </div>
      ) : (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">Job not found.</div>
      )}
    </AdminShell>
  )
}
