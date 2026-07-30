"use client"

import * as React from "react"
import { Plus, Pencil, Trash2, Key, X, Check } from "lucide-react"

import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUsers, createUser, updateUser, deleteUser, type AdminUser } from "@/lib/api/settings"

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700 border-purple-200",
  admin: "bg-blue-100 text-blue-700 border-blue-200",
  editor: "bg-sky-100 text-sky-700 border-sky-200",
}

type FormMode = { type: "create" } | { type: "edit"; user: AdminUser } | null

export default function UsersSettingsPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([])
  const [roles, setRoles] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [formMode, setFormMode] = React.useState<FormMode>(null)
  const [deleteConfirm, setDeleteConfirm] = React.useState<number | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [role, setRole] = React.useState("")

  function openCreate() {
    setName(""); setEmail(""); setPassword(""); setRole(roles[0] ?? "admin")
    setFormError(null); setFormMode({ type: "create" })
  }

  function openEdit(user: AdminUser) {
    setName(user.name); setEmail(user.email); setPassword(""); setRole(user.role ?? "")
    setFormError(null); setFormMode({ type: "edit", user })
  }

  function closeForm() { setFormMode(null); setFormError(null) }

  React.useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await getUsers()
      setUsers(data.users)
      setRoles(data.roles)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setFormError(null)
    try {
      if (formMode?.type === "create") {
        const created = await createUser({ name, email, password, role })
        setUsers((prev) => [...prev, created])
      } else if (formMode?.type === "edit") {
        const updated = await updateUser(formMode.user.id, {
          name,
          role,
          ...(password ? { password } : {}),
        })
        setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u))
      }
      closeForm()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id: number) {
    setBusy(true)
    try {
      await deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setDeleteConfirm(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menghapus")
    } finally {
      setBusy(false)
    }
  }

  return (
    <AdminShell>
      <AdminHeader title="User & Role" description="Kelola akun admin dan hak akses masing-masing user." />

      {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="border border-border bg-card p-4 text-sm text-muted-foreground">Memuat user...</div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreate} className="h-9 gap-2 rounded-lg bg-primary px-4 text-sm text-white">
              <Plus className="size-4" /> Tambah User
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Bergabung</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      {user.role ? (
                        <Badge variant="outline" className={`rounded-lg text-xs ${ROLE_COLORS[user.role] ?? "bg-slate-100 text-slate-600"}`}>
                          {user.role}
                        </Badge>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString("id-ID") : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {deleteConfirm === user.id ? (
                          <>
                            <span className="text-xs text-red-600">Hapus?</span>
                            <Button size="icon" variant="ghost" className="size-7 text-green-600 hover:bg-green-50" disabled={busy} onClick={() => handleDelete(user.id)}>
                              <Check className="size-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-7" onClick={() => setDeleteConfirm(null)}>
                              <X className="size-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="icon" variant="ghost" className="size-7" onClick={() => openEdit(user)}>
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-7 text-red-500 hover:bg-red-50" onClick={() => setDeleteConfirm(user.id)}>
                              <Trash2 className="size-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal form */}
      {formMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md border border-border bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Key className="size-4 text-primary" />
                {formMode.type === "create" ? "Tambah User Baru" : "Edit User"}
              </div>
              <Button variant="ghost" size="icon" className="size-7" onClick={closeForm}><X className="size-4" /></Button>
            </div>

            {formError && <div className="mb-4 border border-red-200 bg-red-50 p-3 text-xs text-red-700">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="u-name" className="text-xs">Nama</Label>
                <Input id="u-name" value={name} onChange={(e) => setName(e.target.value)} required className="h-9 rounded-lg text-sm" />
              </div>
              {formMode.type === "create" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="u-email" className="text-xs">Email</Label>
                  <Input id="u-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-9 rounded-lg text-sm" />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="u-pw" className="text-xs">
                  {formMode.type === "edit" ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
                </Label>
                <Input id="u-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={formMode.type === "create"} className="h-9 rounded-lg text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="u-role" className="text-xs">Role</Label>
                <select id="u-role" value={role} onChange={(e) => setRole(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" className="h-9 rounded-lg text-sm" onClick={closeForm}>Batal</Button>
                <Button type="submit" disabled={busy} className="h-9 rounded-lg bg-primary px-5 text-sm text-white">
                  {busy ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
