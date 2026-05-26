import Link from "next/link"

import { Blocks, BriefcaseBusiness, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Container } from "@/components/shared/Container"

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
      { label: "Tips Karier", href: "/#insights" },
      { label: "Bantuan", href: "/#faq" },
      { label: "Status", href: "/#status" },
    ],
  },
  {
    title: "Perusahaan",
    items: [
      { label: "Tentang", href: "/#company" },
      { label: "Karier", href: "/#company" },
      { label: "Kontak", href: "/#company" },
      { label: "Media", href: "/#company" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privasi", href: "/#legal" },
      { label: "Ketentuan", href: "/#legal" },
      { label: "Cookie", href: "/#legal" },
      { label: "Keamanan", href: "/#legal" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-[hsl(var(--primary-dark))] text-white">
      <Container className="py-14">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[hsl(var(--primary))] p-10 text-white shadow-sm md:p-12">
          <div className="relative z-10 max-w-2xl">
            <div className="text-3xl font-semibold tracking-tight md:text-4xl">
              Mulai langkah kariermu bersama Lowongaku
            </div>
            <p className="mt-3 text-sm text-white/75 md:text-base">
              Temukan lowongan terbaru di Indonesia, simpan favoritmu, dan apply
              lebih cepat dengan tampilan yang rapi.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-2xl bg-white text-[hsl(var(--primary))] hover:bg-white/90"
              >
                <Link href="/jobs">Cari lowongan</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="rounded-2xl bg-white/10 text-white hover:bg-white/15"
              >
                <Link href="/#how">Pelajari cara kerja</Link>
              </Button>
            </div>
          </div>

          {/* clean, plain background (no blobs / extra colors) */}
          <div className="pointer-events-none absolute inset-0 opacity-35">
            <div className="absolute -right-16 -top-16 size-72 rounded-full border border-white/10" />
            <div className="absolute -left-20 -bottom-20 size-80 rounded-full border border-white/10" />
          </div>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-3">
            <div className="text-sm font-semibold tracking-tight">Lowongaku</div>
            <div className="text-xs text-white/70">
              Platform pencarian kerja untuk Indonesia.
            </div>
            <p className="max-w-sm text-sm text-white/70">
              Cari lowongan berdasarkan posisi, lokasi, dan tipe kerja. Fokus ke
              yang penting—informasi jelas, tampilan bersih, dan proses cepat.
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Website"
              >
                <Globe className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Career"
              >
                <BriefcaseBusiness className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Community"
              >
                <Blocks className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title} className="space-y-3">
                <div className="text-sm font-semibold text-white">
                  {col.title}
                </div>
                <ul className="space-y-2">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-white/70 hover:text-white"
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

        <Separator className="my-10 bg-white/10" />
        <div className="flex flex-col gap-2 text-xs text-white/70 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Lowongaku. Hak cipta dilindungi.</div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/#legal" className="hover:text-white">
              Privasi
            </Link>
            <Link href="/#legal" className="hover:text-white">
              Ketentuan
            </Link>
            <Link href="/#legal" className="hover:text-white">
              Cookie
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
