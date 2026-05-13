import { mockJobs } from "@/data/mock-jobs"
import type { Job, Paginated } from "@/types"
import { fetchJson, USE_MOCK } from "./client"

export type JobsQuery = {
  keyword?: string
  location?: string
  category?: string
  jobType?: string
  source?: string
  page?: number
  perPage?: number
  sort?: "newest" | "relevance" | "company"
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

export async function listJobs(query: JobsQuery = {}): Promise<Paginated<Job>> {
  if (!USE_MOCK) {
    const params = new URLSearchParams()
    if (query.keyword) params.set("keyword", query.keyword)
    if (query.location) params.set("location", query.location)
    if (query.category) params.set("category", query.category)
    if (query.jobType) params.set("jobType", query.jobType)
    if (query.page) params.set("page", String(query.page))
    if (query.sort) params.set("sort", query.sort)
    return fetchJson<Paginated<Job>>(`/api/jobs?${params.toString()}`)
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
    return fetchJson<Job>(`/api/jobs/${encodeURIComponent(slug)}`)
  }
  return mockJobs.find((j) => j.slug === slug) ?? null
}

export async function getAdminJobById(id: string): Promise<Job | null> {
  if (!USE_MOCK) {
    return fetchJson<Job>(`/api/admin/jobs/${encodeURIComponent(id)}`)
  }
  return mockJobs.find((j) => j.id === id) ?? null
}

