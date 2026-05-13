"use client"

import * as React from "react"
import { TriangleAlert } from "lucide-react"

import type { ScrapeLog, ScrapeRun } from "@/types"
import { listScrapeLogs } from "@/lib/api/scrape-runs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingState } from "@/components/shared/loading-state"
import { ScrapeLogTable } from "./scrape-log-table"
import { ScrapeRunTable } from "./scrape-run-table"

export function ScrapeRunsClient({ runs }: { runs: ScrapeRun[] }) {
  const [source, setSource] = React.useState("Source Website")
  const [selectedRunId, setSelectedRunId] = React.useState<string | null>(runs[0]?.id ?? null)
  const [logs, setLogs] = React.useState<ScrapeLog[]>([])
  const [loading, setLoading] = React.useState(false)

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

      <div className="grid gap-3 md:grid-cols-[240px_160px] md:items-end">
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">Source website</div>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Source Website">Source Website</SelectItem>
              <SelectItem value="Job Aggregator">Job Aggregator</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => console.log("run-scrape", source)}
        >
          Run Scrape
        </Button>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-semibold text-slate-900">Scrape Runs</div>
        <ScrapeRunTable
          runs={runs}
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

