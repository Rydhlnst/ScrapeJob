import { mockScrapeLogs, mockScrapeRuns } from "@/data/mock-scrape-runs"
import type { ScrapeLog, ScrapeRun } from "@/types"
import { fetchJson, USE_MOCK } from "./client"

export async function listScrapeRuns(): Promise<ScrapeRun[]> {
  if (!USE_MOCK) return fetchJson<ScrapeRun[]>("/api/admin/scrape-runs")
  return mockScrapeRuns
}

export async function listScrapeLogs(scrapeRunId: string): Promise<ScrapeLog[]> {
  if (!USE_MOCK)
    return fetchJson<ScrapeLog[]>(
      `/api/admin/scrape-runs/${encodeURIComponent(scrapeRunId)}/logs`,
    )
  return mockScrapeLogs.filter((l) => l.scrapeRunId === scrapeRunId)
}

