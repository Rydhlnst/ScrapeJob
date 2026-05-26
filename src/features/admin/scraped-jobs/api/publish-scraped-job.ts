import { fetchJson } from "@/lib/api/client"
import type { Job } from "@/types"

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export async function publishScrapedJob(id: string) {
  const response = await fetchJson<ApiEnvelope<Job>>(
    `/api/admin/scraped-jobs/${encodeURIComponent(id)}/publish`,
    { method: "POST" },
  )
  return response.data
}

