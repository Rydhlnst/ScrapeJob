import { MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ReviewRowActions } from "./review-row-actions"
import type { ReviewTableProps } from "./types"

export function ReviewTable({
  jobs,
  selected,
  busyId,
  allChecked,
  helpers,
  onToggleAll,
  onToggleRow,
  onAction,
  onInspect,
}: ReviewTableProps) {
  return (
    <>
      {/* Desktop table — no min-w so it stays within screen */}
      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <Table className="w-full table-fixed">
          <colgroup>
            <col className="w-10" />
            {/* Job title */}
            <col className="w-64 xl:w-80" />
            {/* Company + source */}
            <col className="w-44" />
            {/* Location — hidden below xl */}
            <col className="w-32 xl:w-36" />
            {/* Status */}
            <col className="w-28" />
            {/* Actions */}
            <col className="w-24" />
          </colgroup>
          <TableHeader className="[&_tr]:border-b [&_tr]:border-border">
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead className="w-10">
                <Checkbox checked={allChecked} onCheckedChange={(checked) => onToggleAll(Boolean(checked))} />
              </TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="hidden xl:table-cell">Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => {
              const checked = selected.includes(job.id)
              const busy = busyId === job.id
              const title = helpers.cleanJobTitle(job.title)
              const location = helpers.normalizeLocation(job.location)
              const scrapedAt = helpers.formatDate(job.scrapedAt)

              return (
                <TableRow key={job.id} className="border-border hover:bg-muted">
                  <TableCell>
                    <Checkbox checked={checked} onCheckedChange={(value) => onToggleRow(job.id, Boolean(value))} />
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
                        {job.draftStatus === "drafted_ai" ? (
                          <Badge variant="outline" className="shrink-0 rounded-lg border-sky-100 bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
                            AI
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="shrink-0 rounded-lg border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            Raw
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {job.employmentType ?? "Not specified"} · {scrapedAt}
                      </p>
                      {job.failReason ? (
                        <p className="truncate text-[11px] font-medium text-red-500">
                          {job.failReason}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 overflow-hidden">
                      <p className="truncate text-sm">{job.company || "—"}</p>
                      <Badge className={`rounded-full px-2 py-0 text-[10px] ${helpers.sourceBadgeClass(job.source)}`}>
                        {job.source}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell className="hidden xl:table-cell">
                    <div className="flex items-center gap-1 overflow-hidden text-sm">
                      <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span className="truncate">{location ?? "—"}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={`rounded-full px-2.5 ${helpers.statusBadgeClass(job.status)}`}>
                      {helpers.statusLabel(job.status)}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <ReviewRowActions
                      job={job}
                      sourceUrl={job.sourceUrl}
                      disabled={busy}
                      onAction={(action) => onAction(job.id, action)}
                      onInspect={() => onInspect(job)}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {jobs.map((job) => {
          const checked = selected.includes(job.id)
          const busy = busyId === job.id
          const title = helpers.cleanJobTitle(job.title)
          return (
            <Card key={job.id} className="border-border">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <Checkbox checked={checked} onCheckedChange={(value) => onToggleRow(job.id, Boolean(value))} />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="max-w-[150px] truncate text-sm font-semibold">{title}</p>
                      {job.draftStatus === "drafted_ai" ? (
                        <Badge variant="outline" className="shrink-0 rounded-lg border-sky-100 bg-sky-50 px-1 py-0 text-[9px] font-medium text-sky-700">
                          AI
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="shrink-0 rounded-lg border-slate-200 bg-slate-100 px-1 py-0 text-[9px] font-medium text-slate-600">
                          Raw
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{job.company || "Unknown company"}</p>
                    {job.failReason ? (
                      <p className="mt-0.5 text-[10px] font-medium leading-tight text-red-500">
                        {job.failReason}
                      </p>
                    ) : null}
                  </div>
                  <Badge className={`rounded-full px-2.5 ${helpers.statusBadgeClass(job.status)}`}>
                    {helpers.statusLabel(job.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{helpers.normalizeLocation(job.location) ?? "Not specified"}</span>
                  <span>{helpers.formatDate(job.scrapedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={`rounded-full px-2.5 ${helpers.sourceBadgeClass(job.source)}`}>{job.source}</Badge>
                  <ReviewRowActions
                    job={job}
                    sourceUrl={job.sourceUrl}
                    disabled={busy}
                    onAction={(action) => onAction(job.id, action)}
                    onInspect={() => onInspect(job)}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
