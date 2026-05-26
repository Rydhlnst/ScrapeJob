import { mockCategories } from "@/data/mock-categories"
import type { Category } from "@/types"
import { ApiEnvelope, fetchJson, USE_MOCK } from "./client"

export async function listCategories(): Promise<Category[]> {
  if (!USE_MOCK) {
    const response = await fetchJson<
      ApiEnvelope<
        Array<
          Category & {
            publishedJobsCount?: number
          }
        >
      >
    >("/api/categories")

    return response.data.map((category) => ({
      ...category,
      totalJobs: category.totalJobs ?? category.publishedJobsCount ?? 0,
    }))
  }
  return mockCategories
}
