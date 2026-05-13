export type ApiError = {
  message: string
  status?: number
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? ""

export const USE_MOCK =
  (process.env.NEXT_PUBLIC_USE_MOCK ?? "true").toLowerCase() !== "false"

export async function fetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })
  if (!res.ok) {
    const message = `Request failed: ${res.status} ${res.statusText}`
    throw Object.assign(new Error(message), {
      status: res.status,
    }) satisfies ApiError
  }
  return (await res.json()) as T
}

