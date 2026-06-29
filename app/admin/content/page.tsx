import { AdminShell } from "@/components/admin/admin-shell"
import { LandingContentEditor } from "@/components/admin/landing-content-editor"
import { getAdminLandingPageContent } from "@/lib/api/landing-page-content"

export default async function AdminContentPage() {
  const content = await getAdminLandingPageContent()

  return (
    <AdminShell>
      <LandingContentEditor initialRecord={content} />
    </AdminShell>
  )
}
