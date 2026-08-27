import type { Paginated } from "@/types"
import type { Page } from "@/types/page"

import { ApiEnvelope, fetchJson, type ApiRequestContext } from "./client"

type PageEnvelope = ApiEnvelope<Page>

export async function listAdminPages(
  options: { status?: string } = {},
): Promise<Paginated<Page>> {
  const params = new URLSearchParams({ perPage: "100" })
  if (options.status) params.set("status", options.status)

  const response = await fetchJson<ApiEnvelope<Page[]>>(
    `/api/admin/pages?${params.toString()}`,
  )

  return {
    data: response.data,
    page: response.meta?.currentPage ?? 1,
    perPage: response.meta?.perPage ?? response.data.length,
    total: response.meta?.total ?? response.data.length,
    totalPages: response.meta?.lastPage ?? 1,
  }
}

export async function getAdminPageById(id: string): Promise<Page> {
  const response = await fetchJson<PageEnvelope>(`/api/admin/pages/${encodeURIComponent(id)}`)
  return response.data
}

export async function createAdminPage(payload: {
  title: string
  slug?: string
  summary?: string
  content?: string
  seoTitle?: string
  seoDescription?: string
  status?: Page["status"]
}): Promise<Page> {
  const response = await fetchJson<PageEnvelope>("/api/admin/pages", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function updateAdminPage(
  id: string,
  payload: Partial<{
    title: string
    slug: string
    summary: string
    content: string
    seoTitle: string
    seoDescription: string
    status: Page["status"]
  }>,
): Promise<Page> {
  const response = await fetchJson<PageEnvelope>(`/api/admin/pages/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function publishAdminPage(id: string): Promise<Page> {
  const response = await fetchJson<PageEnvelope>(`/api/admin/pages/${encodeURIComponent(id)}/publish`, {
    method: "PATCH",
    body: JSON.stringify({}),
  })

  return response.data
}

export async function deleteAdminPage(id: string): Promise<void> {
  await fetchJson<ApiEnvelope<null>>(`/api/admin/pages/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}

export async function getPublicPageBySlug(slug: string, context?: ApiRequestContext): Promise<Page | null> {
  const response = await fetchJson<PageEnvelope>(`/api/pages/${encodeURIComponent(slug)}`, undefined, context)
  return response.data
}

export type PublicPageSummary = {
  id: string
  title: string
  slug: string
  summary?: string | null
  publishedAt?: string | null
  updatedAt?: string | null
}

export async function listPublicPages(perPage = 12, context?: ApiRequestContext): Promise<Paginated<PublicPageSummary>> {
  const response = await fetchJson<ApiEnvelope<PublicPageSummary[]>>(
    `/api/pages?per_page=${perPage}`, undefined, context,
  )
  return {
    data: response.data,
    page: response.meta?.currentPage ?? 1,
    perPage: response.meta?.perPage ?? response.data.length,
    total: response.meta?.total ?? response.data.length,
    totalPages: response.meta?.lastPage ?? 1,
  }
}
