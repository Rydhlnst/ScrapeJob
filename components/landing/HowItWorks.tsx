"use client"

import { useEffect, useState } from "react"
import { BriefcaseBusiness, FileText, Search, UserRound } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

const jobSeekerSteps = [
  {
    step: "1/3",
    icon: UserRound,
    title: "Create your profile",
    description:
      "Set up your profile with skills, experience, and preferences so matching jobs show up faster.",
    meta: "Member since Mar 2024",
    sampleTitle: "Jane Doe Sianjay",
    sampleSubtitle: "Product Designer",
    tags: ["Product Design", "UX Design", "UI Design"],
  },
  {
    step: "2/3",
    icon: Search,
    title: "Search curated roles",
    description:
      "Browse clearer job data with location, role, and work-type filters that reduce noisy listings.",
    meta: "Saved filters",
    sampleTitle: "Jakarta, Remote",
    sampleSubtitle: "Frontend, Product, Data",
    tags: ["Remote", "Full-time", "Hybrid"],
  },
  {
    step: "3/3",
    icon: FileText,
    title: "Apply with confidence",
    description:
      "Compare your shortlisted roles, review details faster, and continue to the official source when ready.",
    meta: "Application ready",
    sampleTitle: "3 jobs shortlisted",
    sampleSubtitle: "Ready for final review",
    tags: ["Saved", "Compared", "Applied"],
  },
]

const employerSteps = [
  {
    step: "1/3",
    icon: BriefcaseBusiness,
    title: "Publish your opening",
    description:
      "Create a clean job post with the essentials candidates need to understand the role quickly.",
    meta: "Hiring setup",
    sampleTitle: "Senior Backend Engineer",
    sampleSubtitle: "Jakarta Selatan, Hybrid",
    tags: ["Full-time", "Engineering", "Urgent"],
  },
  {
    step: "2/3",
    icon: Search,
    title: "Reach qualified candidates",
    description:
      "Distribute your vacancy through a clearer listing flow so strong applicants discover it faster.",
    meta: "Active reach",
    sampleTitle: "1,248 profile views",
    sampleSubtitle: "High intent candidates",
    tags: ["Verified", "Targeted", "Active"],
  },
  {
    step: "3/3",
    icon: FileText,
    title: "Review applications faster",
    description:
      "Shortlist candidates, compare profiles, and move qualified applicants to the next stage with less friction.",
    meta: "Review queue",
    sampleTitle: "12 candidates shortlisted",
    sampleSubtitle: "Ready for interview",
    tags: ["Shortlist", "Review", "Schedule"],
  },
]

export function HowItWorks() {
  const [audience, setAudience] = useState<"job-seekers" | "employers">("job-seekers")
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)

  const steps = audience === "job-seekers" ? jobSeekerSteps : employerSteps

  useEffect(() => {
    if (!api) return

    const handleSelect = () => {
      setActiveIndex(api.selectedScrollSnap())
    }

    handleSelect()
    api.on("select", handleSelect)
    api.scrollTo(0, true)

    return () => {
      api.off("select", handleSelect)
    }
  }, [api, audience])

  return (
    <section
      className="border-b bg-white py-16 md:py-20"
      id="how"
      style={{ borderColor: "var(--brand-shell-strong)" }}
    >
      <Container>
        <div className="max-w-4xl">
          <SectionHeader
            title="Start Your Journey to Career Success in Just Three Simple Steps"
            description="Our platform makes it easy for job seekers to find and land their dream jobs. Follow these three steps to get started on your path to success."
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAudience("job-seekers")}
              className="border px-5 py-3 text-sm font-medium transition-colors"
              style={{
                borderColor:
                  audience === "job-seekers"
                    ? "var(--brand-blue)"
                    : "var(--brand-shell-strong)",
                backgroundColor:
                  audience === "job-seekers" ? "var(--brand-blue)" : "#ffffff",
                color: audience === "job-seekers" ? "#ffffff" : "var(--brand-ink)",
              }}
            >
              Job Seekers
            </button>
            <button
              type="button"
              onClick={() => setAudience("employers")}
              className="border px-5 py-3 text-sm font-medium transition-colors"
              style={{
                borderColor:
                  audience === "employers"
                    ? "var(--brand-blue)"
                    : "var(--brand-shell-strong)",
                backgroundColor:
                  audience === "employers" ? "var(--brand-blue)" : "#ffffff",
                color: audience === "employers" ? "#ffffff" : "var(--brand-ink)",
              }}
            >
              Employers
            </button>
          </div>

          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <button
                key={step.step}
                type="button"
                aria-label={`Go to step ${index + 1}`}
                className="h-2.5 w-10 transition-opacity"
                style={{ backgroundColor: index === activeIndex ? "var(--brand-blue)" : "#bfdbfe" }}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>
        </div>

        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: false }}
          className="mt-10"
        >
          <CarouselContent>
            {steps.map((step) => {
              const Icon = step.icon

              return (
                <CarouselItem key={step.step}>
                  <div
                    className="border p-8 text-white md:p-10"
                    style={{
                      borderColor: "var(--brand-blue)",
                      backgroundColor: "var(--brand-blue)",
                    }}
                  >
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
                      <div className="flex min-h-full flex-col">
                        <div className="text-5xl font-medium tracking-[-0.05em] text-blue-100">
                          {step.step}
                        </div>
                        <div className="mt-8 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.05em] md:text-5xl">
                          {step.title}
                        </div>
                        <p className="mt-8 max-w-2xl text-base leading-8 text-blue-100">
                          {step.description}
                        </p>
                      </div>

                      <div
                        className="border bg-white p-6 md:p-8"
                        style={{
                          borderColor: "var(--brand-shell-strong)",
                          color: "var(--brand-ink)",
                        }}
                      >
                        <Icon
                          className="size-14"
                          style={{ color: "var(--brand-blue)" }}
                        />
                        <div
                          className="mt-6 text-sm"
                          style={{ color: "#64748b" }}
                        >
                          {step.meta}
                        </div>
                        <div className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                          {step.sampleTitle}
                        </div>
                        <div
                          className="mt-2 text-sm"
                          style={{ color: "#475569" }}
                        >
                          {step.sampleSubtitle}
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2">
                          {step.tags.map((tag) => (
                            <span
                              key={tag}
                              className="border px-3 py-2 text-sm"
                              style={{ borderColor: "var(--brand-shell-strong)" }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>

          <div className="mt-5 flex items-center justify-end gap-3">
            <CarouselPrevious className="static translate-y-0 rounded-none border-[var(--brand-shell-strong)] bg-white text-[var(--brand-ink)] hover:bg-[var(--brand-shell)]" />
            <CarouselNext className="static translate-y-0 rounded-none border-[var(--brand-shell-strong)] bg-white text-[var(--brand-ink)] hover:bg-[var(--brand-shell)]" />
          </div>
        </Carousel>
      </Container>
    </section>
  )
}


