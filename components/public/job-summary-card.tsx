import type { Job } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils"

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase()).join("")
}

export function JobSummaryCard({ job }: { job: Job }) {
  const hasSourceUrl = Boolean(job.sourceUrl)
  const companyName = job.companyName || "Tidak diketahui"

  return (
    <Card className="sticky top-24 rounded-[30px] border border-white bg-white shadow-[var(--shadow-md)]">
      <CardHeader>
        <div className="flex items-center gap-4">
          {job.companyLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.companyLogo}
              alt={companyName}
              className="size-14 shrink-0 rounded-2xl bg-white object-cover ring-1 ring-slate-100"
            />
          ) : (
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sky-50 text-lg font-semibold text-sky-700">
              {initials(companyName)}
            </div>
          )}
          <div>
            <CardTitle className="text-base font-semibold tracking-[0.12em] uppercase text-slate-500">
              Ringkasan
            </CardTitle>
            <p className="mt-1 text-sm font-medium text-foreground">{companyName}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3 text-sm text-muted-foreground">
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

