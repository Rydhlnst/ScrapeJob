import { headers } from "next/headers"
import type { ApiRequestContext } from "@/lib/api/client"

function normalizeHost(value: string | null) {
  return value?.split(",")[0]?.trim().split(":")[0].toLowerCase() || undefined
}

export async function getServerWebsiteContext(): Promise<ApiRequestContext> {
  const requestHeaders = await headers()
  return {
    websiteDomain: normalizeHost(
      requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"),
    ),
  }
}
