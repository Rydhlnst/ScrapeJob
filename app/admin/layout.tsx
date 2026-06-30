import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <TooltipProvider delayDuration={120}>
        <SidebarProvider>
          <div className="admin-modern flex min-h-screen w-full bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] text-foreground">
            <AdminSidebar />
            <SidebarInset className="bg-transparent p-3 md:p-5 lg:p-6">
              <div className="mb-3 md:hidden">
                <SidebarTrigger className="rounded-none border border-border bg-white text-foreground shadow-none" />
              </div>
              <div className="min-h-full border border-[var(--brand-shell-strong)] bg-[rgba(255,255,255,0.92)] p-4 shadow-[var(--shadow-md)] backdrop-blur md:p-6">
                {children}
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </AdminAuthGuard>
  )
}
