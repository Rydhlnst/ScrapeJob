import { FileText, Search, UserRound } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { Card } from "@/components/ui/card"

const steps = [
  {
    step: "01",
    icon: UserRound,
    title: "Buat profil",
    description:
      "Tambahkan skill, preferensi posisi, dan target gaji agar pencarian lebih relevan sejak awal.",
  },
  {
    step: "02",
    icon: Search,
    title: "Cari lowongan terkurasi",
    description:
      "Gunakan filter yang jelas untuk menemukan lowongan yang tepat tanpa scroll berlebihan.",
  },
  {
    step: "03",
    icon: FileText,
    title: "Apply lebih cepat",
    description:
      "Simpan lowongan favorit, bandingkan pilihan, dan apply dengan percaya diri.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-14 md:py-20" id="how">
      <Container>
        <SectionHeader
          title="Cara kerja"
          description="Alur sederhana yang bantu kamu dari cari sampai shortlist dalam hitungan menit."
          align="center"
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <Card
              key={s.step}
              className="rounded-2xl border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="grid size-11 place-items-center rounded-2xl bg-[hsl(var(--primary-soft))] text-primary ring-1 ring-border/70">
                  <s.icon className="size-5" />
                </div>
                <div className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {s.step}
                </div>
              </div>
              <div className="mt-4 text-base font-semibold text-foreground">
                {s.title}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {s.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}
