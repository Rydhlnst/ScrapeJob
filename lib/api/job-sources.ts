import { ApiEnvelope, fetchJson } from "./client"

export type JobSource = {
  id: string
  name: string
  baseUrl: string
  listingUrl: string | null
  isActive: boolean
  scrapingAllowed: boolean
  notes: string | null
  lastScrapedAt: string | null
  createdAt: string | null
}

export type JobSourceInput = {
  name: string
  base_url: string
  listing_url?: string | null
  is_active?: boolean
  scraping_allowed?: boolean
  notes?: string | null
}

export async function listAdminJobSources(): Promise<JobSource[]> {
  const response = await fetchJson<ApiEnvelope<JobSource[]>>("/api/admin/job-sources")
  return response.data
}

export async function createAdminJobSource(payload: JobSourceInput): Promise<JobSource> {
  const response = await fetchJson<ApiEnvelope<JobSource>>("/api/admin/job-sources", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateAdminJobSource(id: string, payload: Partial<JobSourceInput>): Promise<JobSource> {
  const response = await fetchJson<ApiEnvelope<JobSource>>(
    `/api/admin/job-sources/${encodeURIComponent(id)}`,
    { method: "PUT", body: JSON.stringify(payload) },
  )
  return response.data
}

export async function deleteAdminJobSource(id: string): Promise<void> {
  await fetchJson<ApiEnvelope<null>>(
    `/api/admin/job-sources/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  )
}
