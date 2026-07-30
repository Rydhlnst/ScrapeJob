"use client"

import * as React from "react"
import { Plus, Trash2, Copy, Check, Eye, EyeOff, X, AlertCircle } from "lucide-react"

import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getSettings, saveSettings,
  getApiKeys, createApiKey, revokeApiKey,
  type ApiKeyRecord,
} from "@/lib/api/settings"

export default function ApiSettingsPage() {
  // --- AI Cleanup settings ---
  const [aiUrl, setAiUrl] = React.useState("")
  const [aiToken, setAiToken] = React.useState("")
  const [showToken, setShowToken] = React.useState(false)
  const [aiSaving, setAiSaving] = React.useState(false)
  const [aiSuccess, setAiSuccess] = React.useState(false)
  const [aiError, setAiError] = React.useState<string | null>(null)

  // --- API Keys ---
  const [keys, setKeys] = React.useState<ApiKeyRecord[]>([])
  const [keysLoading, setKeysLoading] = React.useState(true)
  const [keysError, setKeysError] = React.useState<string | null>(null)
  const [newKeyName, setNewKeyName] = React.useState("")
  const [newKeyDesc, setNewKeyDesc] = React.useState("")
  const [creating, setCreating] = React.useState(false)
  const [showCreate, setShowCreate] = React.useState(false)
  const [justCreated, setJustCreated] = React.useState<ApiKeyRecord | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [revokeConfirm, setRevokeConfirm] = React.useState<number | null>(null)
  const [settingsLoading, setSettingsLoading] = React.useState(true)

  React.useEffect(() => {
    getSettings()
      .then((data) => {
        setAiUrl(data["ai_cleanup_url"]?.value ?? "")
        setAiToken(data["ai_cleanup_token"]?.value ?? "")
        setSettingsLoading(false)
      })
      .catch((e) => { setAiError(e.message); setSettingsLoading(false) })

    getApiKeys()
      .then((data) => { setKeys(data); setKeysLoading(false) })
      .catch((e) => { setKeysError(e.message); setKeysLoading(false) })
  }, [])

  async function saveAiSettings(e: React.FormEvent) {
    e.preventDefault()
    setAiSaving(true); setAiError(null); setAiSuccess(false)
    try {
      await saveSettings([
        { key: "ai_cleanup_url", value: aiUrl || null },
        { key: "ai_cleanup_token", value: aiToken || null },
      ])
      setAiSuccess(true)
      setTimeout(() => setAiSuccess(false), 3000)
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setAiSaving(false)
    }
  }

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const key = await createApiKey({ name: newKeyName, description: newKeyDesc || undefined })
      setKeys((prev) => [key, ...prev])
      setJustCreated(key)
      setNewKeyName(""); setNewKeyDesc(""); setShowCreate(false)
    } catch (e: unknown) {
      setKeysError(e instanceof Error ? e.message : "Gagal membuat key")
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(id: number) {
    try {
      await revokeApiKey(id)
      setKeys((prev) => prev.filter((k) => k.id !== id))
      setRevokeConfirm(null)
    } catch (e: unknown) {
      setKeysError(e instanceof Error ? e.message : "Gagal mencabut key")
    }
  }

  function copyKey(text: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <AdminShell>
      <AdminHeader title="API & Integrasi" description="Konfigurasi layanan AI Cleanup dan kelola API key eksternal." />

      {/* AI Cleanup section */}
      <div className="border border-border bg-white p-6">
        <h3 className="mb-1 text-sm font-semibold text-foreground">AI Cleanup Service</h3>
        <p className="mb-5 text-xs text-muted-foreground">
          URL dan token autentikasi untuk layanan AI yang membersihkan data lowongan scrape.
        </p>

        {aiError && (
          <div className="mb-4 flex gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="size-4 shrink-0" /> {aiError}
          </div>
        )}

        {settingsLoading ? (
          <div className="text-xs text-muted-foreground">Memuat...</div>
        ) : (
          <form onSubmit={saveAiSettings} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ai-url" className="text-xs font-medium">Endpoint URL</Label>
              <Input
                id="ai-url"
                type="url"
                placeholder="https://yourapp.com/api/internal/clean-job"
                value={aiUrl}
                onChange={(e) => setAiUrl(e.target.value)}
                className="h-9 rounded-lg font-mono text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ai-token" className="text-xs font-medium">Bearer Token</Label>
              <div className="relative">
                <Input
                  id="ai-token"
                  type={showToken ? "text" : "password"}
                  placeholder="sk-••••••••••••••••"
                  value={aiToken}
                  onChange={(e) => setAiToken(e.target.value)}
                  className="h-9 rounded-lg pr-10 font-mono text-sm"
                />
                <button type="button" onClick={() => setShowToken((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Nilai yang ditampilkan sudah disamarkan. Isi hanya jika ingin mengganti.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={aiSaving} className="h-9 rounded-lg bg-primary px-5 text-sm text-white">
                {aiSaving ? "Menyimpan..." : "Simpan Konfigurasi AI"}
              </Button>
              {aiSuccess && <span className="text-sm text-green-600">Tersimpan!</span>}
            </div>
          </form>
        )}
      </div>

      {/* API Keys section */}
      <div className="border border-border bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">API Keys Eksternal</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Key untuk sistem eksternal yang ingin mengimpor lowongan via API.
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="h-9 gap-2 rounded-lg bg-primary px-4 text-sm text-white">
            <Plus className="size-4" /> Generate Key
          </Button>
        </div>

        {keysError && <div className="mb-4 border border-red-200 bg-red-50 p-3 text-xs text-red-700">{keysError}</div>}

        {/* New key alert */}
        {justCreated?.plain_key && (
          <div className="mb-5 border border-green-200 bg-green-50 p-4">
            <p className="mb-2 text-xs font-semibold text-green-800">Key berhasil dibuat — salin sekarang, tidak bisa ditampilkan lagi!</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded bg-white p-2 text-xs text-green-900">{justCreated.plain_key}</code>
              <button onClick={() => copyKey(justCreated.plain_key!)}
                className="shrink-0 rounded border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </button>
              <button onClick={() => setJustCreated(null)} className="text-green-600 hover:text-green-800"><X className="size-4" /></button>
            </div>
          </div>
        )}

        {keysLoading ? (
          <div className="text-xs text-muted-foreground">Memuat API keys...</div>
        ) : keys.length === 0 ? (
          <div className="border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Belum ada API key. Generate key pertama kamu.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-left">Prefix</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Terakhir dipakai</th>
                  <th className="px-4 py-3 text-left">Dibuat oleh</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{key.name}</p>
                      {key.description && <p className="text-xs text-muted-foreground">{key.description}</p>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{key.prefix}_****</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`rounded-lg text-xs ${key.is_active ? "border-green-200 bg-green-50 text-green-700" : "border-slate-200 bg-slate-100 text-slate-500"}`}>
                        {key.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString("id-ID") : "Belum pernah"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{key.created_by ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      {revokeConfirm === key.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-red-600">Cabut?</span>
                          <Button size="icon" variant="ghost" className="size-7 text-red-600" onClick={() => handleRevoke(key.id)}>
                            <Check className="size-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="size-7" onClick={() => setRevokeConfirm(null)}>
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="icon" variant="ghost" className="size-7 text-red-500 hover:bg-red-50" onClick={() => setRevokeConfirm(key.id)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create key modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm border border-border bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold">Generate API Key Baru</p>
              <Button variant="ghost" size="icon" className="size-7" onClick={() => setShowCreate(false)}><X className="size-4" /></Button>
            </div>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="k-name" className="text-xs">Nama Key</Label>
                <Input id="k-name" placeholder="Contoh: Scraper Service v2" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} required className="h-9 rounded-lg text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="k-desc" className="text-xs">Deskripsi (opsional)</Label>
                <Input id="k-desc" placeholder="Untuk apa key ini digunakan" value={newKeyDesc} onChange={(e) => setNewKeyDesc(e.target.value)} className="h-9 rounded-lg text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" className="h-9 rounded-lg text-sm" onClick={() => setShowCreate(false)}>Batal</Button>
                <Button type="submit" disabled={creating} className="h-9 rounded-lg bg-primary px-5 text-sm text-white">
                  {creating ? "Membuat..." : "Generate"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
