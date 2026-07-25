import { NextRequest, NextResponse } from "next/server"

const ADMIN_COOKIE = "admin_session"

// Server-side gate for /admin/*. Blocks the shell from rendering to unauth'd
// clients before AdminAuthGuard's client-side effect gets a chance to redirect.
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

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
