import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Plus_Jakarta_Sans } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
})

export const metadata: Metadata = {
  title: "Lowonganku - Temukan Lowongan Kerja Terbaru",
  description:
    "Lowonganku membantu mencari lowongan kerja terpercaya dari berbagai sumber dalam satu tempat.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body
        className={`${plusJakartaSans.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        {children}
        <Toaster richColors />
      </body>
    </html>
  )
}
