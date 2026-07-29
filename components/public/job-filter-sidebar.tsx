"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { RotateCcw, SlidersHorizontal, X } from "lucide-react"

import type { Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const jobTypes = ["full-time", "part-time", "contract", "freelance", "internship"]

function formatJobType(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-")
}

function toParams(sp: URLSearchParams) {
  return new URLSearchParams(sp.toString())
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value.trim()) params.set(key, value.trim())
  else params.delete(key)
}

type Counts = {
  category?: Record<string, number>
  jobType?: Record<string, number>
  source?: Record<string, number>
}

function FilterOptionRow({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean
  label: string
  count?: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl bg-white px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-accent text-accent-foreground ring-1 ring-accent"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <span className="truncate text-left">{label}</span>
      {typeof count === "number" ? (
        <span
          className={cn(
            "shrink-0 text-xs font-semibold tabular-nums",
            active ? "text-accent-foreground" : "text-muted-foreground",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  )
}

function FiltersForm({
  categories,
  sourceOptions,
  counts,
  initialCategory,
  initialJobType,
  initialSource,
  onApplied,
}: {
  categories: Category[]
  sourceOptions: string[]
  counts?: Counts
  initialCategory?: string
  initialJobType?: string
  initialSource?: string
  onApplied?: () => void
}) {
  const router = useRouter()
  const sp = useSearchParams()

  const apply = React.useCallback(
    (next: { category?: string; jobType?: string; source?: string }) => {
      const params = toParams(sp)
      setOrDelete(params, "category", next.category ?? "")
      setOrDelete(params, "jobType", next.jobType ?? "")
      setOrDelete(params, "source", next.source ?? "")
      params.delete("page")
      router.replace(`/jobs?${params.toString()}`)
      onApplied?.()
    },
    [sp, router, onApplied],
  )

  const resetAll = React.useCallback(() => {
    apply({ category: "", jobType: "", source: "" })
  }, [apply])

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50/70 p-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Kategori
        </div>
        <div className="space-y-0.5">
          <FilterOptionRow
            active={!initialCategory}
            label="Semua kategori"
            onClick={() => apply({ category: "", jobType: initialJobType, source: initialSource })}
          />
          {categories.map((item) => (
            <FilterOptionRow
              key={item.id}
              active={initialCategory === item.id || initialCategory === item.slug}
              label={item.name}
              count={counts?.category?.[item.id] ?? counts?.category?.[item.slug]}
              onClick={() =>
                apply({ category: item.id, jobType: initialJobType, source: initialSource })
              }
            />
          ))}
        </div>
      </div>

      <Separator />

      <div className="rounded-2xl bg-slate-50/70 p-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Tipe kerja
        </div>
        <div className="space-y-0.5">
          <FilterOptionRow
            active={!initialJobType}
            label="Semua tipe"
            onClick={() =>
              apply({ category: initialCategory, jobType: "", source: initialSource })
            }
          />
          {jobTypes.map((value) => (
            <FilterOptionRow
              key={value}
              active={initialJobType === value}
              label={formatJobType(value)}
              count={counts?.jobType?.[value]}
              onClick={() =>
                apply({ category: initialCategory, jobType: value, source: initialSource })
              }
            />
          ))}
        </div>
      </div>

      <Separator />

      <div className="rounded-2xl bg-slate-50/70 p-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Sumber
        </div>
        <div className="space-y-0.5">
          <FilterOptionRow
            active={!initialSource}
            label="Semua sumber"
            onClick={() =>
              apply({ category: initialCategory, jobType: initialJobType, source: "" })
            }
          />
          {sourceOptions.map((value) => (
            <FilterOptionRow
              key={value}
              active={initialSource === value}
              label={value}
              count={counts?.source?.[value]}
              onClick={() =>
                apply({ category: initialCategory, jobType: initialJobType, source: value })
              }
            />
          ))}
        </div>
      </div>

      {initialCategory || initialJobType || initialSource ? (
        <Button
          variant="outline"
          className="w-full rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          onClick={resetAll}
        >
          <RotateCcw className="mr-2 size-4" />
          Reset semua filter
        </Button>
      ) : null}
    </div>
  )
}

function ActiveFilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground ring-1 ring-accent transition-colors hover:bg-accent/80"
    >
      {label}
      <X className="size-3" />
    </button>
  )
}

function ActiveFiltersBar({
  categoryLabel,
  jobType,
  source,
  onClear,
}: {
  categoryLabel?: string
  jobType?: string
  source?: string
  onClear: (key: "category" | "jobType" | "source") => void
}) {
  const hasAny = categoryLabel || jobType || source
  if (!hasAny) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 pb-3">
      {categoryLabel ? (
        <ActiveFilterChip label={categoryLabel} onRemove={() => onClear("category")} />
      ) : null}
      {jobType ? (
        <ActiveFilterChip label={formatJobType(jobType)} onRemove={() => onClear("jobType")} />
      ) : null}
      {source ? <ActiveFilterChip label={source} onRemove={() => onClear("source")} /> : null}
    </div>
  )
}

export function JobFilterSidebar({
  categories,
  sourceOptions,
  counts,
  category,
  jobType,
  source,
}: {
  categories: Category[]
  sourceOptions: string[]
  counts?: Counts
  category?: string
  jobType?: string
  source?: string
}) {
  const router = useRouter()
  const sp = useSearchParams()
  const [open, setOpen] = React.useState(false)

  const activeCategoryName =
    categories.find((item) => item.id === category || item.slug === category)?.name ?? category

  const clearOne = React.useCallback(
    (key: "category" | "jobType" | "source") => {
      const params = toParams(sp)
      params.delete(key)
      params.delete("page")
      router.replace(`/jobs?${params.toString()}`)
    },
    [sp, router],
  )

  return (
    <>
      <div className="hidden md:block">
        <div className="sticky top-24">
          <Card className="rounded-2xl border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-[0.12em] uppercase text-slate-500">
                <SlidersHorizontal className="size-4" />
                Filter
              </CardTitle>
              <ActiveFiltersBar
                categoryLabel={activeCategoryName}
                jobType={jobType}
                source={source}
                onClear={clearOne}
              />
            </CardHeader>
            <CardContent>
              <FiltersForm
                categories={categories}
                sourceOptions={sourceOptions}
                counts={counts}
                initialCategory={category}
                initialJobType={jobType}
                initialSource={source}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full rounded-xl border-slate-200 bg-white">
              <SlidersHorizontal className="mr-2 size-4" />
              Filter
              {(activeCategoryName ? 1 : 0) + (jobType ? 1 : 0) + (source ? 1 : 0) > 0 ? (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                  {(activeCategoryName ? 1 : 0) + (jobType ? 1 : 0) + (source ? 1 : 0)}
                </span>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-auto rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Filter Lowongan</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <ActiveFiltersBar
                categoryLabel={activeCategoryName}
                jobType={jobType}
                source={source}
                onClear={clearOne}
              />
              <FiltersForm
                categories={categories}
                sourceOptions={sourceOptions}
                counts={counts}
                initialCategory={category}
                initialJobType={jobType}
                initialSource={source}
                onApplied={() => setOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
