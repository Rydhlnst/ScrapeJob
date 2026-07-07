"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SlidersHorizontal } from "lucide-react"

import type { Category } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const jobTypes = ["full-time", "part-time", "contract", "freelance", "internship"]

function formatJobType(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-")
}

function optionId(group: string, value: string) {
  return `${group}-${value || "all"}`
}

function toParams(sp: URLSearchParams) {
  return new URLSearchParams(sp.toString())
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value.trim()) params.set(key, value.trim())
  else params.delete(key)
}

function FiltersForm({
  categories,
  sourceOptions,
  initialCategory,
  initialJobType,
  initialSource,
  onApplied,
}: {
  categories: Category[]
  sourceOptions: string[]
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

  React.useEffect(() => {
    setCategory(initialCategory ?? "")
  }, [initialCategory])

  React.useEffect(() => {
    setJobType(initialJobType ?? "")
  }, [initialJobType])

  React.useEffect(() => {
    setSource(initialSource ?? "")
  }, [initialSource])

  function apply() {
    const params = toParams(sp)
    setOrDelete(params, "category", category)
    setOrDelete(params, "jobType", jobType)
    setOrDelete(params, "source", source)
    params.delete("page")
    router.replace(`/jobs?${params.toString()}`)
    onApplied?.()
  }

  function reset() {
    const params = toParams(sp)
    params.delete("category")
    params.delete("jobType")
    params.delete("source")
    params.delete("page")
    router.replace(`/jobs?${params.toString()}`)
    setCategory("")
    setJobType("")
    setSource("")
    onApplied?.()
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="text-sm font-semibold text-foreground">Kategori</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("")}
            className={`relative z-10 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              category === ""
                ? "border-sky-100 bg-sky-50 text-sky-700"
                : "border-white bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            Semua
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={`relative z-10 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                category === item.id
                  ? "border-sky-100 bg-sky-50 text-sky-700"
                  : "border-white bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-700"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="text-sm font-semibold text-foreground">Tipe kerja</div>
        <RadioGroup value={jobType} onValueChange={setJobType} className="space-y-2">
          {jobTypes.map((value) => (
            <Label
              htmlFor={optionId("jobType", value)}
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white bg-white px-3 py-3 text-sm font-normal text-slate-600 transition-colors hover:border-sky-200 hover:text-foreground"
            >
              <RadioGroupItem id={optionId("jobType", value)} value={value} />
              {formatJobType(value)}
            </Label>
          ))}
          <Label
            htmlFor={optionId("jobType", "")}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white bg-white px-3 py-3 text-sm font-normal text-slate-600 transition-colors hover:border-sky-200 hover:text-foreground"
          >
            <RadioGroupItem id={optionId("jobType", "")} value="" />
            Semua
          </Label>
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="text-sm font-semibold text-foreground">Sumber</div>
        <RadioGroup value={source} onValueChange={setSource} className="space-y-2">
          {sourceOptions.map((value) => (
            <Label
              htmlFor={optionId("source", value)}
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white bg-white px-3 py-3 text-sm font-normal text-slate-600 transition-colors hover:border-sky-200 hover:text-foreground"
            >
              <RadioGroupItem id={optionId("source", value)} value={value} />
              {value}
            </Label>
          ))}
          <Label
            htmlFor={optionId("source", "")}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white bg-white px-3 py-3 text-sm font-normal text-slate-600 transition-colors hover:border-sky-200 hover:text-foreground"
          >
            <RadioGroupItem id={optionId("source", "")} value="" />
            Semua
          </Label>
        </RadioGroup>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          className="flex-1 rounded-2xl bg-[var(--brand-blue)] text-white hover:bg-blue-700"
          onClick={apply}
        >
          Terapkan
        </Button>
        <Button
          className="flex-1 rounded-2xl border-white bg-white hover:bg-white"
          variant="outline"
          onClick={reset}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}

export function JobFilterSidebar({
  categories,
  sourceOptions,
  category,
  jobType,
  source,
}: {
  categories: Category[]
  sourceOptions: string[]
  category?: string
  jobType?: string
  source?: string
}) {
  const [open, setOpen] = React.useState(false)
  const activeCategoryName =
    categories.find((item) => item.id === category || item.slug === category)?.name ??
    category

  return (
    <>
      <div className="hidden md:block">
        <Card className="rounded-[28px] border border-white bg-white shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-[0.12em] uppercase text-slate-500">
              Filters
            </CardTitle>
            <div className="flex flex-wrap gap-2 pt-1">
              {activeCategoryName ? (
                <Badge variant="outline" className="rounded-full border-sky-100 bg-sky-50 text-sky-700">
                  {activeCategoryName}
                </Badge>
              ) : null}
              {jobType ? (
                <Badge variant="outline" className="rounded-full border-white bg-white text-slate-600">
                  {formatJobType(jobType)}
                </Badge>
              ) : null}
              {source ? (
                <Badge variant="outline" className="rounded-full border-white bg-white text-slate-600">
                  {source}
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <FiltersForm
              categories={categories}
              sourceOptions={sourceOptions}
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
            <Button variant="outline" className="w-full rounded-[22px] border-white bg-white">
              <SlidersHorizontal className="mr-2 size-4" />
              Filter
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-auto rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Filter Lowongan</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FiltersForm
                categories={categories}
                sourceOptions={sourceOptions}
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

