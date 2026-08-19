"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const popularSearches = [
  { label: "Remote" },
  { label: "Jakarta" },
  { label: "Frontend Developer" },
  { label: "Admin" },
  { label: "Magang" },
  { label: "Full-time" },
]

export function HeroSearch() {
  const router = useRouter()
  const [keyword, setKeyword] = React.useState("")
  const [location, setLocation] = React.useState("")

  function go(nextKeyword?: string) {
    const params = new URLSearchParams()
    const kw = (nextKeyword ?? keyword).trim()
    const loc = location.trim()
    if (kw) params.set("keyword", kw)
    if (loc) params.set("location", loc)
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <div className="rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_6px_0_rgba(23,23,23,.04)] md:p-6">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex-1">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Posisi, perusahaan, atau kata kunci"
            className="h-12"
          />
        </div>
        <div className="flex-1">
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Kota atau provinsi"
            className="h-12"
          />
        </div>
        <Button
          className="h-12 bg-[#1f5f9f] px-8 text-white shadow-[0_3px_0_rgba(23,23,23,.12)] hover:bg-[#2479d1]"
          onClick={() => go()}
        >
          Cari Lowongan
        </Button>
      </div>
      <div className="mt-5 border-t pt-5">
        <p className="mb-3 text-sm text-slate-500">Pencarian populer:</p>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => go(s.label)}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-[#3f95e8]/50 hover:bg-[#f7f9fb] hover:text-[#171717]"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
