import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Briefcase, Search, Shield, Clock, Tag } from "lucide-react"

import { getPublicPageBySlug } from "@/lib/api/pages"
import { getNavbarData } from "@/lib/api/navbar"
import { sanitizeHtml } from "@/lib/sanitize"
import { Footer } from "@/components/shared/Footer"
import { Navbar } from "@/components/shared/Navbar"
import { SiteContent, SiteFrame } from "@/components/shared/SiteShell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShareButtons } from "@/components/public/blog-share-buttons"
import { TableOfContents, ArticleSearch, RecentPostsSidebar, UpdateGratisCTA } from "@/components/public/blog-sidebar"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const page = await getPublicPageBySlug(slug)
    if (!page) return {}
    return {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.summary || undefined,
    }
  } catch {
    return {}
  }
}

function CTASection() {
  return (
    <div className="mt-12 rounded-[26px] bg-[#1f5f9f] p-8 text-center text-white shadow-[0_6px_0_rgba(23,23,23,.08)]">
      <h3 className="text-2xl font-bold">Lowongan terbaru, langsung ke inboxmu</h3>
      <p className="mt-2 text-sm text-white/75">
        Dapatkan info lowongan terbaru dan tips karier dari Lowonganku.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="rounded-full bg-white text-[#1f5f9f] hover:bg-[#ffd36a] hover:text-[#171717]">
          <Link href="/jobs">
            <Search className="mr-2 size-4" />
            Cari Lowongan
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl border-white/40 text-white hover:bg-white/10">
          <Link href="/blog">
            Baca Artikel Lain
          </Link>
        </Button>
      </div>
    </div>
  )
}

function WhyLowongankuSection() {
  const features = [
    { icon: Shield, title: "Data Terverifikasi", description: "Setiap lowongan direview manual." },
    { icon: Clock, title: "Update Harian", description: "Ribuan lowongan baru setiap hari." },
    { icon: Search, title: "Filter Cerdas", description: "Sesuai lokasi & pengalamanmu." },
    { icon: Briefcase, title: "Gratis Selamanya", description: "Tanpa biaya untuk pencari kerja." },
  ]

  return (
    <div className="mt-12">
      <h3 className="text-lg font-semibold text-[var(--brand-ink)]">Kenapa memilih Lowonganku</h3>
      <p className="mt-1 text-sm text-slate-500">Dirancang supaya pencarian kerjamu lebih cepat dan lebih tenang.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div key={feature.title} className="rounded-[20px] border border-black/10 bg-white p-4 shadow-[0_4px_0_rgba(23,23,23,.04)]">
              <div className="grid size-10 place-items-center rounded-xl border border-[#3f95e8] bg-white text-[#2479d1]">
                <Icon className="size-5" />
              </div>
              <h4 className="mt-3 text-sm font-semibold text-foreground">{feature.title}</h4>
              <p className="mt-1 text-xs text-muted-foreground">{feature.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  try {
    const [page, navbarData] = await Promise.all([
      getPublicPageBySlug(slug),
      getNavbarData(),
    ])

    if (!page) {
      notFound()
    }

    const kind = slug === "blog" || slug.startsWith("blog/") ? "Blog" : "Halaman"
    const isBlog = kind === "Blog"
    const publishedDate = page.publishedAt
      ? new Date(page.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
      : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })

    return (
      <div className="min-h-screen w-full max-w-none overflow-x-hidden bg-[#fffdf8]">
        <Navbar jobs={navbarData.jobs} categories={navbarData.categories} totalJobs={navbarData.totalJobs} />
        <main className="w-full max-w-screen overflow-x-hidden bg-[#fffdf8] pb-16 pt-24">
          <SiteFrame>
            <SiteContent>
              <Link
                href={isBlog ? "/blog" : "/"}
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-blue)] hover:underline"
              >
                <ArrowLeft className="size-4" />
                Kembali ke Daftar Artikel
              </Link>

              <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr_280px] lg:items-start">
                {isBlog ? (
                  <div className="hidden lg:block">
                    <div className="sticky top-24">
                      <TableOfContents />
                    </div>
                  </div>
                ) : null}

                <article className="min-w-0 rounded-[30px] border border-black/10 bg-[#fffdf8] p-7 shadow-[0_8px_0_rgba(23,23,23,.04)] md:p-10">
                  {isBlog ? (
                    <Badge variant="outline" className="rounded-full border-[#ffd36a] bg-white px-3 py-1 text-xs font-medium text-[#2479d1]">
                      <Tag className="mr-1.5 size-3" />
                      Artikel
                    </Badge>
                  ) : null}

                  <h1 className="jobkan-section-title mt-4 text-4xl font-extrabold leading-tight tracking-[-0.06em] text-[#171717] md:text-6xl md:leading-[1.08]">
                    {page.title}
                  </h1>

                  <div className="mt-5 flex items-center gap-4 border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-full border border-black/10 bg-white text-sm text-slate-500">
                        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">Lowonganku</div>
                        <div className="text-xs text-slate-500">{publishedDate}</div>
                      </div>
                    </div>
                  </div>

                  {isBlog && page.summary ? (
                    <div className="mt-6 rounded-2xl border border-black/10 border-l-4 border-l-[#ffd36a] bg-white px-5 py-4 text-sm leading-7 text-slate-600">
                      {page.summary}
                    </div>
                  ) : null}

                  <div
                    className="rich-text mt-8 text-base leading-8 text-slate-700 prose-headings:font-semibold prose-headings:text-[var(--brand-ink)] prose-a:text-[var(--brand-blue)] prose-strong:text-slate-900"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content ?? "") }}
                  />

                  {isBlog ? (
                    <>
                      <div className="mt-8 border-t border-slate-100 pt-6">
                        <ShareButtons title={page.title} slug={slug} />
                      </div>
                      <WhyLowongankuSection />
                      <CTASection />
                    </>
                  ) : null}
                </article>

                {isBlog ? (
                  <div className="hidden lg:block">
                    <div className="sticky top-24 space-y-4">
                      <ArticleSearch />
                      <RecentPostsSidebar currentSlug={slug} />
                      <UpdateGratisCTA />
                    </div>
                  </div>
                ) : null}
              </div>
            </SiteContent>
          </SiteFrame>
        </main>
        <Footer />
      </div>
    )
  } catch {
    notFound()
  }
}
