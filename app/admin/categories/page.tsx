import { listCategories } from "@/lib/api/categories"
import { AdminHeader } from "@/components/admin/admin-header"
import { CategoryTable } from "@/components/admin/category-table"

export default async function AdminCategoriesPage() {
  const categories = await listCategories()
  return (
    <div>
      <AdminHeader
        title="Categories"
        description="CRUD kategori (mock)."
      />
      <div className="p-4 md:p-6">
        <CategoryTable categories={categories} />
      </div>
    </div>
  )
}

