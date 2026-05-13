import type { ScrapeLog, ScrapeRun } from "@/types"

export const mockScrapeRuns: ScrapeRun[] = [
  {
    id: "run_1001",
    sourceName: "Source Website",
    status: "success",
    startedAt: "2026-05-12 08:10",
    finishedAt: "2026-05-12 08:14",
    totalFound: 42,
    successCount: 28,
    duplicateCount: 9,
    failedCount: 3,
    skippedCount: 2,
  },
  {
    id: "run_1002",
    sourceName: "Job Aggregator",
    status: "partial",
    startedAt: "2026-05-13 09:00",
    finishedAt: null,
    totalFound: 18,
    successCount: 10,
    duplicateCount: 5,
    failedCount: 2,
    skippedCount: 1,
  },
]

export const mockScrapeLogs: ScrapeLog[] = [
  {
    id: "log_1",
    scrapeRunId: "run_1001",
    url: "https://example.com/job/frontend",
    title: "Frontend Developer",
    status: "success",
    message: "Inserted as draft",
    createdAt: "2026-05-12 08:11",
  },
  {
    id: "log_2",
    scrapeRunId: "run_1001",
    url: "https://example.com/job/intern",
    title: "Software Engineer Intern",
    status: "duplicate",
    message: "content_hash matched existing job",
    createdAt: "2026-05-12 08:12",
  },
  {
    id: "log_3",
    scrapeRunId: "run_1001",
    url: "https://example.com/job/invalid",
    title: null,
    status: "failed",
    message: "fetch failed: 502",
    createdAt: "2026-05-12 08:13",
  },
]

