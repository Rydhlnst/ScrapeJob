"use client"

import * as React from "react"
import Link from "next/link"
import { Filter, MoreHorizontal, Search, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import type { Job } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { deleteAdminJob, publishAdminJob, unpublishAdminJob } from "@/lib/api/admin-jobs"
import { cn } from "@/lib/utils"
import { JobStatusBadge } from "./job-status-badge"

type BulkActionKey = "publish" | "draft" | "delete"

type JobsTableProps = {
  jobs: Job[]
  title?: string
  onRefresh?: () => void | Promise<void>
  initialKeyword?: string
  onKeywordChange?: (keyword: string) => void
  filters?: {
    sources: string[]
    categories: string[]
    activeSource?: string
    activeCategory?: string
    onSourceChange: (value: string | null) => void
    onCategoryChange: (value: string | null) => void
  }
}

export function JobsTable({
  jobs,
  title = "Jobs",
  onRefresh,
  initialKeyword = "",
  onKeywordChange,
  filters,
}: JobsTableProps) {
  const [keyword, setKeyword] = React.useState(initialKeyword)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [pendingAction, setPendingAction] = React.useState<BulkActionKey | null>(null)
  const [running, setRunning] = React.useState<BulkActionKey | null>(null)

  // Debounce keyword → notify parent
  React.useEffect(() => {
    if (!onKeywordChange) return
    const handle = window.setTimeout(() => onKeywordChange(keyword.trim()), 300)
    return () => window.clearTimeout(handle)
  }, [keyword, onKeywordChange])

  // Reset selection when the list content changes.
  React.useEffect(() => {
    setSelected((prev) => {
      const visible = new Set(jobs.map((j) => j.id))
      const next = new Set<string>()
      prev.forEach((id) => {
        if (visible.has(id)) next.add(id)
      })
      return next
    })
  }, [jobs])

  const allSelected = jobs.length > 0 && jobs.every((j) => selected.has(j.id))
  const someSelected = selected.size > 0 && !allSelected

  function toggleAll(next: boolean | "indeterminate") {
    if (next === true) {
      setSelected(new Set(jobs.map((j) => j.id)))
    } else {
      setSelected(new Set())
    }
  }

  function toggleOne(id: string, next: boolean | "indeterminate") {
    setSelected((prev) => {
      const copy = new Set(prev)
      if (next === true) copy.add(id)
      else copy.delete(id)
      return copy
    })
  }

  async function runBulk(action: BulkActionKey) {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    setRunning(action)
    try {
      const runners: Record<BulkActionKey, (id: string) => Promise<unknown>> = {
        publish: publishAdminJob,
        draft: unpublishAdminJob,
        delete: deleteAdminJob,
      }
      const results = await Promise.allSettled(ids.map((id) => runners[action](id)))
      const failed = results.filter((r) => r.status === "rejected").length
      if (failed === 0) {
        toast.success(`${ids.length} lowongan berhasil diproses.`)
      } else {
        toast.error(`${failed} dari ${ids.length} gagal. Coba lagi.`)
      }
      setSelected(new Set())
      await onRefresh?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Aksi bulk gagal.")
    } finally {
      setRunning(null)
      setPendingAction(null)
    }
  }

  const activeSource = filters?.activeSource ?? null
  const activeCategory = filters?.activeCategory ?? null
  const activeFilterCount = (activeSource ? 1 : 0) + (activeCategory ? 1 : 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm font-semibold text-zinc-900">
          {title}
          <span className="ml-2 text-xs font-normal text-zinc-500">{jobs.length} item</span>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari judul, perusahaan..."
              className="pl-8"
            />
            {keyword ? (
              <button
                type="button"
                onClick={() => setKeyword("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {filters ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                  {activeFilterCount > 0 ? (
                    <span className="ml-1 grid size-5 place-items-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {filters.sources.length > 0 ? (
                  <>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Source
                    </DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={activeSource === null}
                      onCheckedChange={() => filters.onSourceChange(null)}
                    >
                      Semua Source
                    </DropdownMenuCheckboxItem>
                    {filters.sources.map((s) => (
                      <DropdownMenuCheckboxItem
                        key={s}
                        checked={activeSource === s}
                        onCheckedChange={() => filters.onSourceChange(s)}
                      >
                        {s}
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                {filters.categories.length > 0 ? (
                  <>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Kategori
                    </DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={activeCategory === null}
                      onCheckedChange={() => filters.onCategoryChange(null)}
                    >
                      Semua Kategori
                    </DropdownMenuCheckboxItem>
                    {filters.categories.map((c) => (
                      <DropdownMenuCheckboxItem
                        key={c}
                        checked={activeCategory === c}
                        onCheckedChange={() => filters.onCategoryChange(c)}
                      >
                        {c}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">
          <div className="text-zinc-700">
            <span className="font-semibold text-zinc-900">{selected.size}</span> dipilih
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={running !== null}
              onClick={() => setPendingAction("publish")}
            >
              Bulk Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={running !== null}
              onClick={() => setPendingAction("draft")}
            >
              Bulk Draft
            </Button>
            <ConfirmDialog
              title={`Hapus ${selected.size} lowongan?`}
              description="Aksi ini tidak dapat dibatalkan. Data terkait akan ikut terhapus."
              confirmLabel="Hapus"
              onConfirm={() => runBulk("delete")}
            >
              <Button size="sm" variant="destructive" disabled={running !== null} className="gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                Bulk Delete
              </Button>
            </ConfirmDialog>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Batal
            </Button>
          </div>
        </div>
      ) : null}

      <div className="border border-zinc-200 bg-white">
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="py-3">Judul</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="hidden lg:table-cell">Lokasi</TableHead>
                <TableHead className="hidden xl:table-cell">Kategori</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Scraped</TableHead>
                <TableHead className="w-[50px] text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-sm text-zinc-500">
                    Tidak ada lowongan pada filter ini.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((j) => {
                  const isSelected = selected.has(j.id)
                  return (
                    <TableRow
                      key={j.id}
                      data-state={isSelected ? "selected" : undefined}
                      className={cn(isSelected && "bg-zinc-50")}
                    >
                      <TableCell className="py-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(v) => toggleOne(j.id, v)}
                          aria-label={`Select ${j.title}`}
                        />
                      </TableCell>
                      <TableCell className="py-3 font-medium text-zinc-900">
                        <Link className="hover:underline" href={`/admin/jobs/${j.id}/edit`}>
                          {j.title}
                        </Link>
                      </TableCell>
                      <TableCell className="py-3 text-zinc-700">{j.companyName}</TableCell>
                      <TableCell className="py-3 text-zinc-700 hidden lg:table-cell">{j.location}</TableCell>
                      <TableCell className="py-3 text-zinc-700 hidden xl:table-cell">{j.category ?? "-"}</TableCell>
                      <TableCell className="py-3 text-zinc-700">{j.sourceName}</TableCell>
                      <TableCell className="py-3">
                        <JobStatusBadge status={j.status} />
                      </TableCell>
                      <TableCell className="py-3 text-zinc-600 hidden lg:table-cell text-xs">{j.scrapedAt ?? "-"}</TableCell>
                      <TableCell className="py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="rounded-lg">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/jobs/${j.id}/edit`}>Edit article</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/jobs/${j.id}/preview`}>Preview admin</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/jobs/${j.slug}`} target="_blank">
                                Open public page
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="divide-y divide-zinc-200 md:hidden">
          {jobs.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-500">
              Tidak ada lowongan pada filter ini.
            </div>
          ) : (
            jobs.map((j) => {
              const isSelected = selected.has(j.id)
              return (
                <div
                  key={j.id}
                  className={cn("flex items-start gap-3 p-3", isSelected && "bg-zinc-50")}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(v) => toggleOne(j.id, v)}
                    aria-label={`Select ${j.title}`}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <Link className="text-sm font-medium text-zinc-900 hover:underline" href={`/admin/jobs/${j.id}/edit`}>
                      {j.title}
                    </Link>
                    <div className="mt-1 text-xs text-zinc-600">{j.companyName}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      <span>{j.sourceName}</span>
                      <span>·</span>
                      <JobStatusBadge status={j.status} />
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/jobs/${j.id}/edit`}>Edit article</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/jobs/${j.id}/preview`}>Preview admin</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/jobs/${j.slug}`} target="_blank">
                          Open public page
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })
          )}
        </div>
      </div>

      <ConfirmDialog
        title={pendingAction === "publish" ? "Publish semua yang dipilih?" : "Kembalikan ke draft?"}
        description={
          pendingAction === "publish"
            ? `${selected.size} lowongan akan dipublikasikan dan tampil di sisi publik.`
            : `${selected.size} lowongan akan dikembalikan ke status draft.`
        }
        confirmLabel={pendingAction === "publish" ? "Publish" : "Set Draft"}
        open={pendingAction === "publish" || pendingAction === "draft"}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null)
        }}
        onConfirm={() => pendingAction && runBulk(pendingAction)}
      >
        <span className="hidden" />
      </ConfirmDialog>
    </div>
  )
}
