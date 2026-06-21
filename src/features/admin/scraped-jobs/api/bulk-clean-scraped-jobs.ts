import { fetchJson } from "@/lib/api/client"

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export async function bulkCleanScrapedJobsWithAi(ids: string[]) {
  const response = await fetchJson<ApiEnvelope<null>>(
    "/api/admin/scraped-jobs/bulk-clean-ai",
    {
      method: "POST",
      body: JSON.stringify({ ids }),
    },
  )
  return response.data
}
