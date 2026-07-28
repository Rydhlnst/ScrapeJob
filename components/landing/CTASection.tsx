import Link from "next/link"
import { Sparkles } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { Button } from "@/components/ui/button"
import type { LandingCtaContent } from "@/types/landing-content"

export function CTASection({ content }: { content: LandingCtaContent }) {
  const title = content.title?.trim() || "Siap Menemukan Karier Impianmu?"
  const body =
    content.body?.trim() ||
    "Tanpa perlu daftar atau login — langsung jelajahi ribuan lowongan dan lanjutkan lamaranmu di sumber resmi dalam hitungan menit."
  const primaryLabel = content.primaryButton.label?.trim() || "Mulai cari lowongan"
  const secondaryLabel = content.secondaryButton.label?.trim() || "Hubungi kami"

  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-6 py-14 text-center text-white shadow-[0_20px_60px_-20px_rgba(29,78,216,0.5)] md:px-12 md:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-blue-400/20 blur-3xl"
          />

          <div className="relative mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              Langkah Terakhir
            </div>

            <h2 className="mt-6 text-3xl font-bold leading-[1.1] tracking-[-0.03em] md:text-5xl">
              {title}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
              {body}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                className="h-12 rounded-full bg-white px-6 text-sm font-semibold text-[var(--brand-blue)] shadow-[0_8px_24px_-8px_rgba(255,255,255,0.4)] hover:bg-blue-50"
              >
                <Link href={content.primaryButton.href}>{primaryLabel}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-white/40 bg-transparent px-6 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Link href={content.secondaryButton.href}>{secondaryLabel}</Link>
              </Button>
            </div>

            <p className="mt-6 text-xs text-white/70">
              100% gratis · Tanpa akun · Diakses 200.000+ pencari kerja / bulan
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
