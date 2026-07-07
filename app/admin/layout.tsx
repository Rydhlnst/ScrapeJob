import { AdminLanguageProvider, AdminLanguageToggle } from "@/components/admin/admin-language"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <TooltipProvider delayDuration={120}>
        <AdminLanguageProvider>
          <SidebarProvider>
            <div className="admin-modern flex min-h-screen w-full bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] text-foreground">
              <AdminSidebar />
              <SidebarInset className="bg-white p-3 md:p-5 lg:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <SidebarTrigger className="rounded-none border border-border bg-white text-foreground shadow-none" />
                    <div className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 md:block">
                      Admin Panel
                    </div>
                  </div>
                  <AdminLanguageToggle />
                </div>
                <div className="min-h-full border border-[var(--brand-shell-strong)] bg-white p-4 shadow-[var(--shadow-md)] md:p-6">
                  {children}
                </div>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </AdminLanguageProvider>
      </TooltipProvider>
    </AdminAuthGuard>
  )
}

