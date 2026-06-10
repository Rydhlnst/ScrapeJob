import Link from "next/link"
import { BriefcaseBusiness, Globe, ShieldCheck } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { SiteFrame } from "@/components/shared/SiteShell"
import { Button } from "@/components/ui/button"

const columns = [
  {
    title: "Produk",
    items: [
      { label: "Lowongan", href: "/jobs" },
      { label: "Perusahaan", href: "/#companies" },
      { label: "Untuk Perusahaan", href: "/#employers" },
    ],
  },
  {
    title: "Resource",
    items: [
      { label: "Panduan", href: "/#how" },
      { label: "Tips Karier", href: "/#jobs" },
      { label: "Bantuan", href: "/#how" },
      { label: "Status", href: "/#companies" },
    ],
  },
  {
    title: "Perusahaan",
    items: [
      { label: "Tentang", href: "/#about" },
      { label: "Karier", href: "/jobs" },
      { label: "Kontak", href: "/#employers" },
      { label: "Media", href: "/#companies" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privasi", href: "/#about" },
      { label: "Ketentuan", href: "/#about" },
      { label: "Cookie", href: "/#about" },
      { label: "Keamanan", href: "/#about" },
    ],
  },
]

const iconLinks = [
  { label: "Website", href: "/", icon: Globe },
  { label: "Career", href: "/jobs", icon: BriefcaseBusiness },
  { label: "Trust", href: "/#about", icon: ShieldCheck },
]

export function Footer() {
  return (
    <footer className="border-t border-[var(--brand-shell-strong)] bg-white">
      <SiteFrame className="border-t-0 bg-white">
        <Container className="py-14">
          <div className="grid gap-12 border border-[var(--brand-shell-strong)] bg-[var(--brand-shell)] p-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:p-10 lg:gap-16">
            <div className="flex flex-col justify-between gap-10">
              <div className="max-w-2xl">
                <div className="text-4xl font-semibold leading-none tracking-[-0.06em] text-[var(--brand-ink)] md:text-6xl">
                  Find work. Share work. All in one place.
                </div>
                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 md:text-base">
                  Temukan lowongan terbaru dari berbagai sumber, bandingkan pilihan,
                  lalu lanjutkan ke sumber resmi dengan pengalaman yang lebih jelas.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="h-11 rounded-none bg-[var(--brand-blue)] px-5 text-white hover:bg-[var(--brand-sky)]"
                  >
                    <Link href="/jobs">Cari lowongan</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-none border-[var(--brand-shell-strong)] bg-white px-5 text-[var(--brand-ink)] hover:bg-[var(--brand-shell)]"
                  >
                    <Link href="/#how">Pelajari cara kerja</Link>
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm font-semibold tracking-tight text-[var(--brand-ink)]">
                  Lowonganku
                </div>
                <p className="max-w-sm text-sm leading-7 text-slate-600">
                  Platform pencarian kerja untuk Indonesia dengan fokus pada listing
                  yang lebih jelas, rapi, dan cepat dibaca.
                </p>
                <div className="flex items-center gap-2">
                  {iconLinks.map((item) => {
                    const Icon = item.icon

                    return (
                      <Button
                        key={item.label}
                        asChild
                        size="icon"
                        variant="ghost"
                        className="rounded-none border border-[var(--brand-shell-strong)] bg-white text-slate-500 hover:bg-[var(--brand-shell)] hover:text-[var(--brand-ink)]"
                      >
                        <Link href={item.href} aria-label={item.label}>
                          <Icon className="size-4" />
                        </Link>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              {columns.map((col) => (
                <div key={col.title} className="space-y-4">
                  <div className="text-sm font-semibold tracking-tight text-[var(--brand-ink)]">
                    {col.title}
                  </div>
                  <ul className="space-y-3">
                    {col.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="text-sm leading-6 text-slate-600 transition-colors hover:text-[var(--brand-blue)]"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-[var(--brand-shell-strong)] pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
            <div>(c) {new Date().getFullYear()} Lowonganku. Hak cipta dilindungi.</div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/#about" className="hover:text-[var(--brand-ink)]">
                Privasi
              </Link>
              <Link href="/#about" className="hover:text-[var(--brand-ink)]">
                Ketentuan
              </Link>
              <Link href="/#about" className="hover:text-[var(--brand-ink)]">
                Cookie
              </Link>
            </div>
          </div>
        </Container>
      </SiteFrame>
    </footer>
  )
}
