import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={120}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AdminSidebar />
          <SidebarInset className="p-3 md:p-5 lg:p-6">
            <div className="mb-3 md:hidden">
              <SidebarTrigger className="rounded-lg border border-border bg-card text-foreground shadow-sm" />
            </div>
            <div className="min-h-full rounded-2xl border border-border/70 bg-card/30 p-4 md:p-6">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
