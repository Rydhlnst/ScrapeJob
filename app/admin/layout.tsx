import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <TooltipProvider delayDuration={120}>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-[var(--brand-shell)] text-foreground">
            <AdminSidebar />
            <SidebarInset className="bg-[var(--brand-shell)] p-3 md:p-5 lg:p-6">
              <div className="mb-3 md:hidden">
                <SidebarTrigger className="rounded-none border border-border bg-card text-foreground shadow-none" />
              </div>
              <div className="min-h-full border border-border bg-card p-4 md:p-6">
                {children}
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </AdminAuthGuard>
  )
}
