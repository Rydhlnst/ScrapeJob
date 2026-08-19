import { NextRequest } from "next/server"

function backendUrl(request: NextRequest) {
  const base = (process.env.INTERNAL_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "")
  return `${base}/api/jobs${request.nextUrl.search}`
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(backendUrl(request), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    return new Response(await response.text(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
    })
  } catch {
    return Response.json({ success: false, message: "Job service is temporarily unavailable." }, { status: 503 })
  }
}
