"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SiteFrame } from "@/components/shared/SiteShell"
import { cn } from "@/lib/utils"

const topNavItems = [
  { label: "Explore", href: "/jobs" },
  { label: "What's New", href: "/#features" },
  { label: "Lowonganku Premium", href: "/#employers" },
]

const categoryItems = [
  { label: "Development & IT", href: "/jobs?category=it-software" },
  { label: "Marketing", href: "/jobs?category=marketing" },
  { label: "Design", href: "/jobs?category=design" },
  { label: "Sales", href: "/jobs?category=sales" },
  { label: "Customer Support", href: "/jobs?category=customer-service" },
  { label: "More", href: "/jobs" },
]

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Lowonganku home">
      <div className="flex h-12 w-12 items-center justify-center border-r border-[var(--brand-shell-strong)] pr-3">
        <Image
          src="/logo.png"
          alt="Lowonganku logo"
          width={28}
          height={28}
          className="h-7 w-7 rounded-none object-cover"
        />
      </div>
      <span className="text-lg font-semibold tracking-[-0.03em] text-[var(--brand-ink)]">
        Lowonganku
      </span>
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--brand-shell-strong)] bg-white">
      <SiteFrame className="bg-white">
        <div className="flex h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          <nav className="hidden items-center gap-8 lg:flex">
            {topNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[var(--brand-ink)] transition-colors hover:text-[var(--brand-blue)]"
              >
                {item.label}
              </Link>
            ))}
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-none border-[var(--brand-shell-strong)] bg-white px-5 text-sm font-medium text-[var(--brand-ink)] hover:bg-[var(--brand-shell)]"
            >
              <Link href="/#employers">Find Talent</Link>
            </Button>
            <Button
              asChild
              className="h-11 rounded-none bg-[var(--brand-blue)] px-5 text-sm font-medium text-white hover:bg-[var(--brand-sky)]"
            >
              <Link href="/jobs">Find Work</Link>
            </Button>
          </nav>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-none border-[var(--brand-shell-strong)] lg:hidden">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] border-l-[var(--brand-shell-strong)] bg-white">
              <SheetHeader>
                <SheetTitle>Lowonganku</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-3">
                {topNavItems.concat(categoryItems).map((item) => (
                  <Link
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    className={cn(
                      "block border border-[var(--brand-shell-strong)] px-4 py-3 text-sm font-medium text-[var(--brand-ink)]",
                      pathname?.startsWith(item.href) && "bg-[var(--brand-shell)]",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <nav className="hidden border-t border-[var(--brand-shell-strong)] px-4 sm:px-6 lg:block lg:px-8">
          <div className="flex min-h-12 items-center gap-7 overflow-x-auto whitespace-nowrap py-3">
            {categoryItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-[var(--brand-ink)] transition-colors hover:text-[var(--brand-blue)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </SiteFrame>
    </header>
  )
}
