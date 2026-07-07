import { ApiEnvelope, fetchJson } from "./client"

// ── Types ───────────────────────────────────────────────────────────────────

export type SettingEntry = { value: string | null; type: string }
export type SettingsMap = Record<string, SettingEntry>

export type AdminUser = {
  id: number
  name: string
  email: string
  role: string | null
  created_at: string | null
}

export type ApiKeyRecord = {
  id: number
  name: string
  prefix: string
  description: string | null
  is_active: boolean
  last_used_at: string | null
  expires_at: string | null
  created_by: string | null
  created_at: string | null
  plain_key?: string
}

export type AuditLogRecord = {
  id: number
  action: string
  model_type: string | null
  model_id: string | null
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  ip_address: string | null
  user: { id: number; name: string; email: string } | null
  created_at: string | null
}

export type PaginatedAuditLogs = {
  data: AuditLogRecord[]
  total: number
  currentPage: number
  lastPage: number
  perPage: number
}

// ── Settings ────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<SettingsMap> {
  const res = await fetchJson<ApiEnvelope<SettingsMap>>("/api/admin/settings")
  return res.data
}

export async function saveSettings(
  updates: Array<{ key: string; value: string | null }>
): Promise<void> {
  await fetchJson<ApiEnvelope<null>>("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify({ settings: updates }),
  })
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<{ users: AdminUser[]; roles: string[] }> {
  const res = await fetchJson<ApiEnvelope<{ users: AdminUser[]; roles: string[] }>>("/api/admin/users")
  return res.data
}

export async function createUser(payload: {
  name: string
  email: string
  password: string
  role: string
}): Promise<AdminUser> {
  const res = await fetchJson<ApiEnvelope<AdminUser>>("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function updateUser(
  id: number,
  payload: { name?: string; role?: string; password?: string }
): Promise<AdminUser> {
  const res = await fetchJson<ApiEnvelope<AdminUser>>(`/api/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function deleteUser(id: number): Promise<void> {
  await fetchJson<ApiEnvelope<null>>(`/api/admin/users/${id}`, { method: "DELETE" })
}

// ── API Keys ─────────────────────────────────────────────────────────────────

export async function getApiKeys(): Promise<ApiKeyRecord[]> {
  const res = await fetchJson<ApiEnvelope<ApiKeyRecord[]>>("/api/admin/api-keys")
  return res.data
}

export async function createApiKey(payload: {
  name: string
  description?: string
}): Promise<ApiKeyRecord> {
  const res = await fetchJson<ApiEnvelope<ApiKeyRecord>>("/api/admin/api-keys", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function updateApiKey(
  id: number,
  payload: { name?: string; description?: string; is_active?: boolean }
): Promise<ApiKeyRecord> {
  const res = await fetchJson<ApiEnvelope<ApiKeyRecord>>(`/api/admin/api-keys/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function revokeApiKey(id: number): Promise<void> {
  await fetchJson<ApiEnvelope<null>>(`/api/admin/api-keys/${id}`, { method: "DELETE" })
}

// ── Audit Logs ───────────────────────────────────────────────────────────────

export async function getAuditLogs(params?: {
  page?: number
  perPage?: number
  action?: string
  user_id?: number
  from?: string
  to?: string
}): Promise<PaginatedAuditLogs> {
  const q = new URLSearchParams()
  if (params?.page) q.set("page", String(params.page))
  if (params?.perPage) q.set("perPage", String(params.perPage))
  if (params?.action) q.set("action", params.action)
  if (params?.user_id) q.set("user_id", String(params.user_id))
  if (params?.from) q.set("from", params.from)
  if (params?.to) q.set("to", params.to)

  const res = await fetchJson<ApiEnvelope<AuditLogRecord[]>>(
    `/api/admin/audit-logs?${q.toString()}`
  )
  return {
    data: res.data,
    total: res.meta?.total ?? res.data.length,
    currentPage: res.meta?.currentPage ?? 1,
    lastPage: res.meta?.lastPage ?? 1,
    perPage: res.meta?.perPage ?? 25,
  }
}
