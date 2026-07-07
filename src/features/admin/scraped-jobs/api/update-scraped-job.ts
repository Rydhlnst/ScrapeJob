import { fetchJson } from "@/lib/api/client"
import type { ScrapedJob } from "@/types/job"

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export type UpdateScrapedJobPayload = {
  title?: string
  company?: string
  location?: string | null
  salary?: string | null
  employment_type?: string | null
  description?: string | null
  description_summary?: string | null
}

export async function updateScrapedJob(id: string, payload: UpdateScrapedJobPayload): Promise<ScrapedJob> {
  const response = await fetchJson<ApiEnvelope<ScrapedJob>>(
    `/api/admin/scraped-jobs/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  )
  return response.data
}
