import { fetchJson } from "@/lib/api/client"

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export async function bulkApproveScrapedJobs(ids: string[]) {
  const response = await fetchJson<ApiEnvelope<{ success_count: number; duplicate_count: number }>>(
    "/api/admin/scraped-jobs/bulk-approve",
    {
      method: "POST",
      body: JSON.stringify({ ids }),
    },
  )
  return response.data
}
