import { listJobs } from "./jobs"
import { listCategories } from "./categories"
import type { ApiRequestContext } from "./client"

export async function getNavbarData(context?: ApiRequestContext) {
  try {
    const [navJobsRes, categories] = await Promise.all([
      listJobs({ page: 1, perPage: 100, sort: "newest" }, context),
      listCategories(context),
    ])
    return {
      jobs: navJobsRes.data,
      categories,
      totalJobs: navJobsRes.total,
    }
  } catch {
    return { jobs: [], categories: [], totalJobs: 0 }
  }
}
