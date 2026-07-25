import { ApiEnvelope, fetchJson } from "./client"

export type AdminLocation = {
  id: string
  name: string
  slug: string
  province: string | null
  createdAt: string | null
}

export type LocationInput = {
  name: string
  slug?: string | null
  province?: string | null
}

export async function listAdminLocations(): Promise<AdminLocation[]> {
  const response = await fetchJson<ApiEnvelope<AdminLocation[]>>("/api/admin/locations")
  return response.data
}

export async function createAdminLocation(payload: LocationInput): Promise<AdminLocation> {
  const response = await fetchJson<ApiEnvelope<AdminLocation>>("/api/admin/locations", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateAdminLocation(id: string, payload: Partial<LocationInput>): Promise<AdminLocation> {
  const response = await fetchJson<ApiEnvelope<AdminLocation>>(
    `/api/admin/locations/${encodeURIComponent(id)}`,
    { method: "PUT", body: JSON.stringify(payload) },
  )
  return response.data
}

export async function deleteAdminLocation(id: string): Promise<void> {
  await fetchJson<ApiEnvelope<null>>(
    `/api/admin/locations/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  )
}
