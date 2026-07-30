"use client"

import * as React from "react"
import { Plus, Trash2, Save, Bell } from "lucide-react"
import { toast } from "sonner"

import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSettings, saveSettings } from "@/lib/api/settings"

export default function NotificationsSettingsPage() {
  const [notifyOnScrape, setNotifyOnScrape] = React.useState(false)
  const [emails, setEmails] = React.useState<string[]>([])
  const [newEmail, setNewEmail] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getSettings()
      .then((data) => {
        setNotifyOnScrape(data["notify_on_scrape"]?.value === "1")
        const raw = data["notify_emails"]?.value ?? ""
        setEmails(raw ? raw.split(",").map((e) => e.trim()).filter(Boolean) : [])
        setLoading(false)
      })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [])

  function addEmail() {
    const e = newEmail.trim()
    if (!e || emails.includes(e)) return
    setEmails((prev) => [...prev, e])
    setNewEmail("")
    toast.success("Email ditambahkan.")
  }

  function removeEmail(e: string) {
    setEmails((prev) => prev.filter((x) => x !== e))
    toast.success("Email dihapus.")
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      await saveSettings([
        { key: "notify_on_scrape", value: notifyOnScrape ? "1" : "0" },
        { key: "notify_emails", value: emails.join(",") || null },
      ])
      toast.success("Pengaturan notifikasi berhasil disimpan.")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan")
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan pengaturan.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell>
      <AdminHeader title="Notifikasi" description="Atur kapan dan kemana notifikasi email dikirim untuk aktivitas sistem." />

      {error && <div className="border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {loading ? (
        <div className="border border-border bg-card p-4 text-sm text-muted-foreground">Memuat pengaturan...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Triggers */}
          <div className="border border-border bg-white p-6">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Bell className="size-4 text-primary" /> Pemicu Notifikasi
            </h3>
            <div className="space-y-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={notifyOnScrape}
                  onChange={(e) => setNotifyOnScrape(e.target.checked)}
                  className="mt-0.5 size-4 accent-primary"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Setelah proses scraping selesai</p>
                  <p className="text-xs text-muted-foreground">
                    Kirim email ringkasan setiap kali scraper berhasil mengumpulkan lowongan baru.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Recipients */}
          <div className="border border-border bg-white p-6">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Daftar Penerima Email</h3>
            <p className="mb-5 text-xs text-muted-foreground">
              Notifikasi akan dikirim ke semua alamat email di bawah ini.
            </p>

            <div className="mb-4 flex gap-2">
              <Input
                type="email"
                placeholder="tambah@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEmail() } }}
                className="h-9 rounded-lg text-sm"
              />
              <Button type="button" onClick={addEmail} variant="outline" className="h-9 gap-1.5 rounded-lg text-sm">
                <Plus className="size-4" /> Tambah
              </Button>
            </div>

            {emails.length === 0 ? (
              <div className="border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                Belum ada penerima. Tambahkan minimal 1 email.
              </div>
            ) : (
              <ul className="space-y-2">
                {emails.map((email) => (
                  <li key={email} className="flex items-center justify-between rounded border border-border bg-muted/30 px-3 py-2 text-sm">
                    <span>{email}</span>
                    <button type="button" onClick={() => removeEmail(email)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving} className="h-9 gap-2 rounded-lg bg-primary px-5 text-sm text-primary-foreground">
              <Save className="size-4" />
              {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </div>
        </form>
      )}
    </AdminShell>
  )
}
