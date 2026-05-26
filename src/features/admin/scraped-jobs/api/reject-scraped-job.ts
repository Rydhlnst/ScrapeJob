import { fetchJson } from "@/lib/api/client"
import type { ScrapedJob } from "@/types/job"

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export async function rejectScrapedJob(id: string) {
  const response = await fetchJson<ApiEnvelope<ScrapedJob>>(
    `/api/admin/scraped-jobs/${encodeURIComponent(id)}/reject`,
    { method: "PATCH" },
  )
  return response.data
}
