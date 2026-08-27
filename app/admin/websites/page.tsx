"use client"

import * as React from "react"
import { Globe2, Plus, Power, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { listWebsites, createWebsite, updateWebsite } from "@/lib/api/websites"
import type { Website } from "@/types/website"

export default function WebsitesPage() {
  const [websites, setWebsites] = React.useState<Website[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [name, setName] = React.useState("")
  const [domain, setDomain] = React.useState("")

  async function load() {
    setLoading(true)
    try { setWebsites(await listWebsites()) } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to load websites.") } finally { setLoading(false) }
  }

  React.useEffect(() => { void load() }, [])

  async function addWebsite(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || !domain.trim()) return toast.error("Name and domain are required.")
    setSaving(true)
    try {
      await createWebsite({ name: name.trim(), domain: domain.trim() })
      setName(""); setDomain(""); await load(); toast.success("Website added.")
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to add website.") } finally { setSaving(false) }
  }

  async function toggle(website: Website) {
    try { await updateWebsite(website.id, { isActive: !website.isActive }); await load(); toast.success(website.isActive ? "Website disabled." : "Website enabled.") }
    catch (error) { toast.error(error instanceof Error ? error.message : "Failed to update website.") }
  }

  return (
    <AdminShell>
      <AdminHeader title="Websites" description="Manage public sites connected to the Central CMS." />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex-row items-center justify-between border-b border-zinc-100">
            <CardTitle className="text-base">Connected websites</CardTitle>
            <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className="mr-2 size-3.5" />Refresh</Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <p className="p-6 text-sm text-zinc-500">Loading websites…</p> : websites.length === 0 ? <p className="p-6 text-sm text-zinc-500">No websites configured.</p> : websites.map((website) => (
              <div key={website.id} className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 last:border-0">
                <div className="flex min-w-0 items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-zinc-100"><Globe2 className="size-4 text-zinc-500" /></div><div className="min-w-0"><p className="truncate text-sm font-semibold text-zinc-900">{website.name}</p><p className="truncate text-xs text-zinc-500">{website.domain}</p>{website.domains?.length ? <p className="mt-1 truncate text-[11px] text-zinc-400">Aliases: {website.domains.filter((domain) => !domain.isPrimary).map((domain) => domain.host).join(", ")}</p> : null}</div></div>
                <Button size="sm" variant="outline" onClick={() => void toggle(website)}><Power className="mr-2 size-3.5" />{website.isActive ? "Disable" : "Enable"}</Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="h-fit border-zinc-200 shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Plus className="size-4" />Add website</CardTitle></CardHeader>
          <CardContent><form className="space-y-4" onSubmit={addWebsite}><label className="block space-y-1.5 text-sm font-medium">Name<Input value={name} onChange={(event) => setName(event.target.value)} placeholder="KerjaKita.id" /></label><label className="block space-y-1.5 text-sm font-medium">Domain<Input value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="kerjakita.id" /></label><Button className="w-full" disabled={saving}>{saving ? "Adding…" : "Add website"}</Button></form></CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}
