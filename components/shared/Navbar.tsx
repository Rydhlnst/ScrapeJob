"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const navItems = [
  { label: "Jobs", href: "/jobs" },
]

function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <Image src="/logo.png" alt="Lowonganku logo" width={32} height={32} className="h-8 w-8 rounded-md object-cover" />
      <span className="text-base font-semibold text-[#151515]">Lowongaku</span>
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#F7F8F4]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Logo />
        </div>

        <nav className="hidden items-center justify-center gap-2 lg:flex">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-white hover:text-neutral-950",
                  active && "bg-white text-neutral-950 shadow-sm font-semibold",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="rounded-full border bg-white px-4 py-2 text-sm font-semibold text-neutral-600 shadow-sm">
            12.4K Jobs
          </div>
          <Link
            href="/login"
            className="rounded-full px-5 py-2 text-sm font-semibold text-neutral-700 hover:bg-white"
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-[#151515] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2A2A2A]"
          >
            Sign up
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden rounded-full border bg-white px-4 py-2 text-sm font-semibold"
        >
          Menu
        </button>
      </div>
    </header>
  )
}
