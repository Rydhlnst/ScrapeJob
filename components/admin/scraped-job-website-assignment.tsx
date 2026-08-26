"use client"

import * as React from "react"
import { Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/components/ui/native-select"
import { getScrapedJobAssignments, listWebsites, saveScrapedJobAssignments } from "@/lib/api/websites"
import type { Website, WebsiteJobStatus } from "@/types/website"

const statuses: Array<{ value: WebsiteJobStatus; label: string }> = [
  { value: "unused", label: "Unused" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "expired", label: "Expired" },
  { value: "nonaktif", label: "Nonaktif" },
]

export function ScrapedJobWebsiteAssignment({ scrapedJobId }: { scrapedJobId: string }) {
  const [websites, setWebsites] = React.useState<Website[]>([])
  const [values, setValues] = React.useState<Record<string, WebsiteJobStatus>>({})
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    Promise.all([listWebsites(), getScrapedJobAssignments(scrapedJobId)])
      .then(([siteRows, assignments]) => {
        if (cancelled) return
        const next = Object.fromEntries(siteRows.map((site) => [site.id, "unused" as WebsiteJobStatus]))
        assignments.forEach((assignment) => { next[assignment.websiteId] = assignment.status })
        setWebsites(siteRows)
        setValues(next)
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to load website assignments."))
      .finally(() => setLoading(false))
    return () => { cancelled = true }
  }, [scrapedJobId])

  async function save() {
    setSaving(true)
    try {
      await saveScrapedJobAssignments(scrapedJobId, Object.entries(values).map(([website_id, status]) => ({ website_id, status })))
      toast.success("Website distribution saved.")
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to save website distribution.") } finally { setSaving(false) }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-zinc-900">Website distribution</p><p className="text-xs text-zinc-500">Choose an independent status for each public website.</p></div><Button size="sm" onClick={() => void save()} disabled={loading || saving || websites.length === 0}>{saving ? <Loader2 className="mr-2 size-3.5 animate-spin" /> : <Check className="mr-2 size-3.5" />}{saving ? "Saving…" : "Save"}</Button></div>
      {loading ? <p className="text-xs text-zinc-500">Loading website assignments…</p> : websites.length === 0 ? <p className="text-xs text-zinc-500">No active websites configured.</p> : <div className="space-y-2">{websites.map((website) => <label key={website.id} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2"><span className="min-w-0"><span className="block truncate text-sm font-medium text-zinc-800">{website.name}</span><span className="block truncate text-xs text-zinc-500">{website.domain}</span></span><NativeSelect size="sm" aria-label={`Status for ${website.name}`} value={values[website.id] ?? "unused"} onChange={(event) => setValues((current) => ({ ...current, [website.id]: event.target.value as WebsiteJobStatus }))}><option value="unused">Unused</option>{statuses.filter((item) => item.value !== "unused").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</NativeSelect></label>)}</div>}
    </div>
  )
}
