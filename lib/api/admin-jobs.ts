import type { Job } from "@/types"

import { ApiEnvelope, fetchJson } from "./client"

export type AdminJobRecord = Job & {
  requirements?: string[]
  responsibilities?: string[]
  skills?: string[]
  benefits?: string[]
  unified?: Record<string, unknown> | null
}

export type AdminWebsiteJobContent = {
  id?: string
  title?: string | null
  slug?: string | null
  description?: string | null
  salaryText?: string | null
  applyUrl?: string | null
  categoryId?: string | null
  tags?: string[] | null
  seoTitle?: string | null
  seoDescription?: string | null
}

type ApiJob = Omit<AdminJobRecord, "category" | "categoryId"> & {
  category?: { id?: string; name?: string } | string | null
  categoryId?: string | null
}

function normalizeAdminJob(job: ApiJob): AdminJobRecord {
  const categoryValue = typeof job.category === "string" ? job.category : job.category?.name ?? null
  const categoryIdValue = typeof job.category === "string" ? null : job.category?.id ?? null

  return {
    ...job,
    category: categoryValue,
    categoryId: job.categoryId ?? categoryIdValue,
    requirements: job.requirements ?? [],
    responsibilities: job.responsibilities ?? [],
    skills: job.skills ?? [],
    benefits: job.benefits ?? [],
    unified: job.unified ?? null,
  }
}

export async function getAdminJobByIdExtended(id: string): Promise<AdminJobRecord> {
  const response = await fetchJson<ApiEnvelope<ApiJob>>(`/api/admin/jobs/${encodeURIComponent(id)}`)
  return normalizeAdminJob(response.data)
}

export async function getAdminJobSiteContent(id: string): Promise<AdminWebsiteJobContent | null> {
  const response = await fetchJson<ApiEnvelope<{ content: AdminWebsiteJobContent | null }>>(
    "/api/admin/jobs/" + encodeURIComponent(id) + "/site-content",
  )
  return response.data.content
}

export async function updateAdminJobSiteContent(
  id: string,
  payload: Partial<{
    title: string | null
    slug: string | null
    description: string | null
    salary_text: string | null
    apply_url: string | null
    category_id: string | null
    tags: string[]
    seo_title: string | null
    seo_description: string | null
  }>,
): Promise<AdminWebsiteJobContent | null> {
  const response = await fetchJson<ApiEnvelope<{ content: AdminWebsiteJobContent | null }>>(
    "/api/admin/jobs/" + encodeURIComponent(id) + "/site-content",
    { method: "PUT", body: JSON.stringify(payload) },
  )
  return response.data.content
}

export async function updateAdminJob(
  id: string,
  payload: Partial<{
    title: string
    company_name: string
    company_logo_url: string | null
    location: string
    job_type: string
    salary_text: string
    description: string
    description_doc: unknown
    source_name: string
    source_url: string
    requirements: string[]
    responsibilities: string[]
    skills: string[]
    benefits: string[]
    unified_payload: Record<string, unknown>
    status: Job["status"]
  }>,
): Promise<AdminJobRecord> {
  const response = await fetchJson<ApiEnvelope<ApiJob>>(`/api/admin/jobs/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  return normalizeAdminJob(response.data)
}

export async function publishAdminJob(id: string): Promise<AdminJobRecord> {
  const response = await fetchJson<ApiEnvelope<ApiJob>>(`/api/admin/jobs/${encodeURIComponent(id)}/publish`, {
    method: "PATCH",
    body: JSON.stringify({}),
  })

  return normalizeAdminJob(response.data)
}

export async function unpublishAdminJob(id: string): Promise<AdminJobRecord> {
  const response = await fetchJson<ApiEnvelope<ApiJob>>(`/api/admin/jobs/${encodeURIComponent(id)}/unpublish`, {
    method: "PATCH",
    body: JSON.stringify({}),
  })

  return normalizeAdminJob(response.data)
}

export async function rejectAdminJob(id: string): Promise<AdminJobRecord> {
  const response = await fetchJson<ApiEnvelope<ApiJob>>(`/api/admin/jobs/${encodeURIComponent(id)}/reject`, {
    method: "PATCH",
    body: JSON.stringify({}),
  })

  return normalizeAdminJob(response.data)
}

export async function deleteAdminJob(id: string): Promise<void> {
  await fetchJson<ApiEnvelope<null>>(`/api/admin/jobs/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}
