import { BriefcaseBusiness, MapPin } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import type { Job } from "@/types"
import type { LandingSectionCopy } from "@/types/landing-content"

export function LandingEyebrow({ children }: { children: ReactNode }) {
  return <span className="jobkan-label">{children}</span>
}

export function OrbitDoodle({
  className,
  color = "blue",
}: {
  className?: string
  color?: "blue" | "yellow"
}) {
  const fill = color === "blue" ? "#3f95e8" : "#ffd36a"

  return (
    <svg aria-hidden className={className} viewBox="0 0 160 120" fill="none">
      <circle cx="80" cy="60" r="31" fill={fill} stroke="#171717" strokeWidth="4" />
      <path d="M13 78c20-31 78-59 132-45 10 3 12 10 5 15-22 17-86 38-126 29-12-3-16-11-11-17Z" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
      <path d="M47 37c15 7 37 7 53 1" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function Scribble({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 112 36" fill="none">
      <path d="M4 22c10-18 15 11 27 0 8-8 13-21 20-8 4 8 11 12 17 0 7-14 14 10 22 0 7-9 10-10 18-3" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function JobPreviewCard({ job, index = 0, compact = false, copy }: { job?: Job; index?: number; compact?: boolean; copy?: LandingSectionCopy["visuals"] }) {
  const title = job?.title ?? ["Product Designer", "Backend Developer", "Digital Marketing"][index % 3]
  const company = job?.companyName ?? ["Karya Studio", "Nusantara Tech", "Grow Indonesia"][index % 3]
  const location = job?.location ?? "Jakarta, Indonesia"
  const hues = ["border border-[#3f95e8]/30 bg-white text-[#2479d1]", "border border-[#ffd36a] bg-white text-[#9a6700]", "border border-black/10 bg-white text-slate-600"]
  const href = job?.slug ? `/jobs/${job.slug}` : "/jobs"

  return (
    <Link
      href={href}
      aria-label={`Buka detail lowongan ${title}`}
      className={`group block rounded-2xl border border-black/10 bg-white ${compact ? "px-4 py-3" : "px-5 py-4"} shadow-[0_5px_0_rgba(23,23,23,.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ffd36a] hover:shadow-[0_9px_0_rgba(23,23,23,.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3f95e8]`}
    >
      <div className="flex items-center gap-3">
        <div className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-extrabold ${hues[index % hues.length]}`}>
          {company.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold tracking-[-.02em] text-[#171717] group-hover:text-[#2479d1]">{title}</p>
          <p className="truncate text-xs text-slate-500">{company}</p>
        </div>
        {!compact ? <span className="rounded-full bg-[#eff8ff] px-2 py-1 text-[10px] font-bold text-[#2479d1]">{copy?.cardStatusLabel ?? "Baru"}</span> : null}
      </div>
      {!compact ? (
        <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2.5 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{location}</span>
          <span className="font-bold text-[#171717]">{copy?.cardDetailLabel ?? "Lihat detail"}</span>
        </div>
      ) : null}
    </Link>
  )
}

export function JobBoardArtwork({ jobs = [], copy }: { jobs?: Job[]; copy?: LandingSectionCopy["visuals"] }) {
  return (
    <div className="relative mx-auto h-[390px] w-full max-w-[1080px] sm:h-[500px]">
      <div className="absolute inset-x-10 bottom-2 top-10 overflow-hidden rounded-[30px] border border-white/30 bg-[#3f95e8] shadow-[0_20px_0_rgba(23,23,23,.08)]">
        <div className="absolute left-7 top-7 text-sm font-extrabold text-white">Lowonganku — jobs for you</div>
        <div className="absolute inset-x-7 bottom-6 top-20 space-y-3">
          <JobPreviewCard job={jobs[0]} index={0} compact copy={copy} />
          <JobPreviewCard job={jobs[1]} index={1} compact copy={copy} />
          <JobPreviewCard job={jobs[2]} index={2} compact copy={copy} />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-[43%] rotate-[-9deg] rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_16px_0_rgba(23,23,23,.08)]">
        <p className="text-xs font-extrabold text-[#171717]">{copy?.sideTitle ?? "Start with the right role"}</p>
        <p className="mt-2 text-[11px] leading-4 text-slate-500">{copy?.sideDescription ?? "Search thousands of verified openings in one simple place."}</p>
        <div className="mt-4 rounded-full bg-[#1c0d0d] px-3 py-2 text-center text-[10px] font-bold text-white">{copy?.sideActionLabel ?? "Explore jobs"}</div>
      </div>
      <div className="absolute bottom-1 left-1/2 w-[40%] -translate-x-1/2 rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_16px_0_rgba(23,23,23,.08)]">
        <div className="rounded-2xl bg-[#fff0c6] p-3 text-xs font-extrabold text-[#171717]">{copy?.quizTitle ?? "What kind of work suits you?"}</div>
        <div className="mt-3 space-y-2">
          <div className="h-7 rounded-full bg-[#edf7ff]" />
          <div className="h-7 rounded-full bg-[#edf7ff]" />
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-[43%] rotate-[8deg] rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_16px_0_rgba(23,23,23,.08)]">
        <div className="rounded-2xl bg-[#3f95e8] p-3 text-xs font-extrabold text-white">{copy?.freshTitle ?? "Fresh roles, every day."}</div>
        <div className="mt-3"><JobPreviewCard job={jobs[0]} index={0} compact copy={copy} /></div>
      </div>
      <BriefcaseBusiness aria-hidden className="absolute -right-3 top-3 size-10 rotate-12 text-[#171717]" strokeWidth={1.5} />
    </div>
  )
}

export function PeopleArtwork({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 310 390" fill="none" className={className}>
      <ellipse cx="154" cy="374" rx="136" ry="14" fill="rgba(23,23,23,.14)" />
      <path d="M49 363c5-89 31-144 75-144 44 0 69 55 74 144H49Z" fill="#ffd36a" stroke="#171717" strokeWidth="4" />
      <circle cx="124" cy="165" r="50" fill="#d28a63" stroke="#171717" strokeWidth="4" />
      <path d="M78 169c-9-75 33-101 72-80 27 15 35 46 22 84-8-31-26-55-50-57-20-2-35 14-44 53Z" fill="#171717" />
      <path d="M90 164c13 12 49 13 69 0" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
      <circle cx="106" cy="168" r="3" fill="#171717" /><circle cx="143" cy="168" r="3" fill="#171717" />
      <path d="M112 191c8 7 17 7 25 0" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
      <path d="M162 354c3-63 24-105 61-105 39 0 58 42 63 105h-124Z" fill="#dceeff" stroke="#171717" strokeWidth="4" />
      <circle cx="223" cy="210" r="39" fill="#8c543d" stroke="#171717" strokeWidth="4" />
      <path d="M185 207c-5-48 27-69 58-55 27 12 31 39 18 62-10-25-23-38-43-39-17 0-27 12-33 32Z" fill="#2479d1" />
      <circle cx="211" cy="211" r="3" fill="#171717" /><circle cx="238" cy="211" r="3" fill="#171717" />
      <path d="M214 230c6 5 13 5 19 0" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
      <path d="M199 281h48l18 73h-82l16-73Z" fill="#3f95e8" stroke="#171717" strokeWidth="4" />
      <path d="M83 254h79" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
      <path d="M142 283h-37" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
