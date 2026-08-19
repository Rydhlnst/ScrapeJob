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
    <Card className="sticky top-28 rounded-[30px] border border-black/10 bg-white shadow-[0_8px_0_rgba(23,23,23,.04)]">
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
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-[#ffd36a] bg-white text-lg font-semibold text-[#2479d1]">
              {initials(companyName)}
            </div>
          )}
          <div>
            <CardTitle className="text-base font-extrabold tracking-[0.12em] uppercase text-[#2479d1]">
              Ringkasan
            </CardTitle>
            <p className="mt-1 text-sm font-medium text-foreground">{companyName}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
            <span>Lokasi</span>
            <span className="text-right text-foreground">
              {job.location || "Tidak disebutkan"}
            </span>
          </div>
          {job.jobType ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
              <span>Tipe kerja</span>
              <span className="text-right text-foreground">{job.jobType}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
            <span>Ditemukan</span>
            <span className="text-right text-foreground">
              {formatDate(job.publishedAt) ?? formatDate(job.scrapedAt) ?? "Baru ditemukan"}
            </span>
          </div>
          <Badge variant="outline" className="w-fit rounded-full border-black/10 bg-white text-slate-600">
            Sumber: {job.sourceName}
          </Badge>
        </div>

        <Separator />

        {hasSourceUrl ? (
          <Button asChild className="w-full rounded-full bg-[#1f5f9f] text-white shadow-[0_3px_0_rgba(23,23,23,.12)] hover:bg-[#2479d1]">
            <a href={job.sourceUrl} target="_blank" rel="noreferrer">
              Lihat Sumber Lowongan
            </a>
          </Button>
        ) : (
          <div className="rounded-2xl border border-dashed border-black/15 bg-white px-4 py-3 text-sm text-slate-600">
            Sumber lowongan tidak tersedia.
          </div>
        )}

          <div className="rounded-2xl border border-black/10 border-l-4 border-l-[#ffd36a] bg-white p-3 text-xs text-muted-foreground">
          Pastikan membaca informasi dari sumber resmi sebelum melamar.
        </div>
      </CardContent>
    </Card>
  )
}

