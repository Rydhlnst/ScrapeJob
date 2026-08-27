import { ApiEnvelope, fetchJson, USE_MOCK, type ApiRequestContext } from "./client"
import { defaultLandingPageContent } from "@/lib/landing-page-content"
import type {
  AdminLandingPageContentRecord,
  LandingPageContent,
} from "@/types/landing-content"

export async function getPublicLandingPageContent(context?: ApiRequestContext): Promise<LandingPageContent | null> {
  if (USE_MOCK) {
    return defaultLandingPageContent
  }

  const response = await fetchJson<ApiEnvelope<LandingPageContent | null>>(
    "/api/landing-page-content", undefined, context,
  )

  return response.data
}

export async function getAdminLandingPageContent(): Promise<AdminLandingPageContentRecord> {
  const response = await fetchJson<ApiEnvelope<AdminLandingPageContentRecord>>(
    "/api/admin/landing-page-content",
  )

  return response.data
}

export async function saveAdminLandingPageDraft(
  draftPayload: LandingPageContent,
): Promise<AdminLandingPageContentRecord> {
  const response = await fetchJson<ApiEnvelope<AdminLandingPageContentRecord>>(
    "/api/admin/landing-page-content",
    {
      method: "PUT",
      body: JSON.stringify({ draftPayload }),
    },
  )

  return response.data
}

export async function publishAdminLandingPageDraft(): Promise<AdminLandingPageContentRecord> {
  const response = await fetchJson<ApiEnvelope<AdminLandingPageContentRecord>>(
    "/api/admin/landing-page-content/publish",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  )

  return response.data
}
