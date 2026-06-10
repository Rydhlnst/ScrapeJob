import { notFound } from "next/navigation"

import { getJobBySlug } from "@/lib/api/jobs"
import { JobDetailContent } from "@/components/public/job-detail-content"
import { JobSummaryCard } from "@/components/public/job-summary-card"
import { Footer } from "@/components/shared/Footer"
import { Navbar } from "@/components/shared/Navbar"
import { SiteContent, SiteFrame } from "@/components/shared/SiteShell"

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const job = await getJobBySlug(slug)
  if (!job || (job.status && job.status !== "published")) notFound()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8">
        <SiteFrame>
          <SiteContent>
          <div className="mb-6 rounded-[30px] border border-white/80 bg-white/72 p-5 shadow-[var(--shadow-sm)]">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Jobs / Detail
            </div>
            <div className="mt-2 text-sm text-slate-600">
              Real API detail page for selected lowongan.
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
            <JobDetailContent job={job} />
            <JobSummaryCard job={job} />
          </div>
          </SiteContent>
        </SiteFrame>
      </main>
      <Footer />
    </div>
  )
}
