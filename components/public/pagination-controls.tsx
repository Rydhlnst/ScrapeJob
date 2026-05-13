"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"

function buildHref(params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params)
  next.set("page", String(page))
  return `/jobs?${next.toString()}`
}

export function PaginationControls({
  page,
  totalPages,
}: {
  page: number
  totalPages: number
}) {
  const params = useSearchParams()
  const current = new URLSearchParams(params.toString())
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div className="flex items-center justify-between gap-3">
      <Button asChild variant="outline" className="rounded-2xl" disabled={!canPrev}>
        <Link aria-disabled={!canPrev} href={buildHref(current, Math.max(1, page - 1))}>
          Prev
        </Link>
      </Button>
      <div className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> / {totalPages}
      </div>
      <Button asChild variant="outline" className="rounded-2xl" disabled={!canNext}>
        <Link aria-disabled={!canNext} href={buildHref(current, Math.min(totalPages, page + 1))}>
          Next
        </Link>
      </Button>
    </div>
  )
}
