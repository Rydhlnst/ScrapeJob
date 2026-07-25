import { NextRequest, NextResponse } from "next/server"

const COOKIE_NAME = "admin_session"
// 8 hours — mirror Sanctum default token TTL band. Adjust if backend changes.
const MAX_AGE_SECONDS = 60 * 60 * 8

// POST /api/auth/admin/session
// Body: { token: string }
// Sets an HttpOnly cookie the Next middleware uses to gate /admin/* routes.
// The bearer token itself still lives in localStorage for XHR calls to Laravel;
// this cookie is a server-side presence signal only.
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const token = (body as { token?: unknown })?.token
  if (typeof token !== "string" || token.length < 8) {
    return NextResponse.json({ error: "Missing or invalid token" }, { status: 400 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set({
    name: COOKIE_NAME,
    value: "1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  })
  return res
}

// DELETE /api/auth/admin/session — logout / 401 clear
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return res
}
