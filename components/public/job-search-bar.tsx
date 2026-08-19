"use client"

import * as React from "react"
import type { ReadonlyURLSearchParams } from "next/navigation"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function buildJobsUrl(
  sp: ReadonlyURLSearchParams,
  values: { keyword: string; location: string; sort: string },
) {
  const params = new URLSearchParams(sp.toString())

  if (values.keyword.trim()) params.set("keyword", values.keyword.trim())
  else params.delete("keyword")

  if (values.location.trim()) params.set("location", values.location.trim())
  else params.delete("location")

  if (values.sort) params.set("sort", values.sort)
  else params.delete("sort")

  params.delete("page")

  return `/jobs?${params.toString()}`
}

export function JobSearchBar({
  defaultKeyword,
  defaultLocation,
  defaultSort,
}: {
  defaultKeyword?: string
  defaultLocation?: string
  defaultSort?: string
}) {
  const router = useRouter()
  const sp = useSearchParams()
  const [keyword, setKeyword] = React.useState(defaultKeyword ?? "")
  const [location, setLocation] = React.useState(defaultLocation ?? "")
  const [sort, setSort] = React.useState(defaultSort ?? "newest")
  const initializedRef = React.useRef(false)
  const lastUrlRef = React.useRef("")

  React.useEffect(() => {
    setKeyword(defaultKeyword ?? "")
  }, [defaultKeyword])

  React.useEffect(() => {
    setLocation(defaultLocation ?? "")
  }, [defaultLocation])

  React.useEffect(() => {
    setSort(defaultSort ?? "newest")
  }, [defaultSort])

  const submit = React.useCallback(
    (nextValues?: { keyword: string; location: string; sort: string }) => {
      const values = nextValues ?? { keyword, location, sort }
      const url = buildJobsUrl(sp, values)

      if (url === lastUrlRef.current) return

      lastUrlRef.current = url
      router.replace(url)
    },
    [keyword, location, router, sort, sp],
  )

  React.useEffect(() => {
    const nextUrl = buildJobsUrl(sp, { keyword, location, sort })

    if (!initializedRef.current) {
      initializedRef.current = true
      lastUrlRef.current = nextUrl
      return
    }

    const timer = window.setTimeout(() => {
      submit({ keyword, location, sort })
    }, 500)

    return () => window.clearTimeout(timer)
  }, [keyword, location, sort, sp, submit])

  return (
    <div className="grid w-full items-center gap-2 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_180px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Posisi, perusahaan, atau kata kunci..."
          className="h-12 w-full rounded-xl border border-black/10 bg-white pl-11 pr-4 text-sm text-slate-900 shadow-none transition-colors placeholder:text-slate-400 hover:border-[#3f95e8] focus-visible:border-[#3f95e8] focus-visible:ring-2 focus-visible:ring-[#3f95e8]/15"
          onKeyDown={(e) => {
            if (e.key === "Enter") submit()
          }}
        />
      </div>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Lokasi (kota/provinsi)"
          className="h-12 w-full rounded-xl border border-black/10 bg-white pl-11 pr-4 text-sm text-slate-900 shadow-none transition-colors placeholder:text-slate-400 hover:border-[#3f95e8] focus-visible:border-[#3f95e8] focus-visible:ring-2 focus-visible:ring-[#3f95e8]/15"
          onKeyDown={(e) => {
            if (e.key === "Enter") submit()
          }}
        />
      </div>
      <Select
        value={sort}
        onValueChange={(value) => {
          setSort(value)
          submit({ keyword, location, sort: value })
        }}
      >
        <SelectTrigger className="!h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-slate-700 shadow-none transition-colors hover:border-[#3f95e8] focus-visible:border-[#3f95e8] focus-visible:ring-2 focus-visible:ring-[#3f95e8]/15 [&>svg]:text-slate-400">
          <SelectValue placeholder="Urutkan" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-black/10 bg-white">
          <SelectItem value="newest">Terbaru</SelectItem>
          <SelectItem value="oldest">Terlama</SelectItem>
          <SelectItem value="relevance">Relevansi</SelectItem>
          <SelectItem value="company">Nama perusahaan</SelectItem>
        </SelectContent>
      </Select>
      <button
        type="button"
        onClick={() => submit()}
        aria-label="Cari lowongan"
        className="inline-flex h-12 min-w-12 items-center justify-center gap-2 rounded-xl bg-[#1f5f9f] px-6 text-sm font-semibold text-white shadow-[0_3px_0_rgba(23,23,23,.12)] transition-colors hover:bg-[#2479d1] md:min-w-14"
      >
        <Search className="h-4 w-4 md:hidden" />
        <span className="hidden md:inline">Cari</span>
      </button>
    </div>
  )
}
