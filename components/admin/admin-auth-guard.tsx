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
  }, [router])

  if (!ready) {
    return null
  }

  return <>{children}</>
}
