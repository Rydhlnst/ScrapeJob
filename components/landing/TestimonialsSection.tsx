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
    <section
      className="border-b bg-white py-16 md:py-20"
      id="about"
      style={{ borderColor: "var(--brand-shell-strong)" }}
    >
      <Container>
        <SectionHeader
          title="What people value most"
          description="The experience stays structured, clear, and easier to trust."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="border p-6 shadow-none"
              style={{
                borderColor: "var(--brand-shell-strong)",
                backgroundColor: "var(--brand-shell)",
              }}
            >
              <p
                className="text-sm leading-7"
                style={{ color: "#475569" }}
              >
                "{testimonial.quote}"
              </p>
              <div className="mt-5">
                <div
                  className="text-sm font-semibold"
                  style={{ color: "var(--brand-ink)" }}
                >
                  {testimonial.name}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "#64748b" }}
                >
                  {testimonial.role}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}

