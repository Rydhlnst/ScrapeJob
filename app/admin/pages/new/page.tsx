import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { PageEditorForm } from "@/components/admin/page-editor-form"

export default function AdminNewPage() {
  return (
    <AdminShell>
      <AdminHeader
        title="Create Page"
        description="Tambahkan halaman statis baru untuk kebutuhan CMS dan informasi publik."
      />
      <div className="border border-border bg-card p-5">
        <PageEditorForm />
      </div>
    </AdminShell>
  )
}
