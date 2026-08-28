import type { Metadata } from "next"

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
import { mockJobs } from "@/data/mock-jobs"
import { mockCategories } from "@/data/mock-categories"
import { getServerWebsiteContext } from "@/lib/site/server-context"
import { getPublicSiteConfig } from "@/lib/api/site-config"
import { createDefaultLandingPageContent } from "@/lib/landing-page-content"

export async function generateMetadata(): Promise<Metadata> {
  const config = await getPublicSiteConfig(await getServerWebsiteContext())
  return {
    title: config.metadata.title || config.website.name,
    description: config.metadata.description || config.tagline,
  }
}

export default async function HomePage() {
  const siteContext = await getServerWebsiteContext()
  const siteConfig = await getPublicSiteConfig(siteContext)
  const content = normalizeLandingPageContent(
    (await getPublicLandingPageContent(siteContext).catch(() => null))
      ?? createDefaultLandingPageContent(siteConfig.website.name),
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
    }, siteContext).catch(() => fallbackJobs),
    listJobs({ page: 1, perPage: 100, sort: "newest" }, siteContext).catch(() => fallbackJobs),
    listCategories(siteContext).catch(() => mockCategories),
  ])
  const homepageJobs = jobsRes.data.slice(0, content.featuredJobs.rules.limit)
  const heroJobs = navJobsRes.data.length ? navJobsRes.data : homepageJobs
  const sourcesCount = new Set(homepageJobs.map((job) => job.sourceName)).size

  return (
    <div className="min-h-screen w-full max-w-none overflow-x-hidden bg-white">
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
          jobs={heroJobs}
        />

        {/* 2. Featured live openings */}
        <JobListingSection jobs={homepageJobs} content={content.featuredJobs} copy={content.sections.featured} />

        {/* 3. Browse by category */}
        <PopularCategories categories={categories} content={content.sections.categories} />

        {/* 4. Feature showcase */}
        <BenefitsSection content={content.benefits} copy={content.sections.features} visualCopy={content.sections.visuals} jobs={homepageJobs} />

        {/* 5. How it works */}
        <HowItWorks content={content.sections.how} />

        {/* 6. Testimonials */}
        <TestimonialsSection content={content.sections.testimonials} />

        {/* 7. FAQ */}
        <FAQSection content={content.sections.faq} />

        {/* 8. Blue career discovery callout */}
        <CTASection content={content.cta} copy={content.sections.cta} visualCopy={content.sections.visuals} jobs={homepageJobs} />
      </main>
      <Footer content={content.sections.footer} />
    </div>
  )
}
