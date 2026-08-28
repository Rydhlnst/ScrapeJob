import type { Metadata } from "next"
import { Mail, MapPin, Phone } from "lucide-react"

import { ContactForm } from "@/components/public/contact-form"

export const dynamic = "force-dynamic"
import { Container } from "@/components/shared/Container"
import { Footer } from "@/components/shared/Footer"
import { Navbar } from "@/components/shared/Navbar"
import { SiteFrame } from "@/components/shared/SiteShell"
import { listCategories } from "@/lib/api/categories"
import { listJobs } from "@/lib/api/jobs"
import { getServerWebsiteContext } from "@/lib/site/server-context"
import { getPublicSiteConfig } from "@/lib/api/site-config"

export async function generateMetadata(): Promise<Metadata> {
  const config = await getPublicSiteConfig(await getServerWebsiteContext())
  return {
    title: `Contact | ${config.website.name}`,
    description: `Contact the ${config.website.name} team.`,
  }
}

export default async function ContactPage() {
  const siteContext = await getServerWebsiteContext()
  const siteConfig = await getPublicSiteConfig(siteContext)
  const contactItems = [
    { label: "Email", value: siteConfig.contact.email ?? "Contact the site owner", icon: Mail },
    { label: "Telepon", value: "Contact the site owner", icon: Phone },
    { label: "Alamat", value: "Indonesia", icon: MapPin },
  ]
  const [navJobs, categories] = await Promise.all([
    listJobs({ page: 1, perPage: 100, sort: "newest" }, siteContext).catch(() => ({ data: [], total: 0 })),
    listCategories(siteContext).catch(() => []),
  ])

  return (
    <div className="min-h-screen w-full max-w-none overflow-x-hidden bg-white">
      <Navbar jobs={navJobs.data} categories={categories} totalJobs={navJobs.total} />

      <main className="w-full bg-white pt-24">
        <SiteFrame>
          <Container className="py-14 md:py-20">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <section className="space-y-8">
                <div>
                  <p className="inline-flex rounded-full border border-[#f2a23a] bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#2479d1]">Hubungi Kami</p>
                  <h1 className="jobkan-section-title mt-4 max-w-xl text-4xl font-extrabold tracking-[-0.06em] text-[#171717] md:text-6xl">
                    Ada pertanyaan tentang {siteConfig.website.name}?
                  </h1>
                  <p className="mt-5 max-w-lg text-base leading-8 text-slate-600">
                    Kirim pesan untuk kerja sama, masukan, atau kebutuhan publikasi lowongan. Tim kami akan menindaklanjuti lewat email.
                  </p>
                </div>
                <div className="grid gap-3">
                  {contactItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_4px_0_rgba(23,23,23,.04)] transition-colors hover:border-[#3f95e8]/50"
                      >
                        <div className="grid size-11 place-items-center rounded-xl bg-[#dceeff] text-[#2479d1]">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            {item.label}
                          </div>
                          <div className="mt-1 text-sm font-medium text-[var(--brand-ink)]">{item.value}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
              <ContactForm />
            </div>
          </Container>
        </SiteFrame>
      </main>

      <Footer />
    </div>
  )
}
