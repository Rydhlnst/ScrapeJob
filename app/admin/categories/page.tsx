import { listCategories } from "@/lib/api/categories"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { CategoryTable } from "@/components/admin/category-table"

export default async function AdminCategoriesPage() {
  const categories = await listCategories()
  return (
    <AdminShell>
      <AdminHeader
        title="Categories"
        description="Jaga struktur kategori publik tetap rapi dan mudah dipakai oleh landing page serta listing jobs."
      />
      <CategoryTable categories={categories} />
    </AdminShell>
  )
}
