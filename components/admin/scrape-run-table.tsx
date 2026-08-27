"use client"

import type { ScrapeRun } from "@/types"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

function StatusBadge({ status }: { status: ScrapeRun["status"] }) {
  const cls =
    status === "pending" || status === "running"
      ? "bg-slate-100 text-slate-700 border-slate-200"
      : status === "success"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : status === "failed"
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-amber-50 text-amber-700 border-amber-200"

  return (
    <Badge variant="outline" className={cn("capitalize", cls)}>
      {status}
    </Badge>
  )
}

export function ScrapeRunTable({
  runs,
  selectedId,
  onSelect,
}: {
  runs: ScrapeRun[]
  selectedId?: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Run ID</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Finished</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Success</TableHead>
            <TableHead>Duplicate</TableHead>
            <TableHead>Failed</TableHead>
            <TableHead>Skipped</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="py-10 text-center text-slate-500">
                No scrape runs match this status.
              </TableCell>
            </TableRow>
          ) : runs.map((r) => {
            const selected = selectedId === r.id
            return (
              <TableRow
                key={r.id}
                className={cn(selected && "bg-blue-50")}
                onClick={() => onSelect(r.id)}
              >
                <TableCell className="font-medium text-slate-900">{r.id}</TableCell>
                <TableCell>{r.sourceName}</TableCell>
                <TableCell className="max-w-[320px]">
                  <StatusBadge status={r.status} />
                  {r.errorMessage ? (
                    <div className="mt-1 line-clamp-2 text-xs text-rose-700" title={r.errorMessage}>
                      {r.errorMessage}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="text-slate-600">{r.startedAt}</TableCell>
                <TableCell className="text-slate-600">{r.finishedAt ?? "-"}</TableCell>
                <TableCell>{r.totalFound}</TableCell>
                <TableCell className="text-emerald-700">{r.successCount}</TableCell>
                <TableCell className="text-purple-700">{r.duplicateCount}</TableCell>
                <TableCell className="text-rose-700">{r.failedCount}</TableCell>
                <TableCell className="text-slate-700">{r.skippedCount}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
