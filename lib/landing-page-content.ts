import { companies } from "@/constants/companies"
import type {
  AdminLandingPageContentRecord,
  LandingBenefitItem,
  LandingCompanyItem,
  LandingPageContent,
} from "@/types/landing-content"

const allowedSorts = new Set(["newest", "oldest", "relevance", "company"])

const defaultBenefits: LandingBenefitItem[] = [
  {
    title: "Pencarian lebih fokus",
    description:
      "Cari lowongan dari banyak sumber dengan hasil yang lebih cepat dibaca dan lebih mudah dibandingkan.",
  },
  {
    title: "Sumber lebih jelas",
    description:
      "Lanjutkan ke sumber resmi lowongan tanpa bingung dengan tampilan yang terlalu ramai atau tidak konsisten.",
  },
  {
    title: "Filter yang membantu",
    description:
      "Gunakan filter inti seperti kategori, lokasi, dan tipe kerja untuk mempersempit pilihan dengan cepat.",
  },
]

const defaultCompanies: LandingCompanyItem[] = companies.map((company) => ({
  id: company.id,
  name: company.name,
  url: "/jobs",
  brandColor: company.brandColor,
}))

export const defaultLandingPageContent: LandingPageContent = {
  hero: {
    title: "Start browsing jobs the moment you land.",
    description:
      "Search curated roles from multiple sources, compare openings quickly, and preview real job details before you ever leave the homepage.",
    primaryCta: { label: "Browse jobs", href: "/jobs" },
    secondaryCta: { label: "Explore categories", href: "#categories" },
    quickLinks: [
      { label: "Full-time", href: "/jobs?jobType=Full-time" },
      { label: "Jakarta", href: "/jobs?location=Jakarta" },
      { label: "Remote", href: "/jobs?location=Remote" },
      { label: "Most relevant", href: "/jobs?sort=relevance" },
    ],
  },
  featuredJobs: {
    title: "Browse listings and preview the role without leaving the homepage.",
    description:
      "Open the details panel, compare listings, and continue to the source only when a role looks worth your time.",
    emptyState: "Tidak ada lowongan terbaru saat ini.",
    rules: {
      sort: "newest",
      limit: 8,
      category: null,
      source: null,
    },
  },
  benefits: {
    title: "A cleaner way to compare jobs from different sources",
    items: defaultBenefits,
  },
  trustedCompanies: {
    title: "Companies and sources visitors expect to see on a job platform",
    items: defaultCompanies,
  },
  cta: {
    title: "Find work. Share work. All in one place.",
    body: "Search, compare, and continue to the official source with one cleaner browsing experience.",
    primaryButton: { label: "Find work", href: "/jobs" },
    secondaryButton: { label: "See categories", href: "#categories" },
  },
}

function cloneContent(content: LandingPageContent): LandingPageContent {
  return JSON.parse(JSON.stringify(content)) as LandingPageContent
}

export function normalizeLandingPageContent(
  content: Partial<LandingPageContent> | null | undefined,
): LandingPageContent {
  const base = cloneContent(defaultLandingPageContent)
  if (!content) return base

  const nextSort = content.featuredJobs?.rules?.sort
  const normalizedSort = nextSort && allowedSorts.has(nextSort) ? nextSort : base.featuredJobs.rules.sort
  const nextLimit = content.featuredJobs?.rules?.limit
  const normalizedLimit =
    typeof nextLimit === "number" && Number.isFinite(nextLimit)
      ? Math.min(Math.max(Math.round(nextLimit), 1), 12)
      : base.featuredJobs.rules.limit

  return {
    hero: {
      ...base.hero,
      ...content.hero,
      primaryCta: { ...base.hero.primaryCta, ...content.hero?.primaryCta },
      secondaryCta: { ...base.hero.secondaryCta, ...content.hero?.secondaryCta },
      quickLinks:
        content.hero?.quickLinks?.filter((item) => item?.label && item?.href) ??
        base.hero.quickLinks,
    },
    featuredJobs: {
      ...base.featuredJobs,
      ...content.featuredJobs,
      rules: {
        ...base.featuredJobs.rules,
        ...content.featuredJobs?.rules,
        sort: normalizedSort,
        limit: normalizedLimit,
      },
    },
    benefits: {
      ...base.benefits,
      ...content.benefits,
      items:
        content.benefits?.items?.filter((item) => item?.title && item?.description) ??
        base.benefits.items,
    },
    trustedCompanies: {
      ...base.trustedCompanies,
      ...content.trustedCompanies,
      items:
        content.trustedCompanies?.items?.filter(
          (item) => item?.id && item?.name && item?.href && item?.brandColor,
        ) ?? base.trustedCompanies.items,
    },
    cta: {
      ...base.cta,
      ...content.cta,
      primaryButton: { ...base.cta.primaryButton, ...content.cta?.primaryButton },
      secondaryButton: { ...base.cta.secondaryButton, ...content.cta?.secondaryButton },
    },
  }
}

export function resolveAdminLandingEditorContent(
  record: AdminLandingPageContentRecord | null,
): LandingPageContent {
  return normalizeLandingPageContent(
    record?.draftPayload ?? record?.publishedPayload ?? defaultLandingPageContent,
  )
}
