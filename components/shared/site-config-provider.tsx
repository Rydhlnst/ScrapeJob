"use client"

import { createContext, useContext, type CSSProperties, type ReactNode } from "react"
import type { SiteConfig } from "@/types"

const SiteConfigContext = createContext<SiteConfig | null>(null)

export function SiteConfigProvider({
  config,
  children,
}: {
  config: SiteConfig
  children: ReactNode
}) {
  const style = {
    "--brand-blue": config.branding.primaryColor,
    "--brand-orange": config.branding.accentColor,
    "--brand-ink": config.branding.inkColor,
    "--brand-background": config.branding.backgroundColor,
  } as CSSProperties

  return (
    <SiteConfigContext.Provider value={config}>
      <div className="contents" style={style}>{children}</div>
    </SiteConfigContext.Provider>
  )
}

export function useSiteConfig() {
  return useContext(SiteConfigContext) ?? {
    website: { id: "default", name: "Job platform", domain: "localhost", logo: null },
    branding: {
      primaryColor: "#1f5f9f",
      accentColor: "#f2a23a",
      inkColor: "#171717",
      backgroundColor: "#ffffff",
      theme: null,
    },
    tagline: "Job platform",
    metadata: { title: "Job platform", description: "Job platform" },
    contact: { email: null },
    features: {},
  } satisfies SiteConfig
}
