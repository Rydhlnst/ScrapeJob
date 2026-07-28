"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import type { Page } from "@/types/page"
import { listAdminPages } from "@/lib/api/pages"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { PagesTable } from "@/components/admin/pages-table"
import { Button } from "@/components/ui/button"

function AdminPagesPageInner() {
  const searchParams = useSearchParams()
  const statusParam = searchParams.get("status") ?? undefined
  const status = statusParam === "draft" || statusParam === "published" ? statusParam : undefined

  const [pages, setPages] = React.useState<Page[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  const loadPages = React.useCallback(async () => {
    const result = await listAdminPages({ status })
    setPages(result.data)
  }, [status])

  React.useEffect(() => {
    let active = true
    setLoading(true)

    loadPages()
      .then(() => {
        if (active) setLoading(false)
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load pages")
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [loadPages])

  const heading = status === "draft" ? "Pages · Draft" : status === "published" ? "Pages · Published" : "Pages"

  return (
    <AdminShell>
      <AdminHeader
        title={heading}
        description="Buat halaman statis seperti Contact Us, FAQ, disclaimer, dan halaman informasi lain di `/page/[slug]`."
        actions={
          <Button asChild className="rounded-none">
            <Link href="/admin/pages/new">Add page</Link>
          </Button>
        }
      />
      {error ? (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : loading ? (
        <div className="border border-border bg-card p-4 text-sm text-muted-foreground">Loading pages...</div>
      ) : (
        <PagesTable pages={pages} onRefresh={loadPages} />
      )}
    </AdminShell>
  )
}

export default function AdminPagesPage() {
  return (
    <React.Suspense fallback={<AdminShell><div className="border border-border bg-card p-4 text-sm text-muted-foreground">Loading pages...</div></AdminShell>}>
      <AdminPagesPageInner />
    </React.Suspense>
  )
}
