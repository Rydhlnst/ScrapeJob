"use client"

import * as React from "react"

import { AdminShell } from "@/components/admin/admin-shell"
import { LandingContentEditor } from "@/components/admin/landing-content-editor"
import { getAdminLandingPageContent } from "@/lib/api/landing-page-content"
import type { AdminLandingPageContentRecord } from "@/types/landing-content"

export default function AdminContentPage() {
  const [content, setContent] = React.useState<AdminLandingPageContentRecord | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true

    getAdminLandingPageContent()
      .then((result) => {
        if (active) {
          setContent(result)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load content")
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <AdminShell>
      {error ? (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : loading ? (
        <div className="border border-border bg-card p-4 text-sm text-muted-foreground">Loading content...</div>
      ) : content ? (
        <LandingContentEditor initialRecord={content} />
      ) : (
        <div className="border border-border bg-card p-4 text-sm text-muted-foreground">No content found.</div>
      )}
    </AdminShell>
  )
}
