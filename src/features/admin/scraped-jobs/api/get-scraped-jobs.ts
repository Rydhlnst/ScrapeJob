import { fetchJson } from "@/lib/api/client"
import type { ScrapedJob } from "@/types/job"

type ApiEnvelope<T> = {
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

export async function getScrapedJobs(
  status: ScrapedJob["status"] = "pending",
  page = 1,
  perPage = 15,
  keyword?: string,
  source?: string,
) {
  const query = new URLSearchParams()
  query.set("status", status)
  query.set("page", String(page))
  query.set("perPage", String(perPage))
  if (keyword && keyword.trim() !== "") {
    query.set("keyword", keyword.trim())
  }
  if (source && source.trim() !== "" && source.trim().toLowerCase() !== "all") {
    query.set("source", source.trim())
  }
  const response = await fetchJson<ApiEnvelope<ScrapedJob[]>>(
    `/api/admin/scraped-jobs?${query.toString()}`,
  )
  return {
    data: response.data,
    page: response.meta?.currentPage ?? page,
    perPage: response.meta?.perPage ?? perPage,
    total: response.meta?.total ?? response.data.length,
    totalPages: response.meta?.lastPage ?? 1,
  }
}
