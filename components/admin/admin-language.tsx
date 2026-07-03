"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
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

  return (
    <div className={cn("inline-flex items-center gap-1 border border-[var(--brand-shell-strong)] bg-white p-1 shadow-[var(--shadow-sm)]", className)}>
      <Button
        type="button"
        variant={language === "id" ? "default" : "ghost"}
        className={cn(
          "h-9 rounded-none px-3 text-xs font-semibold uppercase tracking-[0.14em]",
          language === "id" ? "bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-sky)]" : "text-slate-600 hover:bg-[var(--brand-shell)] hover:text-[var(--brand-ink)]",
        )}
        onClick={() => setLanguage("id")}
      >
        ID
      </Button>
      <Button
        type="button"
        variant={language === "en" ? "default" : "ghost"}
        className={cn(
          "h-9 rounded-none px-3 text-xs font-semibold uppercase tracking-[0.14em]",
          language === "en" ? "bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-sky)]" : "text-slate-600 hover:bg-[var(--brand-shell)] hover:text-[var(--brand-ink)]",
        )}
        onClick={() => setLanguage("en")}
      >
        EN
      </Button>
    </div>
  )
}
