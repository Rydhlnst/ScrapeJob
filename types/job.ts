export type Job = {
  id: string
  slug: string
  title: string
  company: string
  location: string | null
  salary: string | null
  employmentType: string | null
  descriptionSummary: string | null
  source: string
  sourceUrl: string
  postedDate: string | null
  publishedAt: string | null
}

export type ScrapedJobStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "duplicate"
  | "published"

export type ScrapedJob = {
  id: string
  externalId: string
  source: string
  sourceUrl: string
  roleKeyword: string
  title: string
  company: string
  location: string | null
  salary: string | null
  employmentType: string | null
  description: string | null
  descriptionSummary: string | null
  postedDate: string | null
  scrapedAt: string
  status: ScrapedJobStatus
  draftStatus?: "drafted_raw" | "drafted_ai"
  failReason?: string | null
}
