import { z } from "zod"

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

export type LandingCopyLink = {
  label: string
  href: string
}

export type LandingSectionCopy = {
  visuals: {
    boardTitle: string
    boardEyebrow: string
    boardLinkLabel: string
    cardStatusLabel: string
    cardDetailLabel: string
    sideTitle: string
    sideDescription: string
    sideActionLabel: string
    quizTitle: string
    freshTitle: string
  }
  hero: {
    eyebrow: string
    searchPlaceholder: string
    searchLabel: string
    statLabel: string
    statTitle: string
    statDescription: string
    floatingTitle: string
    floatingDescription: string
  }
  features: {
    eyebrow: string
    actionLabel: string
    searchPlaceholder: string
    searchLabel: string
    savedTitle: string
    savedDescription: string
    sourceLabel: string
  }
  how: {
    eyebrow: string
    title: string
    description: string
    steps: Array<{ title: string; description: string; linkLabel: string }>
  }
  categories: { eyebrow: string; title: string; description: string; buttonLabel: string }
  featured: { eyebrow: string; buttonLabel: string }
  cta: { eyebrow: string; prompt: string; response: string; cardTitle: string }
  testimonials: {
    eyebrow: string
    title: string
    description: string
    featuredRole: string
    items: Array<{ name: string; quote: string }>
  }
  faq: {
    eyebrow: string
    title: string
    description: string
    contactLabel: string
    items: Array<{ question: string; answer: string }>
  }
  footer: {
    eyebrow: string
    title: string
    description: string
    columns: Array<{ title: string; links: LandingCopyLink[] }>
  }
}

export type LandingPageContent = {
  hero: LandingHeroContent
  featuredJobs: LandingFeaturedJobsContent
  benefits: LandingBenefitsContent
  trustedCompanies: LandingTrustedCompaniesContent
  cta: LandingCtaContent
  sections: LandingSectionCopy
}

const landingLinkSchema = z.object({
  label: z.string().trim().min(1),
  href: z.string().trim().min(1),
})

const landingSectionCopySchema = z.object({
  visuals: z.object({
    boardTitle: z.string().trim().min(1),
    boardEyebrow: z.string().trim().min(1),
    boardLinkLabel: z.string().trim().min(1),
    cardStatusLabel: z.string().trim().min(1),
    cardDetailLabel: z.string().trim().min(1),
    sideTitle: z.string().trim().min(1),
    sideDescription: z.string().trim().min(1),
    sideActionLabel: z.string().trim().min(1),
    quizTitle: z.string().trim().min(1),
    freshTitle: z.string().trim().min(1),
  }),
  hero: z.object({
    eyebrow: z.string().trim().min(1),
    searchPlaceholder: z.string().trim().min(1),
    searchLabel: z.string().trim().min(1),
    statLabel: z.string().trim().min(1),
    statTitle: z.string().trim().min(1),
    statDescription: z.string().trim().min(1),
    floatingTitle: z.string().trim().min(1),
    floatingDescription: z.string().trim().min(1),
  }),
  features: z.object({
    eyebrow: z.string().trim().min(1),
    actionLabel: z.string().trim().min(1),
    searchPlaceholder: z.string().trim().min(1),
    searchLabel: z.string().trim().min(1),
    savedTitle: z.string().trim().min(1),
    savedDescription: z.string().trim().min(1),
    sourceLabel: z.string().trim().min(1),
  }),
  how: z.object({
    eyebrow: z.string().trim().min(1),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    steps: z.array(z.object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      linkLabel: z.string().trim().min(1),
    })).min(1),
  }),
  categories: z.object({
    eyebrow: z.string().trim().min(1),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    buttonLabel: z.string().trim().min(1),
  }),
  featured: z.object({
    eyebrow: z.string().trim().min(1),
    buttonLabel: z.string().trim().min(1),
  }),
  cta: z.object({
    eyebrow: z.string().trim().min(1),
    prompt: z.string().trim().min(1),
    response: z.string().trim().min(1),
    cardTitle: z.string().trim().min(1),
  }),
  testimonials: z.object({
    eyebrow: z.string().trim().min(1),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    featuredRole: z.string().trim().min(1),
    items: z.array(z.object({
      name: z.string().trim().min(1),
      quote: z.string().trim().min(1),
    })).min(1),
  }),
  faq: z.object({
    eyebrow: z.string().trim().min(1),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    contactLabel: z.string().trim().min(1),
    items: z.array(z.object({
      question: z.string().trim().min(1),
      answer: z.string().trim().min(1),
    })).min(1),
  }),
  footer: z.object({
    eyebrow: z.string().trim().min(1),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    columns: z.array(z.object({
      title: z.string().trim().min(1),
      links: z.array(landingLinkSchema),
    })).min(1),
  }),
})

export const landingPageContentSchema = z.object({
  hero: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    primaryCta: landingLinkSchema,
    secondaryCta: landingLinkSchema,
    quickLinks: z.array(landingLinkSchema),
  }),
  featuredJobs: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    emptyState: z.string().trim().min(1),
    rules: z.object({
      sort: z.enum(["newest", "oldest", "relevance", "company"]),
      limit: z.number().int().min(1).max(12),
      category: z.string().nullable(),
      source: z.string().nullable(),
    }),
  }),
  benefits: z.object({
    title: z.string().trim().min(1),
    items: z.array(z.object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
    })).min(1),
  }),
  trustedCompanies: z.object({
    title: z.string().trim().min(1),
    items: z.array(z.object({
      id: z.string().trim().min(1),
      name: z.string().trim().min(1),
      url: z.string().trim().min(1),
      brandColor: z.string().trim().min(1),
    })).min(1),
  }),
  cta: z.object({
    title: z.string().trim().min(1),
    body: z.string().trim().min(1),
    primaryButton: landingLinkSchema,
    secondaryButton: landingLinkSchema,
  }),
  sections: landingSectionCopySchema,
})

export const landingPageSectionsSchema = landingSectionCopySchema

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
