export type ApiError = {
  message: string
  status?: number
}

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  meta?: {
    currentPage?: number
    perPage?: number
    total?: number
    lastPage?: number
  }
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? ""

const SERVER_BEARER_TOKEN = process.env.API_BEARER_TOKEN

export const USE_MOCK =
  (process.env.NEXT_PUBLIC_USE_MOCK ?? "true").toLowerCase() !== "false"

export async function fetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path
  const clientToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem("admin_access_token")
      : null

  const authHeader =
    (init?.headers as Record<string, string> | undefined)?.Authorization ??
    (SERVER_BEARER_TOKEN
      ? `Bearer ${SERVER_BEARER_TOKEN}`
      : clientToken
        ? `Bearer ${clientToken}`
        : undefined)

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })
  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`
    try {
      const parsed = (await res.json()) as { message?: string }
      if (parsed?.message) {
        message = parsed.message
      }
    } catch {
      // ignore malformed json
    }
    throw Object.assign(new Error(message), {
      status: res.status,
    }) satisfies ApiError
  }
  return (await res.json()) as T
}
