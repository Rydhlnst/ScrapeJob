import type { Job } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function JobSummaryCard({ job }: { job: Job }) {
  return (
    <Card className="sticky top-24 rounded-[28px] border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Ringkasan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{job.companyName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{job.location}</span>
          </div>
          {job.jobType ? (
            <div className="flex items-center gap-2">
              <span>{job.jobType}</span>
            </div>
          ) : null}
          {job.scrapedAt ? (
            <div className="flex items-center gap-2">
              <span>Posted: {job.scrapedAt}</span>
            </div>
          ) : null}
          <div className="text-xs text-muted-foreground">
            Sumber: {job.sourceName}
          </div>
        </div>

        <Separator />

        <Button
          asChild
          className="w-full rounded-2xl bg-[hsl(var(--dark))] text-white hover:bg-[hsl(var(--dark-soft))]"
        >
          <a href={job.sourceUrl} target="_blank" rel="noreferrer">
            Lihat Sumber Lowongan
          </a>
        </Button>

        <div className="rounded-2xl border border-border bg-[hsl(var(--muted))] p-3 text-xs text-muted-foreground">
          Pastikan membaca informasi dari sumber resmi sebelum melamar.
        </div>
      </CardContent>
    </Card>
  )
}
