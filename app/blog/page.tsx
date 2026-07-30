import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { listPublicPages, type PublicPageSummary } from "@/lib/api/pages"
import { getNavbarData } from "@/lib/api/navbar"
import { Container } from "@/components/shared/Container"
import { Footer } from "@/components/shared/Footer"
import { Navbar } from "@/components/shared/Navbar"
import { SiteContent, SiteFrame } from "@/components/shared/SiteShell"

export const metadata: Metadata = {
  title: "Blog Lowonganku",
  description: "Panduan, insight karier, dan cerita seputar dunia kerja dari tim Lowonganku.",
}

function formatDate(value?: string | null) {
  if (!value) return null
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value))
  } catch {
    return null
  }
}

function ArticleCard({ article, featured = false }: { article: PublicPageSummary; featured?: boolean }) {
  const date = formatDate(article.publishedAt ?? article.updatedAt)

  if (featured) {
    return (
      <Link
        href={`/page/${article.slug}`}
        className="group relative block overflow-hidden rounded-2xl bg-slate-50 p-8 transition-colors hover:bg-slate-100 md:p-10"
      >
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-blue)]">
          Artikel Pilihan
        </div>
        <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.02em] text-[var(--brand-ink)] md:text-3xl">
          {article.title}
        </h2>
        {article.summary ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
            {article.summary}
          </p>
        ) : null}
        <div className="mt-6 flex items-center gap-3 text-sm font-medium text-[var(--brand-blue)]">
          {date ? <time className="text-xs text-slate-500">{date}</time> : null}
          {date ? <span className="text-slate-300">·</span> : null}
          <span className="inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
            Baca selengkapnya
            <ArrowRight className="size-4" />
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/page/${article.slug}`}
      className="group flex h-full flex-col rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(15,23,42,0.10)]"
    >
      {date ? (
        <div className="text-xs text-slate-500">
          <time>{date}</time>
        </div>
      ) : null}
      <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-6 tracking-[-0.01em] text-slate-900 group-hover:text-[var(--brand-blue)]">
        {article.title}
      </h3>
      {article.summary ? (
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{article.summary}</p>
      ) : null}
      <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--brand-blue)]">
        Baca artikel
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

export default async function BlogIndexPage() {
  const [articles, navbarData] = await Promise.all([
    listPublicPages(20).catch(() => ({
      data: [] as PublicPageSummary[],
      page: 1,
      perPage: 0,
      total: 0,
      totalPages: 1,
    })),
    getNavbarData().catch(() => ({ jobs: [], categories: [], totalJobs: 0 })),
  ])

  const [featured, ...rest] = articles.data

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        jobs={navbarData.jobs}
        categories={navbarData.categories}
        totalJobs={navbarData.totalJobs}
      />

      <main className="pb-16 pt-10 md:pt-14">
        <SiteFrame>
          <SiteContent>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/" className="hover:text-[var(--brand-blue)]">
                Beranda
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-[var(--brand-blue)]">Blog</span>
            </div>

            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-[var(--brand-ink)] md:text-5xl">
              Blog Lowonganku
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
              Panduan pencarian kerja, insight karier, dan cerita seputar dunia kerja — ditulis untuk membantu langkah berikutnya.
            </p>

            {articles.data.length === 0 ? (
              <div className="mt-10 rounded-2xl bg-slate-50 p-10 text-center">
                <div className="text-lg font-semibold text-[var(--brand-ink)]">
                  Belum ada artikel
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Artikel akan tampil di sini begitu tim publikasikan tulisan pertama.
                </p>
              </div>
            ) : (
              <div className="mt-10 space-y-6">
                {featured ? <ArticleCard article={featured} featured /> : null}
                {rest.length ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {rest.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </SiteContent>
        </SiteFrame>
      </main>

      <Footer />
    </div>
  )
}
