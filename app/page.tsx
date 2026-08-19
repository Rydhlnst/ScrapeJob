import { CTASection } from "@/components/landing/CTASection"
import { HeroSection } from "@/components/landing/HeroSection"
import { Footer } from "@/components/shared/Footer"
import { Navbar } from "@/components/shared/Navbar"
import { BenefitsSection } from "@/components/landing/BenefitsSection"
import { JobListingSection } from "@/components/landing/JobListingSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { PopularCategories } from "@/components/landing/PopularCategories"
import { listJobs } from "@/lib/api/jobs"
import { listCategories } from "@/lib/api/categories"
import { getPublicLandingPageContent } from "@/lib/api/landing-page-content"
import { normalizeLandingPageContent } from "@/lib/landing-page-content"
import { defaultLandingPageContent } from "@/lib/landing-page-content"
import { mockJobs } from "@/data/mock-jobs"
import { mockCategories } from "@/data/mock-categories"

export default async function HomePage() {
  const content = normalizeLandingPageContent(
    await getPublicLandingPageContent().catch(() => defaultLandingPageContent),
  )
  const fallbackJobs = {
    data: mockJobs,
    page: 1,
    perPage: mockJobs.length,
    total: mockJobs.length,
    totalPages: 1,
  }
  const [jobsRes, navJobsRes, categories] = await Promise.all([
    listJobs({
      page: 1,
      perPage: content.featuredJobs.rules.limit,
      sort: content.featuredJobs.rules.sort,
      category: content.featuredJobs.rules.category ?? undefined,
      source: content.featuredJobs.rules.source ?? undefined,
    }).catch(() => fallbackJobs),
    listJobs({ page: 1, perPage: 100, sort: "newest" }).catch(() => fallbackJobs),
    listCategories().catch(() => mockCategories),
  ])
  const homepageJobs = jobsRes.data.slice(0, content.featuredJobs.rules.limit)
  const sourcesCount = new Set(homepageJobs.map((job) => job.sourceName)).size

  return (
    <div className="min-h-screen w-full max-w-none overflow-x-hidden bg-[#fffdf8]">
      <Navbar jobs={navJobsRes.data} categories={categories} totalJobs={jobsRes.total} />
      <main className="w-full pt-24">
        {/* 1. Hero — bold headline, search, stats, illustration */}
        <HeroSection
          totalJobs={jobsRes.total || homepageJobs.length}
          totalCategories={categories.length}
          totalSources={sourcesCount}
          content={content.hero}
          copy={content.sections.hero}
          visualCopy={content.sections.visuals}
          companies={content.trustedCompanies.items}
          jobs={homepageJobs.slice(0, 3)}
        />

        {/* 2. Feature showcase */}
        <BenefitsSection content={content.benefits} copy={content.sections.features} visualCopy={content.sections.visuals} jobs={homepageJobs} />

        {/* 3. Blue career discovery callout */}
        <CTASection content={content.cta} copy={content.sections.cta} visualCopy={content.sections.visuals} jobs={homepageJobs} />

        {/* 4. Benefits */}
        <HowItWorks content={content.sections.how} />

        {/* 5. Browse by category */}
        <PopularCategories categories={categories} content={content.sections.categories} />

        {/* 6. Featured live openings */}
        <JobListingSection jobs={homepageJobs} content={content.featuredJobs} copy={content.sections.featured} />

        {/* 7. Testimonials */}
        <TestimonialsSection content={content.sections.testimonials} />

        {/* 8. FAQ */}
        <FAQSection content={content.sections.faq} />
      </main>
      <Footer content={content.sections.footer} />
    </div>
  )
}
