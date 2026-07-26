import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getPublicPageBySlug } from "@/lib/api/pages"
import { getNavbarData } from "@/lib/api/navbar"
import { sanitizeHtml } from "@/lib/sanitize"
import { Footer } from "@/components/shared/Footer"
import { Navbar } from "@/components/shared/Navbar"
import { SiteContent, SiteFrame } from "@/components/shared/SiteShell"

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

    return (
      <div className="min-h-screen bg-white">
        <Navbar jobs={navbarData.jobs} categories={navbarData.categories} totalJobs={navbarData.totalJobs} />
        <main className="pb-16 pt-10 md:pt-14">
          <SiteFrame>
            <SiteContent>
              <article className="mx-auto max-w-3xl">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <a href="/" className="hover:text-[var(--brand-blue)]">Beranda</a>
                  <span className="text-slate-300">/</span>
                  <span className="text-[var(--brand-blue)]">{kind}</span>
                </div>

                <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[var(--brand-ink)] md:text-[2.75rem] md:leading-[1.15]">
                  {page.title}
                </h1>

                {page.summary ? (
                  <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">
                    {page.summary}
                  </p>
                ) : null}

                <div className="mt-6 flex items-center gap-3 border-b border-slate-100 pb-6 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="grid size-6 place-items-center rounded-full bg-sky-50 text-[10px] font-semibold text-sky-700">
                      L
                    </span>
                    Lowonganku
                  </span>
                  <span className="text-slate-300">·</span>
                  <time>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</time>
                </div>

                <div
                  className="rich-text mt-8 text-base leading-8 text-slate-700"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content ?? "") }}
                />
              </article>
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

