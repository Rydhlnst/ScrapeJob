import { mockScrapeLogs, mockScrapeRuns } from "@/data/mock-scrape-runs"
import type { ScrapeLog, ScrapeRun } from "@/types"
import { ApiEnvelope, fetchJson, USE_MOCK } from "./client"

export type JobSourceOption = {
  id: string
  name: string
  scrapingAllowed: boolean
  isActive: boolean
}

export async function listScrapeRuns(status: ScrapeRun["status"] | "all" = "all"): Promise<ScrapeRun[]> {
  if (USE_MOCK) {
    return status === "all" ? mockScrapeRuns : mockScrapeRuns.filter((run) => run.status === status)
  }
  const query = status === "all" ? "" : `?status=${encodeURIComponent(status)}`
  const response = await fetchJson<ApiEnvelope<ScrapeRun[]>>(`/api/admin/scrape-runs${query}`)
  return response.data
}

export async function listScrapeLogs(
  scrapeRunId: string,
  status: ScrapeLog["status"] | "all" = "all",
): Promise<ScrapeLog[]> {
  if (USE_MOCK) {
    return mockScrapeLogs.filter(
      (log) => log.scrapeRunId === scrapeRunId && (status === "all" || log.status === status),
    )
  }
  const query = status === "all" ? "" : `?status=${encodeURIComponent(status)}`
  const response = await fetchJson<ApiEnvelope<ScrapeLog[]>>(
    `/api/admin/scrape-runs/${encodeURIComponent(scrapeRunId)}/logs${query}`,
  )
  return response.data
}

export async function listJobSources(): Promise<JobSourceOption[]> {
  if (USE_MOCK) {
    return [
      { id: "glints-mock", name: "Glints", scrapingAllowed: true, isActive: true },
      { id: "jobstreet-mock", name: "Jobstreet", scrapingAllowed: true, isActive: true },
    ]
  }

  const response = await fetchJson<ApiEnvelope<JobSourceOption[]>>("/api/admin/job-sources")
  return response.data.filter((source) => source.isActive)
}

export async function runScrape(
  source: string,
  keyword?: string,
  location?: string,
): Promise<ScrapeRun> {
  if (USE_MOCK) {
    const now = new Date().toISOString()
    return {
      id: `mock-${Date.now()}`,
      sourceName: source,
      status: "success",
      startedAt: now,
      finishedAt: now,
      totalFound: 3,
      successCount: 3,
      duplicateCount: 0,
      failedCount: 0,
      skippedCount: 0,
    }
  }

  const response = await fetchJson<ApiEnvelope<ScrapeRun>>("/api/admin/scrape-runs/run", {
    method: "POST",
    body: JSON.stringify({ source, keyword, location }),
  })
  return response.data
}
