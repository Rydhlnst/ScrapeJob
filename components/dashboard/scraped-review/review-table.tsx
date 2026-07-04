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
  canPublish,
}: ReviewTableProps) {
  return (
    <>
      <div className="hidden max-w-full overflow-x-auto rounded-xl border border-border/70 md:block">
        <Table className="min-w-[1100px]">
          <TableHeader className="[&_tr]:border-b [&_tr]:border-border/70">
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10">
                <Checkbox checked={allChecked} onCheckedChange={(checked) => onToggleAll(Boolean(checked))} />
              </TableHead>
              <TableHead className="min-w-[260px]">Job</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scraped At</TableHead>
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
                <TableRow key={job.id} className="border-border/70 hover:bg-muted/20">
                  <TableCell>
                    <Checkbox checked={checked} onCheckedChange={(value) => onToggleRow(job.id, Boolean(value))} />
                  </TableCell>
                  <TableCell className="max-w-[420px]">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="max-w-[280px] truncate text-sm font-semibold text-foreground">{title}</p>
                        {job.draftStatus === "drafted_ai" ? (
                          <Badge variant="outline" className="shrink-0 rounded-none border-sky-100 bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
                            Drafted by AI
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="shrink-0 rounded-none border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            Drafted Raw
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {job.employmentType ?? "Not specified"} | Scraped {scrapedAt}
                      </p>
                      {job.failReason ? (
                        <p className="mt-0.5 text-[11px] font-medium leading-tight text-red-500">
                          Gagal AI: {job.failReason}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{job.company || "Unknown company"}</p>
                      <p className="text-xs text-muted-foreground">{job.source}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{location ?? "Not specified"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`rounded-full px-2.5 ${helpers.sourceBadgeClass(job.source)}`}>{job.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`rounded-full px-2.5 ${helpers.statusBadgeClass(job.status)}`}>
                      {helpers.statusLabel(job.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{scrapedAt}</TableCell>
                  <TableCell className="text-right">
                    <ReviewRowActions
                      job={job}
                      sourceUrl={job.sourceUrl}
                      disabled={busy}
                      publishDisabled={!canPublish(job)}
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

      <div className="grid gap-3 md:hidden">
        {jobs.map((job) => {
          const checked = selected.includes(job.id)
          const busy = busyId === job.id
          const title = helpers.cleanJobTitle(job.title)
          return (
            <Card key={job.id} className="border-border/70">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <Checkbox checked={checked} onCheckedChange={(value) => onToggleRow(job.id, Boolean(value))} />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="max-w-[150px] truncate text-sm font-semibold">{title}</p>
                      {job.draftStatus === "drafted_ai" ? (
                        <Badge variant="outline" className="shrink-0 rounded-none border-sky-100 bg-sky-50 px-1 py-0 text-[9px] font-medium text-sky-700">
                          AI
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="shrink-0 rounded-none border-slate-200 bg-slate-100 px-1 py-0 text-[9px] font-medium text-slate-600">
                          Raw
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{job.company || "Unknown company"}</p>
                    {job.failReason ? (
                      <p className="mt-0.5 text-[10px] font-medium leading-tight text-red-500">
                        Gagal AI: {job.failReason}
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
                    publishDisabled={!canPublish(job)}
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
