import Link from "next/link"

import { Container } from "@/components/shared/Container"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function CTASection() {
  return (
    <section className="py-14 md:py-20">
      <Container>
        <Card
          className="relative overflow-hidden rounded-3xl border-border bg-[hsl(var(--primary))] p-10 text-primary-foreground shadow-sm md:p-12"
          id="employers"
        >
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Siap dapat peluang karier berikutnya?
            </h3>
            <p className="mt-3 text-sm text-primary-foreground/80 md:text-base">
              Mulai cari lowongan dari perusahaan terpercaya dan temukan posisi
              yang cocok dengan target kariermu.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="rounded-xl bg-white text-primary hover:bg-white/90">
                <Link href="/jobs">Cari lowongan</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="rounded-xl bg-white/10 text-white hover:bg-white/15"
              >
                <Link href="/#how">Buat profil</Link>
              </Button>
            </div>
          </div>

          {/* clean, plain background (no blobs / extra colors) */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -right-16 -top-16 size-72 rounded-full border border-white/10" />
            <div className="absolute -left-20 -bottom-20 size-80 rounded-full border border-white/10" />
          </div>
        </Card>
      </Container>
    </section>
  )
}
