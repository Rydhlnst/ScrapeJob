"use client"

import * as React from "react"
import { toast } from "sonner"
import { z } from "zod"

import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { ConfirmButton } from "@/components/admin/confirm-button"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  createAdminJobSource,
  deleteAdminJobSource,
  listAdminJobSources,
  updateAdminJobSource,
  type JobSource,
} from "@/lib/api/job-sources"

const jobSourceSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  base_url: z.string().trim().url("Base URL must be a valid URL"),
  listing_url: z.string().trim().url("Listing URL must be valid").optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().default(""),
  is_active: z.boolean().default(true),
  scraping_allowed: z.boolean().default(true),
})

type FormState = z.input<typeof jobSourceSchema>

const emptyForm: FormState = {
  name: "",
  base_url: "",
  listing_url: "",
  notes: "",
  is_active: true,
  scraping_allowed: true,
}

export default function AdminJobSourcesPage() {
  const [rows, setRows] = React.useState<JobSource[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [submitting, setSubmitting] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listAdminJobSources()
      setRows(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load job sources"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(row: JobSource) {
    setEditingId(row.id)
    setForm({
      name: row.name,
      base_url: row.baseUrl,
      listing_url: row.listingUrl ?? "",
      notes: row.notes ?? "",
      is_active: row.isActive,
      scraping_allowed: row.scrapingAllowed,
    })
    setDialogOpen(true)
  }

  async function submitForm() {
    const parsed = jobSourceSchema.safeParse(form)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Form is invalid")
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: parsed.data.name,
        base_url: parsed.data.base_url,
        listing_url: parsed.data.listing_url || null,
        notes: parsed.data.notes || null,
        is_active: parsed.data.is_active,
        scraping_allowed: parsed.data.scraping_allowed,
      }
      if (editingId) {
        await updateAdminJobSource(editingId, payload)
        toast.success("Job source updated.")
      } else {
        await createAdminJobSource(payload)
        toast.success("Job source created.")
      }
      setDialogOpen(false)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save job source.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAdminJobSource(id)
      toast.success("Job source deleted.")
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete job source.")
    }
  }

  return (
    <AdminShell>
      <AdminHeader
        title="Job Sources"
        description="Master data website sumber scraping. Toggle isActive untuk mengaktifkan/nonaktifkan sumber."
      />

      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none" onClick={openCreate}>
              + Add source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit job source" : "Add job source"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</span>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Glints"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Base URL</span>
                <Input
                  value={form.base_url}
                  onChange={(e) => setForm({ ...form, base_url: e.target.value })}
                  placeholder="https://glints.com"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Listing URL</span>
                <Input
                  value={form.listing_url ?? ""}
                  onChange={(e) => setForm({ ...form, listing_url: e.target.value })}
                  placeholder="https://glints.com/id/lowongan-kerja"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</span>
                <Textarea
                  value={form.notes ?? ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any implementation notes about this source"
                />
              </label>
              <div className="flex gap-4 pt-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.scraping_allowed}
                    onChange={(e) => setForm({ ...form, scraping_allowed: e.target.checked })}
                  />
                  Scraping allowed
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-none" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="rounded-none" onClick={submitForm} disabled={submitting}>
                {submitting ? "Saving..." : editingId ? "Save changes" : "Create source"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : loading ? (
        <div className="border border-border bg-card p-4 text-sm text-muted-foreground">Loading...</div>
      ) : (
        <div className="border border-border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Base URL</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Allowed</TableHead>
                <TableHead>Last scraped</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No job sources yet — add one to enable scraping.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground">{row.baseUrl}</TableCell>
                    <TableCell>{row.isActive ? "Yes" : "No"}</TableCell>
                    <TableCell>{row.scrapingAllowed ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {row.lastScrapedAt ? new Date(row.lastScrapedAt).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button size="sm" variant="outline" className="rounded-none" onClick={() => openEdit(row)}>
                          Edit
                        </Button>
                        <ConfirmButton
                          label="Delete"
                          title="Delete this job source?"
                          description={<>&ldquo;{row.name}&rdquo; will be removed from the master list. Scraped jobs already ingested from this source stay.</>}
                          confirmLabel="Delete"
                          onConfirm={() => handleDelete(row.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminShell>
  )
}
