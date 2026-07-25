import { Mail, MapPin, Phone } from "lucide-react"

import { ContactForm } from "@/components/public/contact-form"
import { Container } from "@/components/shared/Container"
import { SiteFrame } from "@/components/shared/SiteShell"

const contactItems = [
  { label: "Email", value: "hello@lowonganku.id", icon: Mail },
  { label: "Telepon", value: "+62 812 0000 0000", icon: Phone },
  { label: "Alamat", value: "Jakarta, Indonesia", icon: MapPin },
]

export default function ContactPage() {
  return (
    <main className="bg-white">
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
                    <div key={item.label} className="flex items-center gap-3 border border-[var(--brand-shell-strong)] bg-[var(--brand-shell)] p-4">
                      <Icon className="size-5 text-primary" />
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
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
  )
}