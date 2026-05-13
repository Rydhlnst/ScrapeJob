import { notFound } from "next/navigation"

import { getJobBySlug } from "@/lib/api/jobs"
import { JobDetailContent } from "@/components/public/job-detail-content"
import { JobSummaryCard } from "@/components/public/job-summary-card"
import { PublicHeader } from "@/components/public/public-header"

export default async function JobDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const job = await getJobBySlug(params.slug)
  if (!job || job.status !== "published") notFound()

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <JobDetailContent job={job} />
          <JobSummaryCard job={job} />
        </div>
      </main>
    </div>
  )
}

