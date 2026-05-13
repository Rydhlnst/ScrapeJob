"use client"

import Link from "next/link"

import { motion, useReducedMotion } from "framer-motion"
import { BadgeDollarSign, MapPin, Search } from "lucide-react"

import { jobs } from "@/constants/jobs"
import { cn } from "@/lib/utils"
import { Container } from "@/components/shared/Container"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

function TrustPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
      <div className="text-base font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function MiniJobRow({
  company,
  title,
}: {
  company: string
  title: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold text-foreground">
          {company}
        </div>
        <div className="truncate text-xs text-muted-foreground">{title}</div>
      </div>
      <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
        New
      </div>
    </div>
  )
}

export function HeroSection() {
  const reduceMotion = useReducedMotion()
  const featured = jobs.slice(0, 3)

  const baseTransition = reduceMotion ? { duration: 0 } : { duration: 0.55 }

  return (
    <section className="border-b border-border/70 bg-gradient-to-b from-card via-background to-background py-14 md:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-xl">
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={baseTransition}
              className="text-5xl font-semibold tracking-tight text-foreground md:text-6xl"
            >
              Find your job & make sure goal
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...baseTransition, delay: reduceMotion ? 0 : 0.08 }}
              className="mt-5 text-base text-muted-foreground md:text-lg"
            >
              Your dream job is waiting for you. Discover curated roles from
              trusted companies, filter by salary, location, and work type—then
              apply with confidence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...baseTransition, delay: reduceMotion ? 0 : 0.16 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button asChild className="rounded-xl shadow-sm">
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/#employers">For Employers</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...baseTransition, delay: reduceMotion ? 0 : 0.22 }}
              className="mt-10 grid grid-cols-3 gap-3"
            >
              <TrustPill value="10k+" label="Jobs Listed" />
              <TrustPill value="2k+" label="Companies" />
              <TrustPill value="Fast" label="Apply Flow" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...baseTransition, delay: reduceMotion ? 0 : 0.12 }}
            className="relative"
          >
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
              transition={
                reduceMotion
                  ? undefined
                  : { repeat: Infinity, duration: 5, ease: "easeInOut" }
              }
            >
              <Card className="rounded-3xl border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-foreground">
                    Job Search
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-[hsl(var(--success))]" />
                    Live jobs
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="h-11 rounded-xl pl-9"
                        placeholder="UI/UX Designer"
                        readOnly
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="h-11 rounded-xl pl-9"
                        placeholder="Anywhere"
                        readOnly
                      />
                    </div>
                    <div className="relative">
                      <BadgeDollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="h-11 rounded-xl pl-9"
                        placeholder="USD 3k - 15k"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["Product Designer", "Remote", "Backend Developer"].map((chip) => (
                      <span
                        key={chip}
                        className={cn(
                          "rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground",
                          "hover:bg-[hsl(var(--primary-soft))] hover:text-primary transition-colors",
                        )}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  <Separator />

                  <div className="grid gap-3">
                    {featured.map((j) => (
                      <MiniJobRow
                        key={j.id}
                        company={j.company}
                        title={j.title}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            <div className="pointer-events-none absolute -right-3 -top-3 hidden md:block">
              <div className="rounded-2xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm">
                <span className="text-primary">New</span> curated roles
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
