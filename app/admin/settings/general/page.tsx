"use client"

import * as React from "react"
import { Save } from "lucide-react"
import { toast } from "sonner"

import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSettings, saveSettings } from "@/lib/api/settings"
import { getActiveWebsiteId, listWebsites, updateWebsite } from "@/lib/api/websites"
import type { Website } from "@/types/website"

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
  const [website, setWebsite] = React.useState<Website | null>(null)
  const [logo, setLogo] = React.useState("")
  const [primaryColor, setPrimaryColor] = React.useState("#1f5f9f")
  const [accentColor, setAccentColor] = React.useState("#f2a23a")

  React.useEffect(() => {
    Promise.all([getSettings(), listWebsites()])
      .then(([data, websites]) => {
        const mapped: Record<string, string> = {}
        FIELDS.forEach(({ key }) => { mapped[key] = data[key]?.value ?? "" })
        setValues(mapped)
        setAutoPublish(data["auto_publish_jobs"]?.value === "1")
        const selectedId = getActiveWebsiteId()
        const selected = websites.find((item) => item.id === selectedId) ?? websites[0] ?? null
        setWebsite(selected)
        setLogo(selected?.logo ?? "")
        const settings = selected?.settings ?? {}
        setPrimaryColor(String(settings.primaryColor ?? settings.primary_color ?? "#1f5f9f"))
        setAccentColor(String(settings.accentColor ?? settings.accent_color ?? "#f2a23a"))
        setLoading(false)
      })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await saveSettings([
        ...FIELDS.map(({ key }) => ({ key, value: values[key] || null })),
        { key: "auto_publish_jobs", value: autoPublish ? "1" : "0" },
      ])
      if (website) {
        await updateWebsite(website.id, {
          logo: logo.trim() || null,
          settings: {
            ...(website.settings ?? {}),
            primaryColor,
            accentColor,
          },
        })
      }
      toast.success("Pengaturan berhasil disimpan.")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan")
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan pengaturan.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell>
      <AdminHeader title="General Settings" description="Konfigurasi dasar platform: nama situs, tagline, dan perilaku default." />
      {error && <div className="border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
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
                    className="h-9 rounded-lg text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="border border-border bg-white p-6">
            <h3 className="mb-5 text-sm font-semibold text-foreground">Branding Website</h3>
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5 sm:col-span-3">
                <Label htmlFor="website_logo" className="text-xs font-medium text-muted-foreground">Logo URL</Label>
                <Input id="website_logo" value={logo} onChange={(event) => setLogo(event.target.value)} placeholder="https://example.com/logo.png" className="h-9 rounded-lg text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="primary_color" className="text-xs font-medium text-muted-foreground">Primary color</Label>
                <Input id="primary_color" type="color" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} className="h-9 rounded-lg p-1" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="accent_color" className="text-xs font-medium text-muted-foreground">Accent color</Label>
                <Input id="accent_color" type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} className="h-9 rounded-lg p-1" />
              </div>
              <div className="flex items-end text-xs text-muted-foreground">Active website: {website?.name ?? "none"}</div>
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
            <Button type="submit" disabled={saving} className="h-9 gap-2 rounded-lg bg-primary px-5 text-sm text-primary-foreground">
              <Save className="size-4" />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      )}
    </AdminShell>
  )
}
