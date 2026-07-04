import type { Job } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils"

export function JobSummaryCard({ job }: { job: Job }) {
  const hasSourceUrl = Boolean(job.sourceUrl)

  return (
    <Card className="sticky top-24 rounded-[30px] border border-white/80 bg-white/82 shadow-[var(--shadow-md)]">
      <CardHeader>
        <CardTitle className="text-base font-semibold tracking-[0.12em] uppercase text-slate-500">
          Ringkasan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white bg-[var(--brand-shell)] px-4 py-3">
            <span>Perusahaan</span>
            <span className="text-right font-medium text-foreground">
              {job.companyName || "Tidak diketahui"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white bg-[var(--brand-shell)] px-4 py-3">
            <span>Lokasi</span>
            <span className="text-right text-foreground">
              {job.location || "Tidak disebutkan"}
            </span>
          </div>
          {job.jobType ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white bg-[var(--brand-shell)] px-4 py-3">
              <span>Tipe kerja</span>
              <span className="text-right text-foreground">{job.jobType}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white bg-[var(--brand-shell)] px-4 py-3">
            <span>Ditemukan</span>
            <span className="text-right text-foreground">
              {formatDate(job.publishedAt) ?? formatDate(job.scrapedAt) ?? "Baru ditemukan"}
            </span>
          </div>
          <Badge variant="outline" className="w-fit rounded-full border-white bg-white text-slate-600">
            Sumber: {job.sourceName}
          </Badge>
        </div>

        <Separator />

        {hasSourceUrl ? (
          <Button asChild className="w-full rounded-2xl bg-blue-600 text-white hover:bg-blue-700">
            <a href={job.sourceUrl} target="_blank" rel="noreferrer">
              Lihat Sumber Lowongan
            </a>
          </Button>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Sumber lowongan tidak tersedia.
          </div>
        )}

        <div className="rounded-2xl border border-white bg-[var(--brand-shell)] p-3 text-xs text-muted-foreground">
          Pastikan membaca informasi dari sumber resmi sebelum melamar.
        </div>
      </CardContent>
    </Card>
  )
}
