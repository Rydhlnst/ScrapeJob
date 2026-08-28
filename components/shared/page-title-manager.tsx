"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { useSiteConfig } from "@/components/shared/site-config-provider"

function titleForAdminRoute(pathname: string, status: string | null) {
  if (pathname === "/admin" || pathname === "/admin/dashboard") return "Dashboard"
  if (pathname === "/admin/jobs") {
    if (status === "published") return "Published Jobs"
    if (status === "archived") return "Archived Jobs"
    return "Draft Jobs"
  }
  if (pathname.startsWith("/admin/jobs/") && pathname.endsWith("/preview")) return "Job Preview"
  if (pathname.startsWith("/admin/jobs/")) return "Edit Job"
  if (pathname === "/admin/raw-data") return "Scraped Jobs Review"
  if (pathname === "/admin/scrape-runs") return "Scrape Runs"
  if (pathname === "/admin/content") return "Landing CMS"
  if (pathname === "/admin/pages/new") return "Create Page"
  if (pathname === "/admin/pages") return "Pages"
  if (pathname.startsWith("/admin/pages/")) return "Edit Page"
  if (pathname === "/admin/categories") return "Categories"
  if (pathname === "/admin/locations") return "Locations"
  if (pathname === "/admin/job-sources") return "Job Sources"
  if (pathname === "/admin/websites") return "Websites"
  if (pathname === "/admin/settings" || pathname === "/admin/settings/general") return "General Settings"
  if (pathname === "/admin/settings/users") return "Users & Roles"
  if (pathname === "/admin/settings/api") return "API Settings"
  if (pathname === "/admin/settings/notifications") return "Notifications"
  if (pathname === "/admin/settings/audit") return "Audit Log"
  if (pathname === "/admin/login") return "Admin Login"
  return null
}

function titleForRoute(pathname: string, siteName: string, status: string | null) {
  if (pathname === "/") return null

  const adminTitle = pathname.startsWith("/admin/") || pathname === "/admin"
    ? titleForAdminRoute(pathname, status)
    : pathname === "/jobs"
      ? "Jobs"
      : pathname === "/blog"
        ? "Blog"
        : pathname === "/contact"
          ? "Contact"
          : pathname === "/login"
            ? "Login"
            : null

  return adminTitle ? `${adminTitle} | ${siteName}` : null
}

export function PageTitleManager() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const siteConfig = useSiteConfig()
  const siteName = siteConfig.website.name || "Lowonganku.com"
  const status = searchParams.get("status")
  const title = titleForRoute(pathname, siteName, status)

  React.useEffect(() => {
    if (!title) return

    const applyTitle = () => {
      if (document.title !== title) document.title = title
    }

    applyTitle()
    const observer = new MutationObserver(applyTitle)
    observer.observe(document.head, { childList: true, subtree: true, characterData: true })

    return () => observer.disconnect()
  }, [pathname, siteName, title])

  return null
}
