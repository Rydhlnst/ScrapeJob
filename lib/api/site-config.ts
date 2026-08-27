import type { SiteConfig } from "@/types"
import { ApiEnvelope, fetchJson } from "./client"

function nameFromHost(host?: string) {
  const value = host?.replace(/^www\./, "").split(".")[0]
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Job platform"
}

export function defaultSiteConfig(host?: string): SiteConfig {
  const name = nameFromHost(host)
  return {
    website: { id: "default", name, domain: host ?? "localhost", logo: null },
    branding: {
      primaryColor: "#1f5f9f",
      accentColor: "#f2a23a",
      inkColor: "#171717",
      backgroundColor: "#ffffff",
      theme: null,
    },
    tagline: name,
    metadata: { title: name, description: name },
    contact: { email: null },
    features: {},
  }
}

export async function getPublicSiteConfig(context?: { websiteDomain?: string }) {
  try {
    const response = await fetchJson<ApiEnvelope<SiteConfig>>("/api/site-config", undefined, context)
    return response.data
  } catch {
    return defaultSiteConfig(context?.websiteDomain)
  }
}
