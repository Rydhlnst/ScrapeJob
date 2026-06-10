import { mockScrapeLogs, mockScrapeRuns } from "@/data/mock-scrape-runs"
import type { ScrapeLog, ScrapeRun } from "@/types"
import { ApiEnvelope, fetchJson, USE_MOCK } from "./client"

export type JobSourceOption = {
  id: string
  name: string
  scrapingAllowed: boolean
  isActive: boolean
}

export async function listScrapeRuns(): Promise<ScrapeRun[]> {
  if (USE_MOCK) {
    return mockScrapeRuns
  }
  const response = await fetchJson<ApiEnvelope<ScrapeRun[]>>("/api/admin/scrape-runs")
  return response.data
}

export async function listScrapeLogs(scrapeRunId: string): Promise<ScrapeLog[]> {
  if (USE_MOCK) {
    return mockScrapeLogs.filter((l) => l.scrapeRunId === scrapeRunId)
  }
  const response = await fetchJson<ApiEnvelope<ScrapeLog[]>>(
    `/api/admin/scrape-runs/${encodeURIComponent(scrapeRunId)}/logs`,
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
