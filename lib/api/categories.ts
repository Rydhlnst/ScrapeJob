import { mockCategories } from "@/data/mock-categories"
import type { Category } from "@/types"
import { ApiEnvelope, fetchJson, USE_MOCK, type ApiRequestContext } from "./client"

export async function listCategories(context?: ApiRequestContext): Promise<Category[]> {
  if (USE_MOCK) {
    return mockCategories
  }

  const response = await fetchJson<
    ApiEnvelope<
      Array<
        Category & {
          publishedJobsCount?: number
        }
      >
    >
  >("/api/categories", undefined, context)

  return response.data.map((category) => ({
    ...category,
    totalJobs: category.totalJobs ?? category.publishedJobsCount ?? 0,
  }))
}
