import type { ScrapedJob, ScrapedJobStatus } from "@/types/job"

export type ReviewStats = {
  pending: number
  approved: number
  rejected: number
  published: number
}

export type RowAction = "approve" | "reject" | "publish"

export type ReviewTableHelpers = {
  cleanJobTitle: (value: string) => string
  normalizeLocation: (value: string | null) => string | null
  formatDate: (date: string | null) => string
  sourceBadgeClass: (source: string) => string
  statusBadgeClass: (status: ScrapedJobStatus) => string
  statusLabel: (status: ScrapedJobStatus | "all") => string
}

export type ReviewTableProps = {
  jobs: ScrapedJob[]
  selected: string[]
  busyId: string | null
  allChecked: boolean
  helpers: ReviewTableHelpers
  onToggleAll: (checked: boolean) => void
  onToggleRow: (id: string, checked: boolean) => void
  onAction: (id: string, action: RowAction) => Promise<void>
}

