"use client"

import * as React from "react"
import { Loader2, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

import type { ScrapeLog, ScrapeRun } from "@/types"
import { listJobSources, listScrapeLogs, listScrapeRuns, runScrape, type JobSourceOption } from "@/lib/api/scrape-runs"
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

const DEFAULT_SOURCES: JobSourceOption[] = [
  { id: "jobstreet-fallback", name: "Jobstreet", scrapingAllowed: true, isActive: true },
  { id: "glints-fallback", name: "Glints", scrapingAllowed: true, isActive: true },
  { id: "lokerid-fallback", name: "Lokerid", scrapingAllowed: true, isActive: true },
]

export function ScrapeRunsClient({ runs }: { runs: ScrapeRun[] }) {
  const [runItems, setRunItems] = React.useState<ScrapeRun[]>(runs)
  const [sources, setSources] = React.useState<JobSourceOption[]>([])
  const [sourceId, setSourceId] = React.useState<string>("")
  const [selectedRunId, setSelectedRunId] = React.useState<string | null>(runs[0]?.id ?? null)
  const [logs, setLogs] = React.useState<ScrapeLog[]>([])
  const [loading, setLoading] = React.useState(false)
  const [isRunningScrape, setIsRunningScrape] = React.useState(false)
  const [keyword, setKeyword] = React.useState("")
  const [location, setLocation] = React.useState("")

  React.useEffect(() => {
    let alive = true

    async function loadRuns() {
      try {
        const runData = await listScrapeRuns()
        if (!alive) return
        setRunItems(runData)
        if (!selectedRunId && runData[0]?.id) {
          setSelectedRunId(runData[0].id)
        }
      } catch {
        if (!alive) return
        toast.error("Gagal memuat data scrape runs.")
      }
    }

    async function loadSources() {
      try {
        const data = await listJobSources()
        if (!alive) return
        const normalized = data.length > 0 ? data : DEFAULT_SOURCES
        setSources(normalized)
        if (!sourceId && normalized[0]?.id) {
          setSourceId(normalized[0].id)
        }
        if (data.length === 0) {
          toast.warning("Source dari API kosong. Menggunakan source fallback.")
        }
      } catch {
        if (!alive) return
        setSources(DEFAULT_SOURCES)
        if (!sourceId && DEFAULT_SOURCES[0]?.id) {
          setSourceId(DEFAULT_SOURCES[0].id)
        }
        toast.warning("Gagal memuat source API. Menggunakan source fallback.")
      }
    }

    void loadRuns()
    void loadSources()
    return () => {
      alive = false
    }
  }, [])

  React.useEffect(() => {
    let alive = true
    async function load() {
      if (!selectedRunId) return
      setLoading(true)
      try {
        const data = await listScrapeLogs(selectedRunId)
        if (alive) setLogs(data)
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [selectedRunId])

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
              setRunItems((prev) => [newRun, ...prev])
              setSelectedRunId(newRun.id)
              toast.success("Scraping berhasil.", { id: toastId })
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
        <div className="text-sm font-semibold text-slate-900">Scrape Runs</div>
        <ScrapeRunTable
          runs={runItems}
          selectedId={selectedRunId}
          onSelect={(id) => setSelectedRunId(id)}
        />
      </div>

      <div className="space-y-3">
        <div className="text-sm font-semibold text-slate-900">Scrape Logs</div>
        {loading ? <LoadingState rows={6} /> : <ScrapeLogTable logs={logs} />}
      </div>
    </div>
  )
}
