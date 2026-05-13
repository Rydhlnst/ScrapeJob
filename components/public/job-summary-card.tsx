import type { Job } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function JobSummaryCard({ job }: { job: Job }) {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-base">Ringkasan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">{job.companyName}</span>
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
          <div className="text-xs text-slate-500">Source: {job.sourceName}</div>
        </div>

        <Separator />

        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
          <a href={job.sourceUrl} target="_blank" rel="noreferrer">
            Lihat Sumber Lowongan
          </a>
        </Button>

        <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
          Pastikan membaca informasi dari sumber resmi sebelum melamar.
        </div>
      </CardContent>
    </Card>
  )
}
