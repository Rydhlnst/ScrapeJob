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

const CLIENT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? ""

const SERVER_API_BASE_URL =
  process.env.INTERNAL_API_BASE_URL?.replace(/\/$/, "") ?? CLIENT_API_BASE_URL

export const API_BASE_URL =
  typeof window === "undefined" ? SERVER_API_BASE_URL : CLIENT_API_BASE_URL

const SERVER_BEARER_TOKEN = process.env.API_BEARER_TOKEN

// Default OFF — mocks must be explicitly opted-in for local dev.
// A missing/typo'd env value must not ship a mock-auth build to production.
export const USE_MOCK =
  (process.env.NEXT_PUBLIC_USE_MOCK ?? "false").toLowerCase() === "true"

export async function fetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path
  const clientToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem("admin_access_token")
      : null

  // Precedence: explicit caller Authorization > per-request client token
  // > server env fallback. Env token is a last-resort service credential;
  // never let it override a real user's bearer on SSR.
  const authHeader =
    (init?.headers as Record<string, string> | undefined)?.Authorization ??
    (clientToken
      ? `Bearer ${clientToken}`
      : SERVER_BEARER_TOKEN
        ? `Bearer ${SERVER_BEARER_TOKEN}`
      : undefined)

  const websiteId = typeof window !== "undefined" ? window.localStorage.getItem("admin_active_website_id") : null
  const websiteDomain = typeof window !== "undefined" ? window.location.hostname : process.env.NEXT_PUBLIC_SITE_DOMAIN

  const res = await fetch(url, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(8_000),
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...(websiteId ? { "X-Website-Id": websiteId } : {}),
      ...(websiteDomain ? { "X-Website-Domain": websiteDomain } : {}),
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
    if (res.status === 401 && typeof window !== "undefined") {
      // Backend rejected the admin bearer — clear it, drop the session cookie,
      // and let AdminAuthGuard bounce to /admin/login.
      window.localStorage.removeItem("admin_access_token")
      void fetch("/api/auth/admin/session", { method: "DELETE" }).catch(() => {})
      window.dispatchEvent(new CustomEvent("admin:auth:invalid"))
    }
    throw Object.assign(new Error(message), {
      status: res.status,
    }) satisfies ApiError
  }
  return (await res.json()) as T
}
