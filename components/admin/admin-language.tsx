"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type AdminLanguage = "en" | "id"

type AdminLanguageContextValue = {
  language: AdminLanguage
  setLanguage: (language: AdminLanguage) => void
}

const AdminLanguageContext = React.createContext<AdminLanguageContextValue | null>(null)
const STORAGE_KEY = "admin-language"

export function AdminLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = React.useState<AdminLanguage>("id")

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "en" || stored === "id") {
      setLanguage(stored)
    }
  }, [])

  const handleSetLanguage = React.useCallback((nextLanguage: AdminLanguage) => {
    setLanguage(nextLanguage)
    window.localStorage.setItem(STORAGE_KEY, nextLanguage)
  }, [])

  return (
    <AdminLanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </AdminLanguageContext.Provider>
  )
}

export function useAdminLanguage() {
  const context = React.useContext(AdminLanguageContext)

  if (!context) {
    throw new Error("useAdminLanguage must be used within AdminLanguageProvider")
  }

  return context
}

export function AdminLanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useAdminLanguage()

  const linkClass = (active: boolean) =>
    cn(
      "px-1 text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
      active ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-700",
    )

  return (
    <div className={cn("inline-flex items-center gap-1 text-xs", className)}>
      <button type="button" onClick={() => setLanguage("id")} className={linkClass(language === "id")}>
        ID
      </button>
      <span className="text-zinc-300" aria-hidden>
        |
      </span>
      <button type="button" onClick={() => setLanguage("en")} className={linkClass(language === "en")}>
        EN
      </button>
    </div>
  )
}
