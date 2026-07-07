import { listJobs } from "./jobs"
import { listCategories } from "./categories"

export async function getNavbarData() {
  try {
    const [navJobsRes, categories] = await Promise.all([
      listJobs({ page: 1, perPage: 100, sort: "newest" }),
      listCategories(),
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
