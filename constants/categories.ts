import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Blocks,
  BriefcaseBusiness,
  Code2,
  Figma,
  Layers3,
  Smartphone,
  ServerCog,
} from "lucide-react"

export type JobCategory = {
  id: string
  title: string
  jobsCount: number
  icon: LucideIcon
}

export const categories: JobCategory[] = [
  { id: "uiux", title: "UI/UX Design", jobsCount: 842, icon: Figma },
  { id: "frontend", title: "Frontend Developer", jobsCount: 1240, icon: Code2 },
  { id: "backend", title: "Backend Developer", jobsCount: 980, icon: ServerCog },
  { id: "fullstack", title: "Fullstack Developer", jobsCount: 760, icon: Blocks },
  {
    id: "pm",
    title: "Product Manager",
    jobsCount: 430,
    icon: BriefcaseBusiness,
  },
  { id: "data", title: "Data Analyst", jobsCount: 510, icon: BarChart3 },
  { id: "mobile", title: "Mobile Developer", jobsCount: 320, icon: Smartphone },
  { id: "devops", title: "DevOps Engineer", jobsCount: 290, icon: Layers3 },
]
