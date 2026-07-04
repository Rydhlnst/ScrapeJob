"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import type { Page } from "@/types/page"
import { getAdminPageById } from "@/lib/api/pages"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { PageEditorForm } from "@/components/admin/page-editor-form"

export default function AdminEditPage() {
  const params = useParams<{ id: string }>()
  const id = typeof params?.id === "string" ? params.id : ""
  const [page, setPage] = React.useState<Page | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!id) return
    let active = true

    getAdminPageById(id)
      .then((result) => {
        if (active) {
          setPage(result)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load page")
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [id])

  return (
    <AdminShell>
      <AdminHeader
        title="Edit Page"
        description="Kelola konten halaman statis dan publish ke route publik."
      />
      {error ? (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : loading ? (
        <div className="border border-border bg-card p-4 text-sm text-muted-foreground">Loading page...</div>
      ) : page ? (
        <div className="border border-border bg-card p-5">
          <PageEditorForm page={page} />
        </div>
      ) : (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">Page not found.</div>
      )}
    </AdminShell>
  )
}
