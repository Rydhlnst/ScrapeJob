import { notFound } from "next/navigation"

import { getAdminJobById } from "@/lib/api/jobs"
import { JobDetailContent } from "@/components/public/job-detail-content"
import { JobSummaryCard } from "@/components/public/job-summary-card"
import { JobPreviewBar } from "@/components/admin/job-preview-bar"

export default async function AdminJobPreviewPage({
  params,
}: {
  params: { id: string }
}) {
  const job = await getAdminJobById(params.id)
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
