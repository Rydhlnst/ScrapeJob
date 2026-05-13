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
    location: "New York, USA",
    workType: "Hybrid",
    experience: "Senior Level",
    description:
      "Design engaging experiences for Spotify’s mobile and web platforms with a strong systems mindset.",
    salary: "USD 6k - 7.5k",
    postedAt: "7d ago",
  },
  {
    id: "2",
    company: "Airbnb",
    verified: true,
    title: "Senior UX Designer",
    type: "Full-time",
    location: "San Francisco, USA",
    workType: "Hybrid",
    experience: "Senior Level",
    description:
      "Lead end-to-end UX for hosting tools—research, flows, and polished UI across web and mobile.",
    salary: "USD 8k - 9.5k",
    postedAt: "12d ago",
  },
  {
    id: "3",
    company: "Canva",
    verified: true,
    title: "UI/UX Designer",
    type: "Full-time",
    location: "Sydney, Australia",
    workType: "Remote",
    experience: "Mid Level",
    description:
      "Craft delightful interfaces and components that scale for millions of creators worldwide.",
    salary: "USD 5.5k - 6.5k",
    postedAt: "20d ago",
  },
  {
    id: "4",
    company: "Notion",
    verified: true,
    title: "Junior Product Designer",
    type: "Full-time",
    location: "San Francisco, USA",
    workType: "Hybrid",
    experience: "Entry Level",
    description:
      "Assist in designing productivity features with clean components, thoughtful hierarchy, and crisp motion.",
    salary: "USD 4k - 5k",
    postedAt: "22d ago",
  },
  {
    id: "5",
    company: "Google",
    verified: true,
    title: "UX Researcher",
    type: "Full-time",
    location: "Mountain View, USA",
    workType: "On-site",
    experience: "Lead / Manager",
    description:
      "Conduct mixed-method research to uncover user behavior and guide product strategy with clear insights.",
    salary: "USD 9k - 11k",
    postedAt: "25d ago",
  },
  {
    id: "6",
    company: "OpenAI",
    verified: true,
    title: "Product Designer (Platform)",
    type: "Full-time",
    location: "Remote (US)",
    workType: "Remote",
    experience: "Senior Level",
    description:
      "Design intuitive interfaces for new product features—clarity, safety, and speed at scale.",
    salary: "USD 7k - 8.5k",
    postedAt: "26d ago",
  },
  // extra variety for filters
  {
    id: "7",
    company: "Stripe",
    verified: true,
    title: "Frontend Engineer (Design Systems)",
    type: "Full-time",
    location: "Dublin, Ireland",
    workType: "Hybrid",
    experience: "Mid Level",
    description:
      "Build accessible components and tokens powering Stripe’s product UI across teams and surfaces.",
    salary: "USD 7k - 9k",
    postedAt: "3d ago",
  },
  {
    id: "8",
    company: "Figma",
    verified: true,
    title: "Design Ops Specialist",
    type: "Contract",
    location: "London, UK",
    workType: "Hybrid",
    experience: "Mid Level",
    description:
      "Improve design workflows, templates, and QA to keep product design shipping with quality and speed.",
    salary: "USD 5k - 6.2k",
    postedAt: "9d ago",
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
    salary: "USD 3.2k - 4.5k",
    postedAt: "5d ago",
  },
  {
    id: "10",
    company: "Canva",
    verified: true,
    title: "Data Engineer (Recommenders)",
    type: "Full-time",
    location: "Melbourne, Australia",
    workType: "Hybrid",
    experience: "Senior Level",
    description:
      "Build ranking and recommendation systems—relevance, fairness, and strong evaluation.",
    salary: "USD 10k - 13k",
    postedAt: "2d ago",
  },
  {
    id: "11",
    company: "Notion",
    verified: true,
    title: "Backend Developer",
    type: "Full-time",
    location: "Tokyo, Japan",
    workType: "On-site",
    experience: "Senior Level",
    description:
      "Own APIs for collaboration features with strong performance, reliability, and clean architecture.",
    salary: "USD 9k - 12k",
    postedAt: "14d ago",
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
    salary: "USD 3k - 5k",
    postedAt: "1d ago",
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
