"use client"

import * as React from "react"

import { listAdminCategories } from "@/lib/api/admin-categories"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { CategoryTable } from "@/components/admin/category-table"
import type { Category } from "@/types"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true

    listAdminCategories()
      .then((result) => {
        if (active) {
          setCategories(result)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load categories")
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <AdminShell>
      <AdminHeader
        title="Categories"
        description="Jaga struktur kategori publik tetap rapi dan mudah dipakai oleh landing page serta listing jobs."
      />
      {error ? (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : loading ? (
        <div className="border border-border bg-card p-4 text-sm text-muted-foreground">Loading categories...</div>
      ) : (
        <CategoryTable categories={categories} />
      )}
    </AdminShell>
  )
}
