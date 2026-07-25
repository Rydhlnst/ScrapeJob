import { fetchJson } from "@/lib/api/client"

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export type BulkCleanDispatched = {
  batch_id: string
  total: number
}

export async function bulkCleanScrapedJobsWithAi(ids: string[]): Promise<BulkCleanDispatched> {
  const response = await fetchJson<ApiEnvelope<BulkCleanDispatched>>(
    "/api/admin/scraped-jobs/bulk-clean-ai",
    {
      method: "POST",
      body: JSON.stringify({ ids }),
    },
  )
  return response.data
}

export type BulkCleanStatus = {
  batch_id: string
  name: string
  total: number
  pending: number
  processed: number
  failed: number
  progress: number
  finished_at: string | null
  cancelled: boolean
}

export async function getBulkCleanStatus(batchId: string): Promise<BulkCleanStatus> {
  const response = await fetchJson<ApiEnvelope<BulkCleanStatus>>(
    `/api/admin/scraped-jobs/bulk-clean-ai/${encodeURIComponent(batchId)}/status`,
  )
  return response.data
}
