import { AdminLanguageProvider } from "@/components/admin/admin-language"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <TooltipProvider delayDuration={120}>
        <AdminLanguageProvider>
          <SidebarProvider>
            <div className="admin-modern flex h-screen w-full overflow-hidden bg-zinc-50 text-foreground">
              <AdminSidebar />
              <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex h-12 flex-shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-4">
                  <SidebarTrigger className="rounded-md border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:bg-zinc-50" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                    Admin Panel
                  </span>
                </header>
                <main className="flex-1 overflow-y-auto bg-zinc-50 p-3 md:p-4">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </AdminLanguageProvider>
      </TooltipProvider>
    </AdminAuthGuard>
  )
}
