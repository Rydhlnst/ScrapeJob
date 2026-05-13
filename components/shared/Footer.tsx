import Link from "next/link"

import { Github, Linkedin, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Container } from "@/components/shared/Container"

const columns = [
  {
    title: "Product",
    items: [
      { label: "Jobs", href: "/jobs" },
      { label: "Companies", href: "/#companies" },
      { label: "For Employers", href: "/#employers" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Insights", href: "/#insights" },
      { label: "Guides", href: "/#insights" },
      { label: "Help Center", href: "/#insights" },
      { label: "Status", href: "/#insights" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/#company" },
      { label: "Careers", href: "/#company" },
      { label: "Contact", href: "/#company" },
      { label: "Press", href: "/#company" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy", href: "/#legal" },
      { label: "Terms", href: "/#legal" },
      { label: "Cookies", href: "/#legal" },
      { label: "Security", href: "/#legal" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div>
                <div className="text-sm font-semibold tracking-tight">
                  Lowongaku
                </div>
                <div className="text-xs text-muted-foreground">
                  Premium job discovery platform.
                </div>
              </div>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Discover curated roles from trusted companies. Filter by role,
              salary, and work type in a clean, modern interface.
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl"
                aria-label="Twitter"
              >
                <Twitter className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl"
                aria-label="GitHub"
              >
                <Github className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title} className="space-y-3">
                <div className="text-sm font-semibold text-foreground">
                  {col.title}
                </div>
                <ul className="space-y-2">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground"
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

        <Separator className="my-10" />
        <div className="flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            © {new Date().getFullYear()} Lowongaku. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/#legal" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/#legal" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/#legal" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
