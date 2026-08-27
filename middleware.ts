import { NextRequest, NextResponse } from "next/server"

const ADMIN_COOKIE = "admin_session"

// Server-side gate for /admin/*. Blocks the shell from rendering to unauth'd
// clients before AdminAuthGuard's client-side effect gets a chance to redirect.
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const normalizeHostname = (value: string | null) => {
    if (!value) return ""
    const firstValue = value.split(",", 1)[0].trim().toLowerCase()
    if (firstValue.startsWith("[")) {
      const closingBracket = firstValue.indexOf("]")
      return closingBracket > 0 ? firstValue.slice(1, closingBracket) : firstValue
    }
    return (firstValue.match(/:/g) ?? []).length === 1 ? firstValue.split(":", 1)[0] : firstValue
  }
  const forwardedHostname = normalizeHostname(req.headers.get("x-forwarded-host"))
  const requestHostname = normalizeHostname(req.headers.get("host"))
  const hostname = forwardedHostname && forwardedHostname !== req.nextUrl.hostname.toLowerCase()
    ? forwardedHostname
    : requestHostname || forwardedHostname || req.nextUrl.hostname.toLowerCase()
  const adminDomain = (process.env.CMS_ADMIN_DOMAIN ?? "lowonganku.com").toLowerCase()
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(hostname)

  if (!isLocal && hostname !== adminDomain && hostname !== "www." + adminDomain) {
    const url = req.nextUrl.clone()
    url.protocol = req.nextUrl.protocol
    url.hostname = adminDomain
    return NextResponse.redirect(url)
  }

  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next()
  }

  const hasSession = Boolean(req.cookies.get(ADMIN_COOKIE)?.value)
  if (!hasSession) {
    const url = req.nextUrl.clone()
    url.pathname = "/admin/login"
    url.search = ""
    if (pathname !== "/admin") {
      url.searchParams.set("next", pathname + search)
    }
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
