import { Quote } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"

const testimonials = [
  {
    name: "Raka Pratama",
    role: "Product Designer",
    quote:
      "UI-nya rapi dan cepat. Aku bisa shortlist lowongan yang relevan tanpa kebanyakan distraksi.",
  },
  {
    name: "Nadia Aulia",
    role: "Frontend Engineer",
    quote:
      "Rekomendasinya terasa pas. Proses cari kerja jadi lebih terstruktur dan nggak bikin capek.",
  },
  {
    name: "Bagas Wicaksono",
    role: "Data Analyst",
    quote:
      "Filter dan ringkasan lowongan jelas. Enak buat compare beberapa perusahaan sekaligus.",
  },
  {
    name: "Salsa Maharani",
    role: "HR Specialist",
    quote:
      "Dari sisi perusahaan, kualitas listing konsisten dan tampil profesional. Kandidat juga lebih engaged.",
  },
]

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function TestimonialsSection() {
  return (
    <section className="border-b border-[var(--brand-shell-strong)] bg-white py-16 md:py-20" id="about">
      <Container>
        <div className="max-w-3xl">
          <SectionHeader
            title="What people value most"
            description="The experience stays structured, clear, and easier to trust."
          />
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex h-full flex-col rounded-2xl bg-slate-50 p-6"
            >
              <Quote className="size-6 text-[var(--brand-blue)]/70" />
              <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
                {testimonial.quote}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                  {initials(testimonial.name)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--brand-ink)]">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
