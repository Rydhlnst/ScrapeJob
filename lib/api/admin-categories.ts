import type { Category } from "@/types"

import { fetchJson, type ApiEnvelope } from "./client"

export type CategoryInput = {
  name: string
  description?: string | null
}

export async function listAdminCategories(): Promise<Category[]> {
  const response = await fetchJson<ApiEnvelope<Category[]>>("/api/admin/categories")
  return response.data.map((category) => ({
    ...category,
    totalJobs: category.totalJobs ?? 0,
  }))
}

export async function createAdminCategory(payload: CategoryInput): Promise<Category> {
  const response = await fetchJson<ApiEnvelope<Category>>("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateAdminCategory(id: string, payload: Partial<CategoryInput>): Promise<Category> {
  const response = await fetchJson<ApiEnvelope<Category>>(`/api/admin/categories/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function deleteAdminCategory(id: string): Promise<void> {
  await fetchJson<ApiEnvelope<null>>(`/api/admin/categories/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}
