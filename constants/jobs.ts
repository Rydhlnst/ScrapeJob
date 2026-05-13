import { companies } from "@/constants/companies"

export type JobWorkType = "Remote" | "Hybrid" | "On-site"
export type JobEmploymentType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Freelance"
  | "Internship"

export type ExperienceLevel =
  | "Entry Level"
  | "Mid Level"
  | "Senior Level"
  | "Lead / Manager"

export type JobListing = {
  id: string
  company: string
  verified: boolean
  title: string
  type: JobEmploymentType
  location: string
  workType: JobWorkType
  experience: ExperienceLevel
  description: string
  salary: string
  postedAt: string
  dateLabel: string
  tags: string[]
  cardTone?: "peach" | "mint" | "lavender" | "sky" | "rose" | "slate"
  companyBrandColor?: string
}

const byCompany = Object.fromEntries(companies.map((c) => [c.name, c]))

const baseJobs = [
  {
    id: "1",
    company: "Spotify",
    verified: true,
    title: "Product Designer",
    type: "Full-time",
    location: "Jakarta, Indonesia",
    workType: "Hybrid",
    experience: "Senior Level",
    description:
      "Design engaging experiences for Spotify’s mobile and web platforms with a strong systems mindset.",
    salary: "Rp 25 jt/bulan",
    postedAt: "7d ago",
    dateLabel: "20 May, 2023",
    tags: ["Full-time", "Senior", "Hybrid", "Produk"],
    cardTone: "peach",
  },
  {
    id: "2",
    company: "Airbnb",
    verified: true,
    title: "Senior UX Designer",
    type: "Full-time",
    location: "Bandung, Indonesia",
    workType: "Hybrid",
    experience: "Senior Level",
    description:
      "Lead end-to-end UX for hosting tools—research, flows, and polished UI across web and mobile.",
    salary: "Rp 30 jt/bulan",
    postedAt: "12d ago",
    dateLabel: "2 Apr, 2023",
    tags: ["Part-time", "Senior", "Hybrid"],
    cardTone: "rose",
  },
  {
    id: "3",
    company: "Canva",
    verified: true,
    title: "UI/UX Designer",
    type: "Full-time",
    location: "Surabaya, Indonesia",
    workType: "Remote",
    experience: "Mid Level",
    description:
      "Craft delightful interfaces and components that scale for millions of creators worldwide.",
    salary: "Rp 18 jt/bulan",
    postedAt: "20d ago",
    dateLabel: "29 Jan, 2023",
    tags: ["Full-time", "Mid", "Remote", "Shift"],
    cardTone: "lavender",
  },
  {
    id: "4",
    company: "Notion",
    verified: true,
    title: "Junior Product Designer",
    type: "Full-time",
    location: "Yogyakarta, Indonesia",
    workType: "Hybrid",
    experience: "Entry Level",
    description:
      "Assist in designing productivity features with clean components, thoughtful hierarchy, and crisp motion.",
    salary: "Rp 9 jt/bulan",
    postedAt: "22d ago",
    dateLabel: "11 Apr, 2023",
    tags: ["Full-time", "Junior", "Hybrid", "Produk"],
    cardTone: "sky",
  },
  {
    id: "5",
    company: "Google",
    verified: true,
    title: "UX Researcher",
    type: "Full-time",
    location: "Bali, Indonesia",
    workType: "On-site",
    experience: "Lead / Manager",
    description:
      "Conduct mixed-method research to uncover user behavior and guide product strategy with clear insights.",
    salary: "Rp 35 jt/bulan",
    postedAt: "25d ago",
    dateLabel: "4 Feb, 2023",
    tags: ["Full-time", "Lead", "On-site", "Flexible"],
    cardTone: "mint",
  },
  {
    id: "6",
    company: "OpenAI",
    verified: true,
    title: "Product Designer (Platform)",
    type: "Full-time",
    location: "Remote (Indonesia)",
    workType: "Remote",
    experience: "Senior Level",
    description:
      "Design intuitive interfaces for new product features—clarity, safety, and speed at scale.",
    salary: "Rp 28 jt/bulan",
    postedAt: "26d ago",
    dateLabel: "18 Jan, 2023",
    tags: ["Full-time", "Senior", "Remote"],
    cardTone: "slate",
  },
  // extra variety for filters
  {
    id: "7",
    company: "Stripe",
    verified: true,
    title: "Frontend Engineer (Design Systems)",
    type: "Full-time",
    location: "Tangerang, Indonesia",
    workType: "Hybrid",
    experience: "Mid Level",
    description:
      "Build accessible components and tokens powering Stripe’s product UI across teams and surfaces.",
    salary: "Rp 22 jt/bulan",
    postedAt: "3d ago",
    dateLabel: "10 Jun, 2023",
    tags: ["Full-time", "Mid", "Hybrid"],
    cardTone: "mint",
  },
  {
    id: "8",
    company: "Figma",
    verified: true,
    title: "Design Ops Specialist",
    type: "Contract",
    location: "Malang, Indonesia",
    workType: "Hybrid",
    experience: "Mid Level",
    description:
      "Improve design workflows, templates, and QA to keep product design shipping with quality and speed.",
    salary: "Rp 16 jt/bulan",
    postedAt: "9d ago",
    dateLabel: "6 Mar, 2023",
    tags: ["Kontrak", "Mid", "Hybrid"],
    cardTone: "peach",
  },
  {
    id: "9",
    company: "Spotify",
    verified: true,
    title: "UX Writer",
    type: "Freelance",
    location: "Remote",
    workType: "Remote",
    experience: "Mid Level",
    description:
      "Write clear, human microcopy for listening journeys and settings—reduce friction, boost confidence.",
    salary: "Rp 12 jt/bulan",
    postedAt: "5d ago",
    dateLabel: "15 May, 2023",
    tags: ["Freelance", "Mid", "Remote"],
    cardTone: "sky",
  },
  {
    id: "10",
    company: "Canva",
    verified: true,
    title: "Data Engineer (Recommenders)",
    type: "Full-time",
    location: "Depok, Indonesia",
    workType: "Hybrid",
    experience: "Senior Level",
    description:
      "Build ranking and recommendation systems—relevance, fairness, and strong evaluation.",
    salary: "Rp 40 jt/bulan",
    postedAt: "2d ago",
    dateLabel: "8 Jun, 2023",
    tags: ["Full-time", "Senior", "Hybrid"],
    cardTone: "lavender",
  },
  {
    id: "11",
    company: "Notion",
    verified: true,
    title: "Backend Developer",
    type: "Full-time",
    location: "Semarang, Indonesia",
    workType: "On-site",
    experience: "Senior Level",
    description:
      "Own APIs for collaboration features with strong performance, reliability, and clean architecture.",
    salary: "Rp 27 jt/bulan",
    postedAt: "14d ago",
    dateLabel: "1 Mar, 2023",
    tags: ["Full-time", "Senior", "On-site"],
    cardTone: "slate",
  },
  {
    id: "12",
    company: "Lowongaku",
    verified: true,
    title: "Full-Stack Developer",
    type: "Full-time",
    location: "Jakarta, Indonesia",
    workType: "Hybrid",
    experience: "Mid Level",
    description:
      "Build premium SaaS job board UI + APIs with Next.js—filters, bookmarks, and great UX.",
    salary: "Rp 20 jt/bulan",
    postedAt: "1d ago",
    dateLabel: "12 Jun, 2023",
    tags: ["Full-time", "Mid", "Hybrid"],
    cardTone: "peach",
  },
] satisfies JobListing[]

export const jobs: JobListing[] = baseJobs.map((job) => ({
  ...job,
  companyBrandColor: byCompany[job.company]?.brandColor ?? "#4169e1",
}))

export const popularSearches = [
  "Product Designer",
  "Full-Stack Developer",
  "Remote",
  "UX Researcher",
]
