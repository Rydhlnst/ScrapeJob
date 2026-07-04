export type PageStatus = "draft" | "published"

export type Page = {
  id: string
  title: string
  slug: string
  status: PageStatus
  summary: string | null
  content: string | null
  seoTitle: string | null
  seoDescription: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}
