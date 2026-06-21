import { fetchJson } from "@/lib/api/client"

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export type BulkPublishResult = {
  success_count: number
  duplicate_count: number
}

export async function bulkPublishScrapedJobs(ids: string[]) {
  const response = await fetchJson<ApiEnvelope<BulkPublishResult>>(
    "/api/admin/scraped-jobs/bulk-publish",
    {
      method: "POST",
      body: JSON.stringify({ ids }),
    },
  )
  return response.data
}
