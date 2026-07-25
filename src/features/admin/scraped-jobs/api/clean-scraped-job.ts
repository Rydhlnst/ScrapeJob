import { fetchJson } from "@/lib/api/client"

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export type CleanQueued = {
  scraped_job_id: string
  status: "queued"
}

// Backend now queues the AI job and returns 202 with `{scraped_job_id, status}`.
// Callers must poll the row until draft_status transitions.
export async function cleanScrapedJobWithAi(id: string): Promise<CleanQueued> {
  const response = await fetchJson<ApiEnvelope<CleanQueued>>(
    `/api/admin/scraped-jobs/${encodeURIComponent(id)}/clean-ai`,
    { method: "POST" },
  )
  return response.data
}
