import { fetchJson, type ApiEnvelope } from "@/lib/api/client"
import type { Website, WebsiteJobAssignment, WebsiteJobStatus } from "@/types/website"

export async function listWebsites(): Promise<Website[]> {
  const response = await fetchJson<ApiEnvelope<Website[]>>("/api/admin/websites")
  return response.data
}

export async function createWebsite(input: Pick<Website, "name" | "domain"> & Partial<Website>): Promise<Website> {
  const response = await fetchJson<ApiEnvelope<Website>>("/api/admin/websites", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      domain: input.domain,
      is_active: input.isActive ?? true,
      theme: input.theme ?? null,
      logo: input.logo ?? null,
      settings: input.settings ?? null,
    }),
  })
  return response.data
}

export async function updateWebsite(id: string, input: Partial<Website>): Promise<Website> {
  const response = await fetchJson<ApiEnvelope<Website>>(`/api/admin/websites/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({
      ...input,
      is_active: input.isActive,
    }),
  })
  return response.data
}

export async function getScrapedJobAssignments(id: string): Promise<WebsiteJobAssignment[]> {
  const response = await fetchJson<ApiEnvelope<{ assignments: WebsiteJobAssignment[] }>>(
    `/api/admin/scraped-jobs/${encodeURIComponent(id)}/websites`,
  )
  return response.data.assignments
}

export async function saveScrapedJobAssignments(
  id: string,
  assignments: Array<{ website_id: string; status: WebsiteJobStatus }>,
): Promise<WebsiteJobAssignment[]> {
  const response = await fetchJson<ApiEnvelope<{ assignments: WebsiteJobAssignment[] }>>(
    `/api/admin/scraped-jobs/${encodeURIComponent(id)}/websites`,
    { method: "PUT", body: JSON.stringify({ assignments }) },
  )
  return response.data.assignments
}

export function setActiveWebsiteId(id: string): void {
  window.localStorage.setItem("admin_active_website_id", id)
  window.dispatchEvent(new CustomEvent("admin:website:changed", { detail: id }))
}

export function getActiveWebsiteId(): string | null {
  return typeof window === "undefined" ? null : window.localStorage.getItem("admin_active_website_id")
}
