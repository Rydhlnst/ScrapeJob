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
    <div className="w-full rounded-full bg-white p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-slate-200/60 focus-within:ring-2 focus-within:ring-[var(--brand-blue)]/50 focus-within:shadow-[0_2px_12px_rgba(59,130,246,0.15)]">
      <div className="grid items-center gap-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_180px_auto] md:gap-0">
        <div className="relative md:pr-2 md:after:absolute md:after:right-0 md:after:top-2 md:after:h-[calc(100%-16px)] md:after:w-px md:after:bg-slate-200">
          <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Posisi, perusahaan, atau kata kunci..."
            className="h-12 rounded-full border-0 bg-transparent pl-12 text-sm shadow-none focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === "Enter") submit()
            }}
          />
        </div>
        <div className="relative md:px-2 md:after:absolute md:after:right-0 md:after:top-2 md:after:h-[calc(100%-16px)] md:after:w-px md:after:bg-slate-200">
          <MapPin className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Lokasi (kota/provinsi)"
            className="h-12 rounded-full border-0 bg-transparent pl-12 text-sm shadow-none focus-visible:ring-0"
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
          <SelectTrigger className="h-12 rounded-full border-0 bg-transparent px-4 text-sm shadow-none focus-visible:ring-0">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-100 bg-white">
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
          className="grid h-12 min-w-12 place-items-center rounded-full bg-[var(--brand-blue)] px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 md:min-w-14"
        >
          <Search className="h-4 w-4 md:hidden" />
          <span className="hidden items-center gap-2 md:inline-flex">
            Cari lowongan
          </span>
        </button>
      </div>
    </div>
  )
}
