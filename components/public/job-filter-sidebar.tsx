"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import type { Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"]
const sources = ["Source Website", "Job Aggregator"]

function toParams(sp: URLSearchParams) {
  return new URLSearchParams(sp.toString())
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value.trim()) params.set(key, value.trim())
  else params.delete(key)
}

function FiltersForm({
  categories,
  initialCategory,
  initialJobType,
  initialSource,
  onApplied,
}: {
  categories: Category[]
  initialCategory?: string
  initialJobType?: string
  initialSource?: string
  onApplied?: () => void
}) {
  const router = useRouter()
  const sp = useSearchParams()
  const [category, setCategory] = React.useState(initialCategory ?? "")
  const [jobType, setJobType] = React.useState(initialJobType ?? "")
  const [source, setSource] = React.useState(initialSource ?? "")

  function apply() {
    const params = toParams(sp)
    setOrDelete(params, "category", category)
    setOrDelete(params, "jobType", jobType)
    setOrDelete(params, "source", source)
    params.delete("page")
    router.push(`/jobs?${params.toString()}`)
    onApplied?.()
  }

  function reset() {
    const params = toParams(sp)
    params.delete("category")
    params.delete("jobType")
    params.delete("source")
    params.delete("page")
    router.push(`/jobs?${params.toString()}`)
    setCategory("")
    setJobType("")
    setSource("")
    onApplied?.()
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="text-sm font-semibold text-foreground">Category</div>
        <Input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. IT & Software"
          className="h-11 rounded-2xl"
        />
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 8).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.name)}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-[hsl(var(--accent-soft))] hover:text-[hsl(var(--dark))]"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="text-sm font-semibold text-foreground">Job type</div>
        <div className="space-y-2">
          {jobTypes.map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="radio"
                name="jobType"
                checked={jobType === t}
                onChange={() => setJobType(t)}
              />
              {t}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="radio"
              name="jobType"
              checked={jobType === ""}
              onChange={() => setJobType("")}
            />
            All
          </label>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="text-sm font-semibold text-foreground">Source</div>
        <div className="space-y-2">
          {sources.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="radio"
                name="source"
                checked={source === s}
                onChange={() => setSource(s)}
              />
              {s}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="radio"
              name="source"
              checked={source === ""}
              onChange={() => setSource("")}
            />
            All
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          className="flex-1 rounded-2xl bg-[hsl(var(--dark))] text-white hover:bg-[hsl(var(--dark-soft))]"
          onClick={apply}
        >
          Apply
        </Button>
        <Button className="flex-1 rounded-2xl" variant="outline" onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  )
}

export function JobFilterSidebar({
  categories,
  category,
  jobType,
  source,
}: {
  categories: Category[]
  category?: string
  jobType?: string
  source?: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <div className="hidden md:block">
        <Card className="rounded-[28px] border-border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Filters</CardTitle>
            <div className="flex flex-wrap gap-2 pt-1">
              {category ? (
                <Badge
                  variant="outline"
                  className="border-border bg-[hsl(var(--muted))] text-[hsl(var(--primary))]"
                >
                  {category}
                </Badge>
              ) : null}
              {jobType ? (
                <Badge
                  variant="outline"
                  className="border-border bg-[hsl(var(--accent-soft))] text-[hsl(var(--dark))]"
                >
                  {jobType}
                </Badge>
              ) : null}
              {source ? (
                <Badge
                  variant="outline"
                  className="border-border bg-[hsl(var(--muted))] text-muted-foreground"
                >
                  {source}
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <FiltersForm
              categories={categories}
              initialCategory={category}
              initialJobType={jobType}
              initialSource={source}
            />
          </CardContent>
        </Card>
      </div>

      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full rounded-2xl">
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FiltersForm
                categories={categories}
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
