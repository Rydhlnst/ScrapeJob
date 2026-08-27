import type { Job, JobStats, Paginated } from "@/types"
import type { Job as PublicPipelineJob, ScrapedJob } from "@/types/job"
import { ApiEnvelope, fetchJson, USE_MOCK, type ApiRequestContext } from "./client"

export type JobsQuery = {
  keyword?: string
  location?: string
  category?: string
  jobType?: string
  workArrangement?: string
  source?: string
  page?: number
  perPage?: number
  sort?: "newest" | "oldest" | "relevance" | "company"
  admin?: boolean
  status?: string
}

type JobStatsResponse = {
  totalActive: number
  totalBySource: Record<string, number>
  totalByCategory?: Record<string, number>
  totalByJobType?: Record<string, number>
  newToday: number
  remoteJobs: number
}

type ApiJob = Omit<Job, "category" | "categoryId" | "status" | "updatedAt"> & {
  description?: string | null
  descriptionDoc?: Record<string, unknown> | null
  companyName?: string | null
  companyLogo?: string | null
  company_logo?: string | null
  company_logo_url?: string | null
  location?: string | null
  salaryText?: string | null
  sourceName?: string | null
  sourceUrl?: string | null
  applyUrl?: string | null
  publishedAt?: string | null
  createdAt?: string | null
  category?: { id?: string; name?: string } | string | null
  categoryId?: string | null
  status?: Job["status"]
  updatedAt?: string
}

function normalizeJob(job: ApiJob, fallbackStatus: Job["status"]): Job {
  const categoryValue =
    typeof job.category === "string"
      ? job.category
      : job.category?.name ?? null

  const categoryIdValue =
    typeof job.category === "string" ? null : job.category?.id ?? null

  return {
    ...job,
    companyName: job.companyName ?? "Company undisclosed",
    companyLogo: job.companyLogo ?? job.company_logo_url ?? job.company_logo ?? null,
    location: job.location ?? "Tidak disebutkan",
    salaryText: job.salaryText ?? null,
    description: typeof job.description === "string" ? job.description : "",
    descriptionDoc: job.descriptionDoc ?? null,
    sourceName: job.sourceName ?? "Source unavailable",
    sourceUrl: job.sourceUrl ?? "",
    applyUrl: job.applyUrl ?? job.sourceUrl ?? "",
    publishedAt: job.publishedAt ?? null,
    createdAt: job.createdAt ?? new Date(0).toISOString(),
    status: job.status ?? fallbackStatus,
    category: categoryValue,
    categoryId: job.categoryId ?? categoryIdValue,
    updatedAt: job.updatedAt ?? job.createdAt,
  }
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function buildFallbackJobFromSlug(slug: string): Job {
  const parts = slug.split("-").filter(Boolean)
  const title = titleCase(parts.slice(0, 3).join(" ")) || "Job detail"
  const companyName =
    titleCase(parts.slice(3, Math.max(4, parts.length - 2)).join(" ")) ||
    "Company undisclosed"
  const location =
    titleCase(parts.slice(-2).join(" ")) || "Tidak disebutkan"
  const now = new Date().toISOString()

  return {
    id: slug,
    slug,
    title,
    companyName,
    location,
    category: null,
    categoryId: null,
    jobType: null,
    salaryText: null,
    description: "",
    rawDescription: null,
    sourceUrl: "",
    sourceName: "Source unavailable",
    status: "published",
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  }
}

async function getJobFallbackBySlug(slug: string, context?: ApiRequestContext): Promise<Job> {
  try {
    const jobs = await listJobs({ page: 1, perPage: 200, sort: "newest" }, context)
    const matched = jobs.data.find((item) => item.slug === slug)
    if (matched) {
      return {
        ...matched,
        description: matched.description ?? "",
        sourceUrl: matched.sourceUrl ?? "",
      }
    }
  } catch {
    // Fall through to slug-based fallback.
  }

  return buildFallbackJobFromSlug(slug)
}

export async function listJobs(query: JobsQuery = {}, context?: ApiRequestContext): Promise<Paginated<Job>> {
  if (USE_MOCK) {
    throw new Error("Mock jobs are disabled for this environment.")
  }

  const params = new URLSearchParams()
  if (query.keyword) params.set("keyword", query.keyword)
  if (query.location) params.set("location", query.location)
  if (query.category) params.set("category", query.category)
  if (query.jobType) params.set(query.admin ? "jobType" : "job_type", query.jobType)
  if (query.workArrangement) params.set("work_arrangement", query.workArrangement)
  if (query.source) params.set("source", query.source)
  if (query.page) params.set("page", String(query.page))
  if (query.perPage) params.set(query.admin ? "perPage" : "limit", String(query.perPage))
  if (query.sort) params.set("sort", query.sort)
  if (query.status) params.set("status", query.status)

  const endpoint = query.admin ? "/api/admin/jobs" : "/api/jobs"
  const response = await fetchJson<ApiEnvelope<ApiJob[]>>(`${endpoint}?${params.toString()}`, undefined, context)

  const normalized = response.data.map((job) =>
    normalizeJob(job, query.admin ? (job.status ?? "draft") : "published"),
  )

  return {
    data: normalized,
    page: response.meta?.currentPage ?? 1,
    perPage: response.meta?.perPage ?? normalized.length,
    total: response.meta?.total ?? normalized.length,
    totalPages: response.meta?.lastPage ?? 1,
  }
}

export async function getJobBySlug(slug: string, context?: ApiRequestContext): Promise<Job | null> {
  if (USE_MOCK) {
    throw new Error("Mock jobs are disabled for this environment.")
  }

  try {
    const response = await fetchJson<ApiEnvelope<ApiJob>>(
      `/api/jobs/${encodeURIComponent(slug)}`, undefined, context,
    )
    return normalizeJob(response.data, "published")
  } catch (error) {
    const status = (error as { status?: number } | undefined)?.status

    if (status === 404 || status === 422) {
      return null
    }

    if (status === 500) {
      return getJobFallbackBySlug(slug, context)
    }

    return getJobFallbackBySlug(slug, context)
  }
}

export async function getAdminJobById(id: string): Promise<Job | null> {
  if (USE_MOCK) {
    throw new Error("Mock jobs are disabled for this environment.")
  }

  const response = await fetchJson<ApiEnvelope<ApiJob>>(
    `/api/admin/jobs/${encodeURIComponent(id)}`,
  )
  return normalizeJob(response.data, response.data.status ?? "draft")
}

type PipelineEnvelope<T> = {
  success: boolean
  message: string
  data: T
  meta?: {
    currentPage?: number
    perPage?: number
    total?: number
    lastPage?: number
  }
}

type ScraperJsonFile = {
  meta: {
    source: string
    scraped_at: string
    total: number
  }
  data: Array<{
    external_id: string
    source: string
    source_url: string
    role_keyword: string
    title: string
    company: string
    location: string | null
    salary: string | null
    employment_type: string | null
    description: string | null
    description_summary: string | null
    posted_date: string | null
    scraped_at: string
    status: "pending" | "approved" | "rejected" | "duplicate" | "published"
  }>
}

const JOB_DATA_MODE = (process.env.NEXT_PUBLIC_JOB_DATA_MODE ?? "api").toLowerCase()

function mapScrapedJsonToPublicJobs(raw: ScraperJsonFile): PublicPipelineJob[] {
  return raw.data
    .filter((item) => item.status === "published" || item.status === "approved")
    .map((item) => ({
      id: item.external_id,
      slug: item.external_id,
      title: item.title,
      company: item.company,
      location: item.location,
      salary: item.salary,
      employmentType: item.employment_type,
      descriptionSummary: item.description_summary,
      source: item.source,
      sourceUrl: item.source_url,
      postedDate: item.posted_date,
      publishedAt: item.scraped_at,
    }))
}

function mapJsonToScrapedJobs(raw: ScraperJsonFile): ScrapedJob[] {
  return raw.data.map((item) => ({
    id: item.external_id,
    externalId: item.external_id,
    source: item.source,
    sourceUrl: item.source_url,
    roleKeyword: item.role_keyword,
    title: item.title,
    company: item.company,
    location: item.location,
    salary: item.salary,
    employmentType: item.employment_type,
    description: item.description,
    descriptionSummary: item.description_summary,
    postedDate: item.posted_date,
    scrapedAt: item.scraped_at,
    status: item.status,
  }))
}

export async function getPublicJobs(context?: ApiRequestContext): Promise<PublicPipelineJob[]> {
  if (JOB_DATA_MODE === "json") {
    const raw = (await import("@/src/data/jobs.json")).default as ScraperJsonFile
    return mapScrapedJsonToPublicJobs(raw)
  }

  const response = await fetchJson<PipelineEnvelope<PublicPipelineJob[]>>("/api/jobs", undefined, context)
  return response.data
}

export async function getPublicJobDetail(slug: string, context?: ApiRequestContext): Promise<PublicPipelineJob | null> {
  if (JOB_DATA_MODE === "json") {
    const jobs = await getPublicJobs(context)
    return jobs.find((item) => item.slug === slug || item.id === slug) ?? null
  }

  const response = await fetchJson<PipelineEnvelope<PublicPipelineJob>>(
    `/api/jobs/${encodeURIComponent(slug)}`, undefined, context,
  )
  return response.data
}

export async function getAdminScrapedJobs(
  status: ScrapedJob["status"] = "pending",
): Promise<ScrapedJob[]> {
  if (JOB_DATA_MODE === "json") {
    const raw = (await import("@/src/data/jobs.json")).default as ScraperJsonFile
    return mapJsonToScrapedJobs(raw).filter((item) => item.status === status)
  }

  const query = new URLSearchParams({ status }).toString()
  const response = await fetchJson<PipelineEnvelope<ScrapedJob[]>>(
    `/api/admin/scraped-jobs?${query}`,
  )
  return response.data
}

export async function getJobStats(context?: ApiRequestContext): Promise<JobStats> {
  if (USE_MOCK) {
    throw new Error("Mock jobs are disabled for this environment.")
  }

  const response = await fetchJson<ApiEnvelope<JobStatsResponse>>("/api/jobs/stats", undefined, context)
  return response.data
}
