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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  createAdminLocation,
  deleteAdminLocation,
  listAdminLocations,
  updateAdminLocation,
  type AdminLocation,
} from "@/lib/api/locations"

const locationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  slug: z
    .string()
    .trim()
    .max(255)
    .optional()
    .default("")
    .refine((v) => v === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v), {
      message: "Slug: lowercase letters, numbers, dashes only",
    }),
  province: z.string().trim().max(255).optional().default(""),
})

type FormState = z.input<typeof locationSchema>

const emptyForm: FormState = { name: "", slug: "", province: "" }

export default function AdminLocationsPage() {
  const [rows, setRows] = React.useState<AdminLocation[]>([])
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
      const data = await listAdminLocations()
      setRows(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load locations"
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

  function openEdit(row: AdminLocation) {
    setEditingId(row.id)
    setForm({ name: row.name, slug: row.slug, province: row.province ?? "" })
    setDialogOpen(true)
  }

  async function submitForm() {
    const parsed = locationSchema.safeParse(form)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Form is invalid")
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: parsed.data.name,
        slug: parsed.data.slug || null,
        province: parsed.data.province || null,
      }
      if (editingId) {
        await updateAdminLocation(editingId, payload)
        toast.success("Location updated.")
      } else {
        await createAdminLocation(payload)
        toast.success("Location created.")
      }
      setDialogOpen(false)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save location.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAdminLocation(id)
      toast.success("Location deleted.")
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete location.")
    }
  }

  return (
    <AdminShell>
      <AdminHeader
        title="Locations"
        description="Master data lokasi untuk filter dan tagging job listing."
      />

      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none" onClick={openCreate}>
              + Add location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit location" : "Add location"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</span>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jakarta" />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Slug (optional)</span>
                <Input value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="jakarta" />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Province</span>
                <Input value={form.province ?? ""} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="DKI Jakarta" />
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-none" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="rounded-none" onClick={submitForm} disabled={submitting}>
                {submitting ? "Saving..." : editingId ? "Save changes" : "Create location"}
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
                <TableHead>Slug</TableHead>
                <TableHead>Province</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    No locations yet.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.slug}</TableCell>
                    <TableCell>{row.province ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button size="sm" variant="outline" className="rounded-none" onClick={() => openEdit(row)}>
                          Edit
                        </Button>
                        <ConfirmButton
                          label="Delete"
                          title="Delete this location?"
                          description={<>&ldquo;{row.name}&rdquo; will be removed. Jobs already tagged with this location keep the string.</>}
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
