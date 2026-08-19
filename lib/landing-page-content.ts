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

const defaultSections = {
  visuals: {
    boardTitle: "Lowonganku — jobs for you",
    boardEyebrow: "Peluang terbaru",
    boardLinkLabel: "Lihat semua",
    cardStatusLabel: "Baru",
    cardDetailLabel: "Lihat detail",
    sideTitle: "Start with the right role",
    sideDescription: "Search thousands of verified openings in one simple place.",
    sideActionLabel: "Explore jobs",
    quizTitle: "What kind of work suits you?",
    freshTitle: "Fresh roles, every day.",
  },
  hero: { eyebrow: "Find work that fits you", searchPlaceholder: "Cari posisi, skill, atau perusahaan", searchLabel: "Cari", statLabel: "Lowongan aktif", statTitle: "Buka peluang baru", statDescription: "kategori untuk kamu jelajahi setiap hari.", floatingTitle: "Pilihan baru untukmu", floatingDescription: "Lowongan terverifikasi, diperbarui rutin." },
  features: { eyebrow: "Why choose Lowonganku", actionLabel: "Jelajahi lowongan", searchPlaceholder: "Cari lowongan", searchLabel: "Search", savedTitle: "Simpan yang relevan", savedDescription: "Kembali ke peluang terbaik kapan pun.", sourceLabel: "✓ Sumber jelas" },
  how: {
    eyebrow: "How it works", title: "Pencarian kerja yang terasa lebih sederhana.", description: "Tiga langkah ringan untuk menemukan pekerjaan yang sesuai dengan tujuanmu.",
    steps: [
      { title: "Cari dengan jelas", description: "Mulai dari posisi, skill, lokasi, atau tipe kerja yang benar-benar kamu cari.", linkLabel: "Jelajahi lowongan" },
      { title: "Bandingkan peluang", description: "Lihat informasi penting dan sumber asli tanpa harus berpindah dari satu situs ke situs lain.", linkLabel: "Jelajahi lowongan" },
      { title: "Lamar dengan yakin", description: "Simpan pekerjaan yang relevan, lalu lanjutkan proses lamaran langsung ke sumber resminya.", linkLabel: "Jelajahi lowongan" },
    ],
  },
  categories: { eyebrow: "Kategori Populer", title: "Jelajahi berdasarkan kategori", description: "Temukan peran yang paling sering dicari, dari teknologi dan desain hingga operasional dan layanan pelanggan.", buttonLabel: "Lihat semua lowongan" },
  featured: { eyebrow: "Fresh opportunities", buttonLabel: "Browse all jobs" },
  cta: { eyebrow: "Search with confidence", prompt: "Cari posisi yang sesuai dengan skill dan tujuanmu.", response: "Siap. Ini beberapa lowongan yang bisa kamu cek.", cardTitle: "Peluang yang layak dilihat" },
  testimonials: {
    eyebrow: "Testimonials", title: "A calmer, clearer job search.", description: "A few notes from people using Lowonganku to make their next move with more confidence.", featuredRole: "Job seeker",
    items: [
      { name: "Raka Pratama", quote: "The roles are easy to compare and the original source is always clear." },
      { name: "Nadia Aulia", quote: "I found relevant roles without jumping between five different platforms." },
      { name: "Bagas Wicaksono", quote: "A clean job search experience that makes it easier to choose where to apply." },
    ],
  },
  faq: {
    eyebrow: "FAQ", title: "Pertanyaan yang sering ditanyakan", description: "Punya pertanyaan tentang platform kami? Temukan jawabannya di sini.", contactLabel: "Hubungi tim support →",
    items: [
      { question: "Apa itu platform pencarian kerja ini?", answer: "Lowonganku mengumpulkan lowongan dari berbagai sumber terpercaya di Indonesia dan menyajikan informasi yang jelas untuk membantu kamu menemukan peluang yang relevan." },
      { question: "Apakah perlu membuat akun untuk mencari lowongan?", answer: "Tidak. Kamu bisa langsung menjelajahi dan mencari lowongan tanpa login atau signup." },
      { question: "Dari mana sumber lowongan ditampilkan?", answer: "Kami menampilkan lowongan dari sumber terpercaya dan selalu menautkan kamu kembali ke sumber resmi saat melamar." },
      { question: "Seberapa sering lowongan diperbarui?", answer: "Lowongan diperbarui secara berkala agar kamu bisa menemukan peluang terbaru." },
    ],
  },
  footer: {
    eyebrow: "Siap menemukan peluang berikutnya?", title: "Jelajahi lowongan", description: "Explore job opportunities with more clarity, more confidence, and less noise.",
    columns: [
      { title: "Explore", links: [{ label: "Jobs", href: "/jobs" }, { label: "Categories", href: "/#categories" }, { label: "Career guide", href: "/#how" }] },
      { title: "Company", links: [{ label: "About", href: "/#about" }, { label: "Contact", href: "/contact" }, { label: "Blog", href: "/blog" }] },
      { title: "Resources", links: [{ label: "Help center", href: "/contact" }, { label: "Privacy", href: "/#about" }, { label: "Terms", href: "/#about" }] },
    ],
  },
}

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
  sections: defaultSections,
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
          (item) => item?.id && item?.name && item?.url && item?.brandColor,
        ) ?? base.trustedCompanies.items,
    },
    cta: {
      ...base.cta,
      ...content.cta,
      primaryButton: { ...base.cta.primaryButton, ...content.cta?.primaryButton },
    secondaryButton: { ...base.cta.secondaryButton, ...content.cta?.secondaryButton },
  },
  sections: {
    ...base.sections,
    ...content.sections,
    visuals: { ...base.sections.visuals, ...content.sections?.visuals },
    hero: { ...base.sections.hero, ...content.sections?.hero },
    features: { ...base.sections.features, ...content.sections?.features },
    how: { ...base.sections.how, ...content.sections?.how, steps: content.sections?.how?.steps?.filter((item) => item?.title && item?.description && item?.linkLabel) ?? base.sections.how.steps },
    categories: { ...base.sections.categories, ...content.sections?.categories },
    featured: { ...base.sections.featured, ...content.sections?.featured },
    cta: { ...base.sections.cta, ...content.sections?.cta },
    testimonials: { ...base.sections.testimonials, ...content.sections?.testimonials, items: content.sections?.testimonials?.items?.filter((item) => item?.name && item?.quote) ?? base.sections.testimonials.items },
    faq: { ...base.sections.faq, ...content.sections?.faq, items: content.sections?.faq?.items?.filter((item) => item?.question && item?.answer) ?? base.sections.faq.items },
    footer: { ...base.sections.footer, ...content.sections?.footer, columns: content.sections?.footer?.columns?.filter((item) => item?.title && Array.isArray(item.links)) ?? base.sections.footer.columns },
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
