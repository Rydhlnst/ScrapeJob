"use client"

import * as React from "react"
import type { ReadonlyURLSearchParams } from "next/navigation"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
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
    <div className="grid items-stretch gap-3 xl:grid-cols-[minmax(0,1fr)_180px]">
      <div className="rounded-none border border-white/80 bg-white/92 p-2 shadow-[var(--shadow-sm)]">
        <div className="grid items-center gap-2 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_220px] md:gap-0">
          <div className="relative md:pr-2 md:after:absolute md:after:right-0 md:after:top-2 md:after:h-[calc(100%-16px)] md:after:w-px md:after:bg-slate-200">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Posisi / perusahaan / keyword"
              className="h-12 border-0 bg-transparent pl-11 shadow-none focus-visible:ring-0"
              onKeyDown={(e) => {
                if (e.key === "Enter") submit()
              }}
            />
          </div>
          <div className="relative md:px-2 md:after:absolute md:after:right-0 md:after:top-2 md:after:h-[calc(100%-16px)] md:after:w-px md:after:bg-slate-200">
            <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lokasi (kota/provinsi)"
              className="h-12 border-0 bg-transparent pl-11 shadow-none focus-visible:ring-0"
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
            <SelectTrigger className="h-12 rounded-none border-0 bg-white px-4 shadow-none focus-visible:ring-0">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="border-[var(--brand-shell-strong)] bg-white">
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="oldest">Terlama</SelectItem>
              <SelectItem value="relevance">Relevansi</SelectItem>
              <SelectItem value="company">Nama perusahaan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        className="h-[60px] rounded-none bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700"
        onClick={() => submit()}
      >
        Cari
      </Button>
    </div>
  )
}
