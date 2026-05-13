import { mockCategories } from "@/data/mock-categories"
import type { Category } from "@/types"
import { fetchJson, USE_MOCK } from "./client"

export async function listCategories(): Promise<Category[]> {
  if (!USE_MOCK) return fetchJson<Category[]>("/api/categories")
  return mockCategories
}

