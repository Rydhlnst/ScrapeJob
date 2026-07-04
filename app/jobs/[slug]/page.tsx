import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getJobBySlug } from "@/lib/api/jobs"
import { JobDetailContent } from "@/components/public/job-detail-content"
import { JobSummaryCard } from "@/components/public/job-summary-card"
import { Footer } from "@/components/shared/Footer"
import { Navbar } from "@/components/shared/Navbar"
import { SiteContent, SiteFrame } from "@/components/shared/SiteShell"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const job = await getJobBySlug(slug)
    if (!job) return {}
    const company = job.companyName ? ` — ${job.companyName}` : ""
    const location = job.location ? ` di ${job.location}` : ""
    return {
      title: `${job.title}${company} | Lowonganku`,
      description:
        job.description
          ?.replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 160) || `Lowongan ${job.title}${location}. Temukan detail dan lamar sekarang di Lowonganku.`,
    }
  } catch {
    return {}
  }
}

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
