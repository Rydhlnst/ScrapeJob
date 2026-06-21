import Link from "next/link"
import { FileQuestion } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import { SiteContent, SiteFrame } from "@/components/shared/SiteShell"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 md:py-20 flex items-center">
        <SiteFrame className="w-full">
          <SiteContent>
            <div className="mx-auto max-w-xl text-center">
              <div className="brand-shell overflow-hidden rounded-[36px] border border-slate-200 bg-white p-8 md:p-12 shadow-[var(--shadow-lg)]">
                <div className="mx-auto grid size-16 place-items-center rounded-none bg-sky-50 text-sky-600 border border-sky-100">
                  <FileQuestion className="size-8" />
                </div>
                
                <h1 className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-ink)] md:text-4xl">
                  Halaman tidak ditemukan
                </h1>
                
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                  <Button asChild className="h-11 rounded-none bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700">
                    <Link href="/">Kembali ke Home</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-11 rounded-none border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
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
