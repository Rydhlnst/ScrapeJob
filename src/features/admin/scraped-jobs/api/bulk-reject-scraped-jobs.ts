import { fetchJson } from "@/lib/api/client"

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export async function bulkRejectScrapedJobs(ids: string[]) {
  const response = await fetchJson<ApiEnvelope<null>>(
    "/api/admin/scraped-jobs/bulk-reject",
    {
      method: "POST",
      body: JSON.stringify({ ids }),
    },
  )
  return response.data
}
