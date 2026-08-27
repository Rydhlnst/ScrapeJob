import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Plus_Jakarta_Sans } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import { SiteConfigProvider } from "@/components/shared/site-config-provider"
import { getPublicSiteConfig } from "@/lib/api/site-config"
import { getServerWebsiteContext } from "@/lib/site/server-context"

import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
})

export async function generateMetadata(): Promise<Metadata> {
  const context = await getServerWebsiteContext()
  const config = await getPublicSiteConfig(context)
  return {
    title: config.metadata.title,
    description: config.metadata.description,
    icons: {
      icon: config.website.logo || "/logo.png",
      shortcut: config.website.logo || "/logo.png",
      apple: config.website.logo || "/logo.png",
    },
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const context = await getServerWebsiteContext()
  const config = await getPublicSiteConfig(context)

  return (
    <html lang="id">
      <body
        className={`${plusJakartaSans.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <SiteConfigProvider config={config}>{children}</SiteConfigProvider>
        <Toaster richColors />
      </body>
    </html>
  )
}
