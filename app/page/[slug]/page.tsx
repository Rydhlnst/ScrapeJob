import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getPublicPageBySlug } from "@/lib/api/pages"
import { getNavbarData } from "@/lib/api/navbar"
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

    return (
      <div className="min-h-screen bg-background">
        <Navbar jobs={navbarData.jobs} categories={navbarData.categories} totalJobs={navbarData.totalJobs} />
        <main className="py-8">
          <SiteFrame>
            <SiteContent>
              <article className="border border-white bg-white p-7 shadow-[var(--shadow-md)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                  Page
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--brand-ink)] md:text-4xl">
                  {page.title}
                </h1>
                {page.summary ? (
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{page.summary}</p>
                ) : null}
                <div
                  className="rich-text mt-8 text-sm leading-7 text-slate-700"
                  dangerouslySetInnerHTML={{ __html: page.content ?? "" }}
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

