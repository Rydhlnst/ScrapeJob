import type { Category } from "@/types"

export const mockCategories: Category[] = [
  {
    id: "cat_it",
    name: "IT & Software",
    slug: "it-software",
    description: "Software engineer, developer, QA, data, IT support.",
    totalJobs: 128,
  },
  { id: "cat_marketing", name: "Marketing", slug: "marketing", totalJobs: 76 },
  { id: "cat_admin", name: "Admin", slug: "admin", totalJobs: 64 },
  { id: "cat_finance", name: "Finance", slug: "finance", totalJobs: 42 },
  { id: "cat_design", name: "Design", slug: "design", totalJobs: 39 },
  { id: "cat_sales", name: "Sales", slug: "sales", totalJobs: 81 },
  { id: "cat_cs", name: "Customer Service", slug: "customer-service", totalJobs: 33 },
  { id: "cat_internship", name: "Internship", slug: "internship", totalJobs: 22 },
]

