export type Website = {
  id: string
  name: string
  domain: string
  isActive: boolean
  theme?: string | null
  logo?: string | null
  settings?: Record<string, unknown> | null
}

export type WebsiteJobStatus = "unused" | "draft" | "published" | "expired" | "nonaktif"

export type WebsiteJobAssignment = {
  id: string
  websiteId: string
  jobId: string
  status: WebsiteJobStatus
  publishedAt?: string | null
  expiredAt?: string | null
  website?: Website
}
