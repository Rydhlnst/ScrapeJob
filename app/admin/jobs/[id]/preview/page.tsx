import { notFound } from "next/navigation"

import { getAdminJobById } from "@/lib/api/jobs"
import { JobPreviewBar } from "@/components/admin/job-preview-bar"
import { JobDetailContent } from "@/components/public/job-detail-content"
import { JobSummaryCard } from "@/components/public/job-summary-card"

export default async function AdminJobPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const job = await getAdminJobById(id)
  if (!job) notFound()

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
