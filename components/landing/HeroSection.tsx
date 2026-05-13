"use client"

import Link from "next/link"

import { motion, useReducedMotion } from "framer-motion"
import { MapPin, Search, Sparkles } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function TrustPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
      <div className="text-base font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

export function HeroSection() {
  const reduceMotion = useReducedMotion()
  const baseTransition = reduceMotion ? { duration: 0 } : { duration: 0.55 }

  return (
    <section className="border-b border-border/70 bg-gradient-to-b from-white via-background to-background py-14 md:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...baseTransition, delay: reduceMotion ? 0 : 0.02 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-[hsl(var(--muted))] px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]"
            >
              <span className="grid size-5 place-items-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--dark))]">
                <Sparkles className="size-3.5" />
              </span>
              Best Job Recommendation Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={baseTransition}
              className="mt-4 text-5xl font-semibold tracking-tight text-foreground md:text-6xl lg:text-7xl"
            >
              Find Your Next Career Opportunity
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...baseTransition, delay: reduceMotion ? 0 : 0.08 }}
              className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              Discover jobs that match your skills, experience, and career goals
              through tailored recommendations—fast, clean, and trustworthy.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...baseTransition, delay: reduceMotion ? 0 : 0.12 }}
              className="mt-7 flex flex-wrap gap-3"
            >
              <Button
                asChild
                className="rounded-2xl bg-[hsl(var(--dark))] text-white hover:bg-[hsl(var(--dark-soft))]"
              >
                <Link href="/#features">Get Started Now</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-2xl border-border bg-card hover:bg-muted"
              >
                <Link href="/jobs">Explore Jobs</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...baseTransition, delay: reduceMotion ? 0 : 0.18 }}
              className="mt-10 grid grid-cols-3 gap-3"
            >
              <TrustPill value="10k+" label="Jobs listed" />
              <TrustPill value="2k+" label="Companies" />
              <TrustPill value="95%" label="Match accuracy" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...baseTransition, delay: reduceMotion ? 0 : 0.12 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[36px] border border-border bg-[hsl(var(--primary))] shadow-sm">
              <div className="absolute inset-0">
                <div className="absolute -right-24 -top-24 size-80 rounded-full bg-[hsl(var(--accent))] blur-3xl opacity-70" />
                <div className="absolute -left-28 -bottom-28 size-96 rounded-full bg-black/25 blur-3xl" />
                <div className="absolute inset-y-0 right-0 w-[46%] bg-[hsl(var(--accent))]" />
                <div className="absolute right-[-18%] top-[-20%] size-[520px] rounded-full border border-white/10 bg-white/5" />
              </div>

              <div className="relative p-8 md:p-10">
                <motion.div
                  animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                  transition={
                    reduceMotion
                      ? undefined
                      : { repeat: Infinity, duration: 6, ease: "easeInOut" }
                  }
                  className="mx-auto max-w-md"
                >
                  <Card className="rounded-[28px] border border-white/10 bg-white/95 p-6 shadow-xl backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-2xl bg-[hsl(var(--accent))] text-[hsl(var(--dark))]">
                        <Sparkles className="size-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          Job Recommendation
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Personalized job suggestions
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {["Remote", "Freelance", "Onsite"].map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border bg-[hsl(var(--muted))] px-3 py-1 text-xs font-semibold text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-3">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="h-12 rounded-2xl pl-10"
                          placeholder="Location"
                          defaultValue="Jakarta, Indonesia"
                        />
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="h-12 rounded-2xl pl-10"
                          placeholder="Job role"
                          defaultValue="UI Designer"
                        />
                      </div>
                      <Button className="h-12 rounded-2xl bg-[hsl(var(--dark))] text-white hover:bg-[hsl(var(--dark-soft))]">
                        Search Jobs
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
