import { fetchJson } from "@/lib/api/client"
import type { Job } from "@/types"

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export async function approveScrapedJob(id: string) {
  const response = await fetchJson<ApiEnvelope<Job>>(
    `/api/admin/scraped-jobs/${encodeURIComponent(id)}/approve`,
    { method: "PATCH" },
  )
  return response.data
}
