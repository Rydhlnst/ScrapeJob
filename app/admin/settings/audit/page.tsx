"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"

import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAuditLogs, type AuditLogRecord } from "@/lib/api/settings"

const ACTION_COLORS: Record<string, string> = {
  "settings.update": "bg-blue-50 text-blue-700 border-blue-200",
  "user.create":  "bg-green-50 text-green-700 border-green-200",
  "user.update":  "bg-yellow-50 text-yellow-700 border-yellow-200",
  "user.delete":  "bg-red-50 text-red-700 border-red-200",
  "api_key.create": "bg-purple-50 text-purple-700 border-purple-200",
  "api_key.revoke": "bg-red-50 text-red-700 border-red-200",
}

function ActionBadge({ action }: { action: string }) {
  const cls = ACTION_COLORS[action] ?? "bg-slate-50 text-slate-600 border-slate-200"
  return <Badge variant="outline" className={`rounded-lg font-mono text-[11px] ${cls}`}>{action}</Badge>
}

function ChangesCell({ before, after }: { before: Record<string, unknown> | null; after: Record<string, unknown> | null }) {
  const keys = Array.from(new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]))
  if (keys.length === 0) return <span className="text-muted-foreground">—</span>
  return (
    <div className="space-y-0.5">
      {keys.slice(0, 3).map((k) => (
        <div key={k} className="text-[11px]">
          <span className="font-mono text-slate-500">{k}: </span>
          {before?.[k] !== undefined && (
            <span className="text-red-500 line-through">{String(before[k])}</span>
          )}
          {before?.[k] !== undefined && after?.[k] !== undefined && " → "}
          {after?.[k] !== undefined && (
            <span className="text-green-600">{String(after[k])}</span>
          )}
        </div>
      ))}
      {keys.length > 3 && <div className="text-[10px] text-muted-foreground">+{keys.length - 3} lainnya</div>}
    </div>
  )
}

export default function AuditLogPage() {
  const [logs, setLogs] = React.useState<AuditLogRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)
  const [lastPage, setLastPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)

  const [filterAction, setFilterAction] = React.useState("")
  const [filterFrom, setFilterFrom] = React.useState("")
  const [filterTo, setFilterTo] = React.useState("")
  const [showFilter, setShowFilter] = React.useState(false)

  const loadLogs = React.useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const result = await getAuditLogs({
        page: p, perPage: 25,
        action: filterAction || undefined,
        from: filterFrom || undefined,
        to: filterTo || undefined,
      })
      setLogs(result.data)
      setLastPage(result.lastPage)
      setTotal(result.total)
      setPage(p)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat log")
    } finally {
      setLoading(false)
    }
  }, [filterAction, filterFrom, filterTo])

  React.useEffect(() => { loadLogs(1) }, [])

  function applyFilter(e: React.FormEvent) {
    e.preventDefault()
    loadLogs(1)
  }

  return (
    <AdminShell>
      <AdminHeader title="Audit Log" description="Rekam jejak semua aktivitas admin — perubahan setting, user, dan API key." />

      {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="h-9 gap-2 rounded-lg text-sm"
          onClick={() => setShowFilter((v) => !v)}
        >
          <Filter className="size-4" /> Filter
        </Button>
        <span className="text-xs text-muted-foreground">{total.toLocaleString("id-ID")} entri</span>
      </div>

      {showFilter && (
        <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-3 border border-border bg-muted/30 p-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Action</label>
            <Input placeholder="contoh: user.create" value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="h-9 w-44 rounded-lg text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Dari</label>
            <Input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="h-9 rounded-lg text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Sampai</label>
            <Input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="h-9 rounded-lg text-sm" />
          </div>
          <Button type="submit" className="h-9 rounded-lg bg-primary px-4 text-sm text-white">Terapkan</Button>
          <Button type="button" variant="ghost" className="h-9 rounded-lg text-sm" onClick={() => { setFilterAction(""); setFilterFrom(""); setFilterTo(""); setTimeout(() => loadLogs(1), 50) }}>
            Reset
          </Button>
        </form>
      )}

      {loading ? (
        <div className="border border-border bg-card p-6 text-sm text-muted-foreground">Memuat audit log...</div>
      ) : logs.length === 0 ? (
        <div className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Belum ada aktivitas yang tercatat.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Waktu</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-left">Perubahan</th>
                  <th className="px-4 py-3 text-left hidden xl:table-cell">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {log.user ? (
                        <div>
                          <p className="text-xs font-medium text-foreground">{log.user.name}</p>
                          <p className="text-[11px] text-muted-foreground">{log.user.email}</p>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">System</span>}
                    </td>
                    <td className="px-4 py-3"><ActionBadge action={log.action} /></td>
                    <td className="px-4 py-3 max-w-xs"><ChangesCell before={log.before} after={log.after} /></td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">{log.ip_address ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Halaman {page} dari {lastPage}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="size-8 rounded-lg" disabled={page <= 1} onClick={() => loadLogs(page - 1)}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="size-8 rounded-lg" disabled={page >= lastPage} onClick={() => loadLogs(page + 1)}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </AdminShell>
  )
}
