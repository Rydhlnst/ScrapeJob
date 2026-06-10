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
import { mockJobs } from "@/data/mock-jobs"

export default async function HomePage() {
  const [jobsRes, categories] = await Promise.all([
    listJobs({ page: 1, perPage: 8, sort: "newest" }),
    listCategories(),
  ])
  const homepageJobs =
    jobsRes.data.length > 0
      ? jobsRes.data.slice(0, 8)
      : mockJobs.filter((job) => job.status === "published").slice(0, 8)
  const sourcesCount = new Set(homepageJobs.map((job) => job.sourceName)).size

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection
          totalJobs={jobsRes.total || homepageJobs.length}
          totalCategories={categories.length}
          totalSources={sourcesCount}
          jobs={homepageJobs.slice(0, 3)}
        />
        <JobListingSection jobs={homepageJobs} />
        <PopularCategories categories={categories} />
        <BenefitsSection />
        <TrustedCompanies />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
