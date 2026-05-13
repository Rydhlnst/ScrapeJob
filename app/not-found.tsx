import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex max-w-6xl px-4 py-16">
        <Card className="w-full rounded-2xl border-border bg-card p-10 text-center shadow-sm">
          <div className="text-2xl font-semibold tracking-tight text-foreground">
            Page not found
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            The page you’re looking for doesn’t exist.
          </div>
          <div className="mt-6 flex justify-center gap-2">
            <Button asChild className="rounded-xl">
              <Link href="/">Go home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/jobs">Browse jobs</Link>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}

