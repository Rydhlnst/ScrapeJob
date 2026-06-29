export type LandingLink = {
  label: string
  href: string
}

export type LandingCompanyItem = {
  id: string
  name: string
  url: string
  brandColor: string
}

export type LandingBenefitItem = {
  title: string
  description: string
}

export type LandingHeroContent = {
  title: string
  description: string
  primaryCta: LandingLink
  secondaryCta: LandingLink
  quickLinks: LandingLink[]
}

export type FeaturedJobsRules = {
  sort: "newest" | "oldest" | "relevance" | "company"
  limit: number
  category: string | null
  source: string | null
}

export type LandingFeaturedJobsContent = {
  title: string
  description: string
  emptyState: string
  rules: FeaturedJobsRules
}

export type LandingBenefitsContent = {
  title: string
  items: LandingBenefitItem[]
}

export type LandingTrustedCompaniesContent = {
  title: string
  items: LandingCompanyItem[]
}

export type LandingCtaContent = {
  title: string
  body: string
  primaryButton: LandingLink
  secondaryButton: LandingLink
}

export type LandingPageContent = {
  hero: LandingHeroContent
  featuredJobs: LandingFeaturedJobsContent
  benefits: LandingBenefitsContent
  trustedCompanies: LandingTrustedCompaniesContent
  cta: LandingCtaContent
}

export type LandingContentStatus = "empty" | "draft" | "published"

export type AdminLandingPageContentRecord = {
  id: string
  key: string
  status: LandingContentStatus
  hasDraft: boolean
  draftPayload: LandingPageContent | null
  publishedPayload: LandingPageContent | null
  updatedAt: string | null
  publishedAt: string | null
}

export type AdminDashboardQueueItem = {
  id: string
  title: string
  companyName: string | null
  status: string
  updatedAt: string | null
  href: string
}

export type AdminDashboardActivityItem = {
  id: string
  kind: "job" | "content"
  title: string
  description: string
  status: string
  updatedAt: string | null
  href: string
}

export type AdminDashboardSummary = {
  statusCounts: {
    total: number
    raw: number
    draft: number
    published: number
    attention: number
    rejected: number
    duplicate: number
  }
  catalog: {
    totalCategories: number
    totalSources: number
  }
  priorityQueues: {
    needsReview: AdminDashboardQueueItem[]
    readyToPublish: AdminDashboardQueueItem[]
    landingContentDrafts: AdminDashboardQueueItem[]
  }
  content: {
    status: LandingContentStatus
    hasDraft: boolean
    updatedAt: string | null
    publishedAt: string | null
  }
  recentActivity: AdminDashboardActivityItem[]
}
