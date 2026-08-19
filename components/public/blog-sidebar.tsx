"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, ChevronDown, ChevronUp, Search } from "lucide-react"

import { listPublicPages } from "@/lib/api/pages"

export function TableOfContents() {
  const [open, setOpen] = React.useState(true)
  const [headings, setHeadings] = React.useState<Array<{ id: string; text: string; level: number }>>([])

  React.useEffect(() => {
    const elements = document.querySelectorAll("article h2, article h3")
    const items = Array.from(elements).map((el) => {
      const id = el.id || el.textContent?.toLowerCase().replace(/\s+/g, "-") || ""
      if (!el.id) el.id = id
      return {
        id,
        text: el.textContent || "",
        level: el.tagName === "H2" ? 2 : 3,
      }
    })
    setHeadings(items)
  }, [])

  if (headings.length === 0) return null

  return (
    <div className="rounded-[22px] border border-black/10 bg-white p-5 shadow-[0_4px_0_rgba(23,23,23,.04)]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-900"
      >
        Daftar Isi
        {open ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
      </button>
      {open ? (
        <nav className="mt-3 space-y-1.5">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`block text-xs text-slate-500 hover:text-[var(--brand-blue)] ${
                heading.level === 3 ? "pl-4" : ""
              }`}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  )
}

export function ArticleSearch() {
  const [query, setQuery] = React.useState("")

  return (
    <div className="rounded-[22px] border border-black/10 bg-white p-5 shadow-[0_4px_0_rgba(23,23,23,.04)]">
      <h3 className="text-sm font-semibold text-slate-900">Cari Artikel</h3>
      <div className="relative mt-3">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ketik kata kunci..."
          className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-4 text-xs text-slate-700 outline-none transition-colors placeholder:text-slate-400 hover:border-[#3f95e8] focus:border-[#3f95e8] focus:ring-2 focus:ring-[#3f95e8]/15"
        />
      </div>
    </div>
  )
}

export function RecentPostsSidebar({ currentSlug }: { currentSlug: string }) {
  const [pages, setPages] = React.useState<Array<{ id: string; title: string; slug: string; summary?: string | null; publishedAt?: string | null }>>([])

  React.useEffect(() => {
    listPublicPages(6).then((res) => {
      setPages(res.data.filter((p) => p.slug !== currentSlug).slice(0, 3))
    }).catch(() => {})
  }, [currentSlug])

  if (pages.length === 0) return null

  return (
    <div className="rounded-[22px] border border-black/10 bg-white p-5 shadow-[0_4px_0_rgba(23,23,23,.04)]">
      <h3 className="text-sm font-semibold text-slate-900">Recent Post</h3>
      <div className="mt-3 space-y-3">
        {pages.map((page) => (
          <Link
            key={page.id}
            href={`/page/${page.slug}`}
            className="group flex gap-3"
          >
            <div className="size-16 shrink-0 rounded-xl border border-black/10 bg-[#f7f9fb]" />
            <div className="min-w-0 flex-1">
              <h4 className="line-clamp-2 text-xs font-semibold text-slate-900 group-hover:text-[var(--brand-blue)]">
                {page.title}
              </h4>
              <div className="mt-1 text-[10px] text-slate-400">
                {page.publishedAt
                  ? new Date(page.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                  : ""}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function UpdateGratisCTA() {
  return (
    <div className="rounded-[22px] bg-[#1f5f9f] p-5 text-white shadow-[0_5px_0_rgba(23,23,23,.08)]">
      <h3 className="text-lg font-bold">Update Gratis</h3>
      <p className="mt-2 text-xs leading-5 text-white/75">
        Dapatkan info lowongan terbaru dan tips karier langsung ke WhatsApp Anda.
      </p>
      <a
        href="/jobs"
        className="mt-4 block w-full rounded-full bg-white py-2.5 text-center text-sm font-semibold text-[#1f5f9f] transition-colors hover:bg-[#f7f9fb] hover:text-[#2479d1]"
      >
        Cari Lowongan
      </a>
    </div>
  )
}
