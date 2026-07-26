import { Mail, MapPin, Phone } from "lucide-react"

import { ContactForm } from "@/components/public/contact-form"
import { Container } from "@/components/shared/Container"
import { Footer } from "@/components/shared/Footer"
import { Navbar } from "@/components/shared/Navbar"
import { SiteFrame } from "@/components/shared/SiteShell"
import { listCategories } from "@/lib/api/categories"
import { listJobs } from "@/lib/api/jobs"

const contactItems = [
  { label: "Email", value: "hello@lowonganku.id", icon: Mail },
  { label: "Telepon", value: "+62 812 0000 0000", icon: Phone },
  { label: "Alamat", value: "Jakarta, Indonesia", icon: MapPin },
]

export default async function ContactPage() {
  const [navJobs, categories] = await Promise.all([
    listJobs({ page: 1, perPage: 100, sort: "newest" }).catch(() => ({ data: [], total: 0 })),
    listCategories().catch(() => []),
  ])

  return (
    <div className="min-h-screen bg-white">
      <Navbar jobs={navJobs.data} categories={categories} totalJobs={navJobs.total} />

      <main>
        <SiteFrame>
          <Container className="py-14 md:py-20">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <section className="space-y-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Hubungi Kami</p>
                  <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.05em] text-[var(--brand-ink)] md:text-6xl">
                    Ada pertanyaan tentang Lowonganku?
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
                        className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"
                      >
                        <div className="grid size-11 place-items-center rounded-xl bg-sky-50 text-sky-600">
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
