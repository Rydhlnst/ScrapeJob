import { notFound } from "next/navigation"

import { getJobBySlug } from "@/lib/api/jobs"
import { JobDetailContent } from "@/components/public/job-detail-content"
import { JobSummaryCard } from "@/components/public/job-summary-card"
import { Footer } from "@/components/shared/Footer"
import { SaasNavbar } from "@/components/shared/SaasNavbar"

export default async function JobDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const job = await getJobBySlug(params.slug)
  if (!job || (job.status && job.status !== "published")) notFound()

  return (
    <div className="min-h-screen bg-background">
      <SaasNavbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
          <JobDetailContent job={job} />
          <JobSummaryCard job={job} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
