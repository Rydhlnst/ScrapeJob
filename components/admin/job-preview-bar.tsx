"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { publishAdminJob, rejectAdminJob, type AdminJobRecord } from "@/lib/api/admin-jobs"

export function JobPreviewBar({
  jobId,
  onChanged,
}: {
  jobId: string
  onChanged?: (job: AdminJobRecord) => void
}) {
  const [busy, setBusy] = React.useState<"publish" | "reject" | null>(null)

  async function runAction(action: "publish" | "reject") {
    setBusy(action)
    try {
      const updated = action === "publish"
        ? await publishAdminJob(jobId)
        : await rejectAdminJob(jobId)
      onChanged?.(updated)
      toast.success(action === "publish" ? "Job published." : "Job rejected.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update job status.")
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <Button asChild variant="outline">
          <Link href={`/admin/jobs/${jobId}/edit`}>Back to Edit</Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => void runAction("publish")}
            disabled={busy !== null}
          >
            {busy === "publish" ? "Publishing..." : "Publish"}
          </Button>
          <Button
            className="bg-rose-600 hover:bg-rose-700"
            onClick={() => void runAction("reject")}
            disabled={busy !== null}
          >
            {busy === "reject" ? "Rejecting..." : "Reject"}
          </Button>
        </div>
      </div>
    </div>
  )
}


