"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

  function submit() {
    const params = new URLSearchParams(sp.toString())
    if (keyword.trim()) params.set("keyword", keyword.trim())
    else params.delete("keyword")
    if (location.trim()) params.set("location", location.trim())
    else params.delete("location")
    if (sort) params.set("sort", sort)
    params.delete("page")
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_1fr_220px_160px]">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Posisi / perusahaan / keyword"
          className="h-12 rounded-2xl pl-11"
          onKeyDown={(e) => {
            if (e.key === "Enter") submit()
          }}
        />
      </div>
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Lokasi (kota/provinsi)"
          className="h-12 rounded-2xl pl-11"
          onKeyDown={(e) => {
            if (e.key === "Enter") submit()
          }}
        />
      </div>
      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className="h-12 rounded-2xl">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Terbaru</SelectItem>
          <SelectItem value="relevance">Relevansi</SelectItem>
          <SelectItem value="company">Nama perusahaan</SelectItem>
        </SelectContent>
      </Select>
      <Button
        className="h-12 rounded-2xl bg-[hsl(var(--dark))] text-white hover:bg-[hsl(var(--dark-soft))]"
        onClick={submit}
      >
        Cari
      </Button>
    </div>
  )
}
