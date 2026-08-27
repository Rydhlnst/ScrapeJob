"use client"

import * as React from "react"
import { Loader2, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

import type { ScrapeLog, ScrapeRun } from "@/types"
import { listJobSources, listScrapeLogs, listScrapeRuns, runScrape, type JobSourceOption } from "@/lib/api/scrape-runs"

// Note: the page passes no `runs` prop — this client fetches its own data.
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingState } from "@/components/shared/loading-state"
import { ScrapeLogTable } from "./scrape-log-table"
import { ScrapeRunTable } from "./scrape-run-table"

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

export function ScrapeRunsClient() {
  const [runItems, setRunItems] = React.useState<ScrapeRun[]>([])
  const [sources, setSources] = React.useState<JobSourceOption[]>([])
  const [sourceId, setSourceId] = React.useState<string>("")
  const [selectedRunId, setSelectedRunId] = React.useState<string | null>(null)
  const [logs, setLogs] = React.useState<ScrapeLog[]>([])
  const [logsError, setLogsError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [isRunningScrape, setIsRunningScrape] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [keyword, setKeyword] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<ScrapeRun["status"] | "all">("all")
  const [logStatusFilter, setLogStatusFilter] = React.useState<ScrapeLog["status"] | "all">("all")

  const loadRuns = React.useCallback(async () => {
    setIsRefreshing(true)
    try {
      const runData = await listScrapeRuns(statusFilter)
      setRunItems(runData)
      setSelectedRunId((current) =>
        current && runData.some((run) => run.id === current) ? current : runData[0]?.id ?? null,
      )
    } catch (err) {
      console.error("[scrape-runs] failed to list runs", err)
      const message = err instanceof Error ? err.message : "Gagal memuat data scrape runs."
      toast.error(message)
    } finally {
      setIsRefreshing(false)
    }
  }, [statusFilter])

  React.useEffect(() => {
    let alive = true

    async function loadSources() {
      try {
        const data = await listJobSources()
        if (!alive) return
        setSources(data)
        if (!sourceId && data[0]?.id) {
          setSourceId(data[0].id)
        }
      } catch (err) {
        if (!alive) return
        console.error("[scrape-runs] failed to list sources", err)
        const message = err instanceof Error ? err.message : "Gagal memuat source scraping."
        toast.error(message)
      }
    }

    void loadRuns()
    void loadSources()
    return () => {
      alive = false
    }
  }, [loadRuns])

  React.useEffect(() => {
    let alive = true
    async function load() {
      if (!selectedRunId) return
      setLoading(true)
      setLogsError(null)
      try {
        const data = await listScrapeLogs(selectedRunId, logStatusFilter)
        if (alive) setLogs(data)
      } catch (err) {
        if (!alive) return
        const message = err instanceof Error ? err.message : "Gagal memuat scrape logs."
        setLogsError(message)
        toast.error(message)
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [selectedRunId, logStatusFilter])

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <div className="flex items-start gap-2">
          <TriangleAlert className="mt-0.5 h-4 w-4" />
          <div>
            Pastikan website target memperbolehkan scraping dan tidak membutuhkan bypass captcha/login wall.
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[240px_1fr_1fr_160px] md:items-end">
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">Source website</div>
          <Select value={sourceId} onValueChange={setSourceId}>
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  {toTitleCase(source.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">Keyword / Jenis kerja</div>
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="contoh: Data Analyst, Full Time"
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">Lokasi (opsional)</div>
          <Input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="contoh: Jakarta"
          />
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isRunningScrape || !sourceId}
          onClick={async () => {
            if (!sourceId) {
              toast.warning("Pilih source dulu.")
              return
            }

            setIsRunningScrape(true)
            const toastId = toast.loading("Scraping jalan...")
            try {
              const selectedSource = sources.find((item) => item.id === sourceId)
              if (!selectedSource) {
                throw new Error("Source tidak ditemukan.")
              }
              const normalizedKeyword = keyword.trim() || undefined
              const normalizedLocation = location.trim() || undefined
              const newRun = await runScrape(
                selectedSource.name.toLowerCase(),
                normalizedKeyword,
                normalizedLocation,
              )
              if (statusFilter === "all" || newRun.status === statusFilter) {
                setRunItems((prev) => [newRun, ...prev])
                setSelectedRunId(newRun.id)
              } else {
                void loadRuns()
              }
              toast.success("Scraping dimulai di background.", { id: toastId })
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "Gagal menjalankan scrape."
              toast.error(message, { id: toastId })
            } finally {
              setIsRunningScrape(false)
            }
          }}
        >
          {isRunningScrape ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            "Run Scrape"
          )}
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-slate-900">Scrape Runs</div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadRuns}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Refresh
          </Button>
        </div>
        <ScrapeRunTable
          runs={runItems}
          selectedId={selectedRunId}
          onSelect={(id) => setSelectedRunId(id)}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-slate-900">Scrape Logs</div>
          <Select value={logStatusFilter} onValueChange={(value) => setLogStatusFilter(value as typeof logStatusFilter)}>
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="duplicate">Duplicate</SelectItem>
              <SelectItem value="skipped">Skipped</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {loading ? (
          <LoadingState rows={6} />
        ) : logsError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="mb-2">{logsError}</div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                // Re-trigger the effect by toggling the run id
                const current = selectedRunId
                setSelectedRunId(null)
                setTimeout(() => setSelectedRunId(current), 0)
              }}
            >
              Retry
            </Button>
          </div>
        ) : (
          <ScrapeLogTable logs={logs} />
        )}
      </div>
    </div>
  )
}
