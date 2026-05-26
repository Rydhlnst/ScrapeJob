import { mockJobs } from "@/data/mock-jobs"
import type { Job, Paginated } from "@/types"
import type { Job as PublicPipelineJob, ScrapedJob } from "@/types/job"
import { ApiEnvelope, fetchJson, USE_MOCK } from "./client"

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

function includesLoose(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

function sortJobs(jobs: Job[], sort: JobsQuery["sort"]) {
  if (sort === "company") {
    return [...jobs].sort((a, b) => a.companyName.localeCompare(b.companyName))
  }
  // relevance: naive keyword weight, fallback to newest
  if (sort === "relevance") return [...jobs]
  return [...jobs].sort((a, b) => (b.scrapedAt ?? "").localeCompare(a.scrapedAt ?? ""))
}

type ApiJob = Omit<Job, "category" | "categoryId" | "status" | "updatedAt"> & {
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
    status: job.status ?? fallbackStatus,
    category: categoryValue,
    categoryId: job.categoryId ?? categoryIdValue,
    updatedAt: job.updatedAt ?? job.createdAt,
  }
}

export async function listJobs(query: JobsQuery = {}): Promise<Paginated<Job>> {
  if (!USE_MOCK) {
    const params = new URLSearchParams()
    if (query.keyword) params.set("keyword", query.keyword)
    if (query.location) params.set("location", query.location)
    if (query.category) params.set("category", query.category)
    if (query.jobType) params.set("job_type", query.jobType)
    if (query.workArrangement) params.set("work_arrangement", query.workArrangement)
    if (query.source) params.set("source", query.source)
    if (query.page) params.set("page", String(query.page))
    if (query.perPage) params.set("limit", String(query.perPage))
    if (query.sort === "newest" || query.sort === "oldest") {
      params.set("sort", query.sort)
    }

    const response = await fetchJson<ApiEnvelope<ApiJob[]>>(
      `/api/jobs?${params.toString()}`,
    )

    const normalized = response.data.map((job) =>
      normalizeJob(job, "published"),
    )

    return {
      data: normalized,
      page: response.meta?.currentPage ?? 1,
      perPage: response.meta?.perPage ?? normalized.length,
      total: response.meta?.total ?? normalized.length,
      totalPages: response.meta?.lastPage ?? 1,
    }
  }

  const page = query.page ?? 1
  const perPage = query.perPage ?? 10

  let jobs = [...mockJobs]
  if (!query.admin) jobs = jobs.filter((j) => j.status === "published")
  if (query.status) jobs = jobs.filter((j) => j.status === query.status)
  if (query.keyword) {
    jobs = jobs.filter(
      (j) =>
        includesLoose(j.title, query.keyword!) ||
        includesLoose(j.companyName, query.keyword!) ||
        (j.category ? includesLoose(j.category, query.keyword!) : false),
    )
  }
  if (query.location) {
    jobs = jobs.filter((j) => includesLoose(j.location, query.location!))
  }
  if (query.category) {
    jobs = jobs.filter((j) => includesLoose(j.category ?? "", query.category!))
  }
  if (query.jobType) {
    jobs = jobs.filter((j) => includesLoose(j.jobType ?? "", query.jobType!))
  }
  if (query.source) {
    jobs = jobs.filter((j) => includesLoose(j.sourceName, query.source!))
  }

  jobs = sortJobs(jobs, query.sort)

  const total = jobs.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const clampedPage = Math.min(Math.max(1, page), totalPages)
  const start = (clampedPage - 1) * perPage
  const data = jobs.slice(start, start + perPage)

  return { data, page: clampedPage, perPage, total, totalPages }
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  if (!USE_MOCK) {
    const response = await fetchJson<ApiEnvelope<ApiJob>>(
      `/api/jobs/${encodeURIComponent(slug)}`,
    )
    return normalizeJob(response.data, "published")
  }
  return mockJobs.find((j) => j.slug === slug) ?? null
}

export async function getAdminJobById(id: string): Promise<Job | null> {
  if (!USE_MOCK) {
    const response = await fetchJson<ApiEnvelope<ApiJob>>(
      `/api/admin/jobs/${encodeURIComponent(id)}`,
    )
    return normalizeJob(response.data, response.data.status ?? "draft")
  }
  return mockJobs.find((j) => j.id === id) ?? null
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

export async function getPublicJobs(): Promise<PublicPipelineJob[]> {
  if (JOB_DATA_MODE === "json") {
    const raw = (await import("@/src/data/jobs.json")).default as ScraperJsonFile
    return mapScrapedJsonToPublicJobs(raw)
  }

  const response = await fetchJson<PipelineEnvelope<PublicPipelineJob[]>>("/api/jobs")
  return response.data
}

export async function getPublicJobDetail(slug: string): Promise<PublicPipelineJob | null> {
  if (JOB_DATA_MODE === "json") {
    const jobs = await getPublicJobs()
    return jobs.find((item) => item.slug === slug || item.id === slug) ?? null
  }

  const response = await fetchJson<PipelineEnvelope<PublicPipelineJob>>(
    `/api/jobs/${encodeURIComponent(slug)}`,
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
