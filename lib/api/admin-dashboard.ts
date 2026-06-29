import type { AdminDashboardSummary } from "@/types/landing-content"
import { ApiEnvelope, fetchJson, USE_MOCK } from "./client"

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  if (USE_MOCK) {
    return {
      statusCounts: {
        total: 0,
        raw: 0,
        draft: 0,
        published: 0,
        attention: 0,
        rejected: 0,
        duplicate: 0,
      },
      catalog: {
        totalCategories: 0,
        totalSources: 0,
      },
      priorityQueues: {
        needsReview: [],
        readyToPublish: [],
        landingContentDrafts: [],
      },
      content: {
        status: "empty",
        hasDraft: false,
        updatedAt: null,
        publishedAt: null,
      },
      recentActivity: [],
    }
  }

  const response = await fetchJson<ApiEnvelope<AdminDashboardSummary>>(
    "/api/admin/dashboard",
  )

  return response.data
}
