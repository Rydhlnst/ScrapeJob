export type JobStatus = "raw" | "draft" | "published" | "rejected" | "duplicate"

export type Job = {
  id: string
  slug: string
  title: string
  companyName: string
  companyLogo?: string | null
  location: string
  categoryId?: string | null
  category?: string | null
  jobType?: string | null
  salaryText?: string | null
  description: string
  descriptionDoc?: Record<string, unknown> | null
  rawDescription?: string | null
  sourceUrl: string
  sourceName: string
  contentHash?: string
  status: JobStatus
  scrapedAt?: string
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  requirements?: string[]
  skills?: string[]
  benefits?: string[]
}

export type Category = {
  id: string
  name: string
  slug: string
  description?: string | null
  totalJobs?: number
}

export type ScrapeRunStatus = "running" | "success" | "failed" | "partial"

export type ScrapeRun = {
  id: string
  sourceName: string
  status: ScrapeRunStatus
  startedAt: string
  finishedAt?: string | null
  totalFound: number
  successCount: number
  duplicateCount: number
  failedCount: number
  skippedCount: number
}

export type ScrapeLogStatus = "success" | "failed" | "duplicate" | "skipped"

export type ScrapeLog = {
  id: string
  scrapeRunId: string
  url: string
  title?: string | null
  status: ScrapeLogStatus
  message?: string | null
  createdAt: string
}

export type Paginated<T> = {
  data: T[]
  page: number
  perPage: number
  total: number
  totalPages: number
}

export type JobStats = {
  totalActive: number
  totalBySource: Record<string, number>
  totalByCategory?: Record<string, number>
  totalByJobType?: Record<string, number>
  newToday: number
  remoteJobs: number
}

export type {
  AdminDashboardActivityItem,
  AdminDashboardQueueItem,
  AdminDashboardSummary,
  AdminLandingPageContentRecord,
  FeaturedJobsRules,
  LandingBenefitItem,
  LandingBenefitsContent,
  LandingCompanyItem,
  LandingContentStatus,
  LandingCtaContent,
  LandingFeaturedJobsContent,
  LandingHeroContent,
  LandingLink,
  LandingPageContent,
  LandingTrustedCompaniesContent,
} from "./landing-content"

export type {
  Job as PipelineJob,
  ScrapedJob as PipelineScrapedJob,
  ScrapedJobStatus,
} from "./job"
