"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const token = window.localStorage.getItem("admin_access_token")

    if (!token) {
      router.replace("/admin/login")
      return
    }

    setReady(true)

    // If any API call sees a 401, fetchJson dispatches this event so we can
    // bounce back to login instead of leaving the shell rendered with a stale token.
    const onInvalid = () => {
      setReady(false)
      router.replace("/admin/login")
    }
    window.addEventListener("admin:auth:invalid", onInvalid)
    return () => window.removeEventListener("admin:auth:invalid", onInvalid)
  }, [router])

  if (!ready) {
    return null
  }

  return <>{children}</>
}
