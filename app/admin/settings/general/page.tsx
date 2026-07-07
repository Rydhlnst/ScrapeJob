"use client"

import * as React from "react"
import { Save } from "lucide-react"

import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSettings, saveSettings } from "@/lib/api/settings"

const FIELDS = [
  { key: "site_name", label: "Nama Situs", placeholder: "Lowonganku", type: "text" },
  { key: "site_tagline", label: "Tagline", placeholder: "Platform lowongan kerja terpercaya", type: "text" },
  { key: "contact_email", label: "Email Kontak", placeholder: "hello@lowonganku.id", type: "email" },
] as const

export default function GeneralSettingsPage() {
  const [values, setValues] = React.useState<Record<string, string>>({})
  const [autoPublish, setAutoPublish] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  React.useEffect(() => {
    getSettings()
      .then((data) => {
        const mapped: Record<string, string> = {}
        FIELDS.forEach(({ key }) => { mapped[key] = data[key]?.value ?? "" })
        setValues(mapped)
        setAutoPublish(data["auto_publish_jobs"]?.value === "1")
        setLoading(false)
      })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError(null)
    try {
      await saveSettings([
        ...FIELDS.map(({ key }) => ({ key, value: values[key] || null })),
        { key: "auto_publish_jobs", value: autoPublish ? "1" : "0" },
      ])
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell>
      <AdminHeader title="General Settings" description="Konfigurasi dasar platform: nama situs, tagline, dan perilaku default." />
      {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? (
        <div className="border border-border bg-card p-4 text-sm text-muted-foreground">Memuat pengaturan...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="border border-border bg-white p-6">
            <h3 className="mb-5 text-sm font-semibold text-foreground">Identitas Situs</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              {FIELDS.map(({ key, label, placeholder, type }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <Label htmlFor={key} className="text-xs font-medium text-muted-foreground">{label}</Label>
                  <Input
                    id={key}
                    type={type}
                    placeholder={placeholder}
                    value={values[key] ?? ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="h-9 rounded-none text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border bg-white p-6">
            <h3 className="mb-5 text-sm font-semibold text-foreground">Perilaku Lowongan</h3>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={autoPublish}
                onChange={(e) => setAutoPublish(e.target.checked)}
                className="size-4 accent-primary"
              />
              <div>
                <p className="text-sm font-medium text-foreground">Auto-publish lowongan yang sudah di-approve</p>
                <p className="text-xs text-muted-foreground">Jika aktif, lowongan yang di-approve akan langsung publish tanpa step tambahan.</p>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving} className="h-9 gap-2 rounded-none bg-primary px-5 text-sm text-white">
              <Save className="size-4" />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
            {success && <span className="text-sm text-green-600">Tersimpan!</span>}
          </div>
        </form>
      )}
    </AdminShell>
  )
}
