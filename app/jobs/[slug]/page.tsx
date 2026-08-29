import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getJobBySlug } from "@/lib/api/jobs"
import { getNavbarData } from "@/lib/api/navbar"
import { JobDetailContent } from "@/components/public/job-detail-content"
import { JobSummaryCard } from "@/components/public/job-summary-card"
import { Footer } from "@/components/shared/Footer"
import { Navbar } from "@/components/shared/Navbar"
import { SiteContent, SiteFrame } from "@/components/shared/SiteShell"
import { getServerWebsiteContext } from "@/lib/site/server-context"
import { getPublicSiteConfig } from "@/lib/api/site-config"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const siteContext = await getServerWebsiteContext()
  const siteConfig = await getPublicSiteConfig(siteContext)
  try {
    const job = await getJobBySlug(slug, siteContext)
    if (!job) return {}
    const company = job.companyName ? ` — ${job.companyName}` : ""
    const location = job.location ? ` di ${job.location}` : ""
    return {
      title: `${job.title}${company} | ${siteConfig.website.name}`,
      description:
        job.description
          ?.replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 160) || `Lowongan ${job.title}${location}. Temukan detail dan lamar sekarang di ${siteConfig.website.name}.`,
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
  const siteContext = await getServerWebsiteContext()
  const [job, navbarData] = await Promise.all([
    getJobBySlug(slug, siteContext).catch(() => null),
    getNavbarData(siteContext).catch(() => ({ jobs: [], categories: [], totalJobs: 0 })),
  ])
  if (!job || (job.status && job.status !== "published")) notFound()

  return (
    <div className="min-h-screen w-full max-w-none overflow-x-hidden bg-white">
      <Navbar jobs={navbarData.jobs} categories={navbarData.categories} totalJobs={navbarData.totalJobs} />
      <main className="min-h-screen w-full max-w-screen overflow-x-hidden bg-white pt-24 pb-16">
        <SiteFrame>
          <SiteContent>
          <div className="mx-auto grid w-full max-w-[1400px] min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
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
