import { CTASection } from "@/components/landing/CTASection"
import { HeroSection } from "@/components/landing/HeroSection"
import { PopularCategories } from "@/components/landing/PopularCategories"
import { TrustedCompanies } from "@/components/landing/TrustedCompanies"
import { Footer } from "@/components/shared/Footer"
import { Navbar } from "@/components/shared/Navbar"
import { BenefitsSection } from "@/components/landing/BenefitsSection"
import { JobListingSection } from "@/components/landing/JobListingSection"
import { listJobs } from "@/lib/api/jobs"
import { listCategories } from "@/lib/api/categories"
import { getPublicLandingPageContent } from "@/lib/api/landing-page-content"
import { normalizeLandingPageContent } from "@/lib/landing-page-content"
import { mockJobs } from "@/data/mock-jobs"

export default async function HomePage() {
  const content = normalizeLandingPageContent(await getPublicLandingPageContent())
  const [jobsRes, categories] = await Promise.all([
    listJobs({
      page: 1,
      perPage: content.featuredJobs.rules.limit,
      sort: content.featuredJobs.rules.sort,
      category: content.featuredJobs.rules.category ?? undefined,
      source: content.featuredJobs.rules.source ?? undefined,
    }),
    listCategories(),
  ])
  const homepageJobs =
    jobsRes.data.length > 0
      ? jobsRes.data.slice(0, content.featuredJobs.rules.limit)
      : mockJobs
          .filter((job) => job.status === "published")
          .slice(0, content.featuredJobs.rules.limit)
  const sourcesCount = new Set(homepageJobs.map((job) => job.sourceName)).size

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection
          totalJobs={jobsRes.total || homepageJobs.length}
          totalCategories={categories.length}
          totalSources={sourcesCount}
          content={content.hero}
          jobs={homepageJobs.slice(0, 3)}
        />
        <JobListingSection jobs={homepageJobs} content={content.featuredJobs} />
        <PopularCategories categories={categories} />
        <BenefitsSection content={content.benefits} />
        <TrustedCompanies content={content.trustedCompanies} />
        <CTASection content={content.cta} />
      </main>
      <Footer />
    </div>
  )
}
