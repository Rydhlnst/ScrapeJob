import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

export const metadata: Metadata = {
  title: "Lowonganku - Temukan Pekerjaan Impianmu",
  description: "Lowonganku - portal lowongan kerja terpercaya di Indonesia",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-background font-sans text-foreground">
        {children}
        <Toaster richColors />
      </body>
    </html>
  )
}
