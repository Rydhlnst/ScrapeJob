import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { Card } from "@/components/ui/card"

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

export function TestimonialsSection() {
  return (
    <section className="py-14 md:py-20" id="about">
      <Container>
        <SectionHeader
          title="Real Stories from Our Users"
          description="See how job seekers discover better opportunities with our platform."
          align="center"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <Card
              key={t.name}
              className="overflow-hidden rounded-3xl border-border bg-card shadow-sm"
            >
              <div className="h-36 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-dark))]" />
              <div className="p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  “{t.quote}”
                </p>
                <div className="mt-5">
                  <div className="text-sm font-semibold text-foreground">
                    {t.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}

