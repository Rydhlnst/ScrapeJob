import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { LandingSectionCopy } from "@/types/landing-content"

const fallbackContent: LandingSectionCopy["footer"] = {
  eyebrow: "Siap menemukan peluang berikutnya?", title: "Jelajahi lowongan", description: "Explore job opportunities with more clarity, more confidence, and less noise.", columns: [
  { title: "Explore", links: [{ label: "Jobs", href: "/jobs" }, { label: "Categories", href: "/#categories" }, { label: "Career guide", href: "/#how" }] },
  { title: "Company", links: [{ label: "About", href: "/#about" }, { label: "Contact", href: "/contact" }, { label: "Blog", href: "/blog" }] },
  { title: "Resources", links: [{ label: "Help center", href: "/contact" }, { label: "Privacy", href: "/#about" }, { label: "Terms", href: "/#about" }] },
  ],
}

export function Footer({ content }: { content?: LandingSectionCopy["footer"] }) {
  const footer = content ?? fallbackContent
  return (
    <footer className="relative w-screen overflow-hidden bg-[#1f5f9f] text-white">
      <div className="pointer-events-none absolute -right-20 -top-28 size-[430px] rounded-full border-[62px] border-white/10" />
      <div className="pointer-events-none absolute right-20 top-16 h-2 w-32 rounded-full bg-[#ffd36a]" />
      <div className="pointer-events-none absolute -bottom-48 right-[18%] size-[410px] -rotate-45 border-[82px] border-white/10" />
      <div className="relative mx-auto max-w-[1400px] px-7 py-16 sm:px-12 lg:px-16 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[#ffd36a]">{footer.eyebrow}</p>
          <Link href="/jobs" className="group mt-3 inline-flex items-center gap-3 border-b border-white/55 pb-3 text-4xl font-extrabold tracking-[-.065em] text-white transition-colors hover:text-[#ffd36a] sm:text-5xl">{footer.title} <ArrowRight className="size-9 transition-transform group-hover:translate-x-1" /></Link>
        </div>

        <div className="mt-16 grid gap-12 border-t border-white/20 pt-12 md:grid-cols-[1.35fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2.5"><Image src="/logo.png" alt="Lowonganku" width={34} height={34} className="size-8 object-contain brightness-0 invert" /><span className="font-extrabold tracking-[-.04em] text-white">Lowonganku</span></Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/70">{footer.description}</p>
          </div>
          {footer.columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-extrabold text-white">{column.title}</h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => <li key={link.label}><Link href={link.href} className="text-sm text-white/65 transition-colors hover:text-[#ffd36a]">{link.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-white/20 pt-6 text-xs text-white/55">© {new Date().getFullYear()} Lowonganku. All rights reserved.</div>
      </div>
    </footer>
  )
}
