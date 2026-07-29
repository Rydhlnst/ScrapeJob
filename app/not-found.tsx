import Link from "next/link"
import { FileQuestion } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import { SiteContent, SiteFrame } from "@/components/shared/SiteShell"
import { getNavbarData } from "@/lib/api/navbar"

export default async function NotFound() {
  const navbarData = await getNavbarData()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar jobs={navbarData.jobs} categories={navbarData.categories} totalJobs={navbarData.totalJobs} />
      <main className="flex-1 py-12 md:py-20 flex items-center">
        <SiteFrame className="w-full">
          <SiteContent>
            <div className="mx-auto max-w-xl text-center">
              <div className="brand-shell overflow-hidden rounded-[36px] border border-border bg-white p-8 md:p-12 shadow-lg">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-accent text-accent-foreground border border-accent">
                  <FileQuestion className="size-8" />
                </div>
                
                <h1 className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-foreground md:text-4xl">
                  Halaman tidak ditemukan
                </h1>
                
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                  <Button asChild className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                    <Link href="/">Kembali ke Home</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-11 rounded-full border-border bg-white px-5 text-sm font-semibold text-foreground hover:bg-muted">
                    <Link href="/jobs">Cari Lowongan</Link>
                  </Button>
                </div>
              </div>
            </div>
          </SiteContent>
        </SiteFrame>
      </main>
      <Footer />
    </div>
  )
}
