"use client"

import * as React from "react"
import { MoreHorizontal, Plus } from "lucide-react"
import { toast } from "sonner"

import type { Category } from "@/types"
import { createAdminCategory, deleteAdminCategory, updateAdminCategory } from "@/lib/api/admin-categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

export function CategoryTable({ categories }: { categories: Category[] }) {
  const [rows, setRows] = React.useState(categories)
  const [query, setQuery] = React.useState("")
  const [editing, setEditing] = React.useState<Category | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => setRows(categories), [categories])

  function openCreate() {
    setEditing(null)
    setName("")
    setDescription("")
    setDialogOpen(true)
  }

  function openEdit(category: Category) {
    setEditing(category)
    setName(category.name)
    setDescription(category.description ?? "")
    setDialogOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error("Category name is required.")
      return
    }

    setSaving(true)
    try {
      const payload = { name: trimmedName, description: description.trim() || null }
      if (editing) {
        const updated = await updateAdminCategory(editing.id, payload)
        setRows((current) => current.map((row) => row.id === updated.id ? updated : row))
        toast.success("Category updated.")
      } else {
        const created = await createAdminCategory(payload)
        setRows((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)))
        toast.success("Category created.")
      }
      setEditing(null)
      setDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save category.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAdminCategory(id)
      setRows((current) => current.filter((row) => row.id !== id))
      toast.success("Category deleted.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete category.")
    }
  }

  const filteredRows = rows.filter((category) => {
    const value = query.trim().toLowerCase()
    return !value || [category.name, category.slug, category.description ?? ""].some((field) => field.toLowerCase().includes(value))
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm font-semibold text-slate-900">Categories</div>
        <div className="flex w-full gap-2 md:w-auto">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories" />
          <Button onClick={openCreate} className="rounded-lg bg-zinc-900 text-white hover:bg-zinc-800">
            <Plus className="mr-2 h-4 w-4" />
            New
          </Button>
        </div>
      </div>
      <div className="border border-slate-200 bg-white shadow-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Total Jobs</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-slate-900">{c.name}</TableCell>
                <TableCell className="text-slate-600">{c.slug}</TableCell>
                <TableCell className="text-slate-600">{c.description ?? "-"}</TableCell>
                <TableCell className="text-slate-600">{c.totalJobs ?? "-"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openEdit(c)}>
                        Edit
                      </DropdownMenuItem>
                      <ConfirmDialog
                        title="Delete category?"
                        description="This category will be permanently removed."
                        confirmLabel="Delete"
                        onConfirm={() => { void handleDelete(c.id) }}
                      >
                        <DropdownMenuItem
                          className="text-rose-600 focus:text-rose-600"
                          onSelect={(e) => e.preventDefault()}
                        >
                          Delete
                        </DropdownMenuItem>
                      </ConfirmDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
            <DialogDescription>Keep public category labels clear and consistent.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input id="category-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Engineering" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea id="category-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional description" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Create category"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
