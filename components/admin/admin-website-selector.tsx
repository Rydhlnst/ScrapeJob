"use client"

import * as React from "react"
import { Globe2 } from "lucide-react"

import { listWebsites, getActiveWebsiteId, setActiveWebsiteId } from "@/lib/api/websites"
import type { Website } from "@/types/website"
import { NativeSelect } from "@/components/ui/native-select"

export function AdminWebsiteSelector() {
  const [websites, setWebsites] = React.useState<Website[]>([])
  const [activeId, setActiveId] = React.useState<string>("")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    listWebsites()
      .then((items) => {
        if (cancelled) return
        const active = items.filter((item) => item.isActive)
        setWebsites(active)
        const saved = getActiveWebsiteId()
        const selected = active.find((item) => item.id === saved) ?? active[0]
        if (selected) {
          setActiveId(selected.id)
          setActiveWebsiteId(selected.id)
        }
      })
      .catch(() => setWebsites([]))
      .finally(() => setLoading(false))
    return () => { cancelled = true }
  }, [])

  return (
    <label className="flex min-w-0 items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5">
      <Globe2 className="size-3.5 shrink-0 text-zinc-500" aria-hidden="true" />
      <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400 sm:inline">Website</span>
      <NativeSelect
        aria-label="Active website"
        value={activeId}
        disabled={loading || websites.length === 0}
        onChange={(event) => {
          setActiveId(event.target.value)
          setActiveWebsiteId(event.target.value)
        }}
        className="h-7 min-w-[150px] border-0 bg-transparent px-1 py-0 text-xs font-semibold text-zinc-800 shadow-none focus:ring-0"
      >
        {loading ? <option value="">Loading websites…</option> : null}
        {!loading && websites.length === 0 ? <option value="">No active websites</option> : null}
        {websites.map((website) => <option key={website.id} value={website.id}>{website.name}</option>)}
      </NativeSelect>
    </label>
  )
}
