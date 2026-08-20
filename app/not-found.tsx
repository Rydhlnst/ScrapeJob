import Link from "next/link"
import { FileQuestion } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import { SiteContent, SiteFrame } from "@/components/shared/SiteShell"
import { getNavbarData } from "@/lib/api/navbar"

export default async function NotFound() {
  const navbarData = await getNavbarData().catch(() => ({ jobs: [], categories: [], totalJobs: 0 }))

  return (
    <div className="flex min-h-screen w-full max-w-none flex-col overflow-x-hidden bg-white">
      <Navbar jobs={navbarData.jobs} categories={navbarData.categories} totalJobs={navbarData.totalJobs} />
      <main className="flex min-h-[calc(100vh-6rem)] w-full flex-1 items-center bg-white pb-16 pt-24 md:pb-24">
        <SiteFrame className="w-full">
          <SiteContent>
            <div className="mx-auto max-w-[920px] text-center">
              <div className="rounded-[32px] bg-[#1f5f9f] p-1.5 shadow-[0_10px_0_rgba(23,23,23,.08)]">
                <div className="overflow-hidden rounded-[27px] bg-white p-8 md:p-14">
                <div className="mx-auto grid size-16 place-items-center rounded-full border border-[#f2a23a] bg-white text-[#2479d1]">
                  <FileQuestion className="size-8" />
                </div>
                
                <h1 className="jobkan-section-title mt-6 text-3xl font-extrabold tracking-[-0.05em] text-[#171717] md:text-5xl">
                  Halaman tidak ditemukan
                </h1>
                
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                  <Button asChild className="h-11 rounded-full bg-[#1f5f9f] px-5 text-sm font-semibold text-white shadow-[0_3px_0_rgba(23,23,23,.12)] hover:bg-[#2479d1]">
                    <Link href="/">Kembali ke Home</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-11 rounded-full border-black/10 bg-white px-5 text-sm font-semibold text-[#171717] hover:border-[#3f95e8] hover:bg-[#f7f9fb]">
                    <Link href="/jobs">Cari Lowongan</Link>
                  </Button>
                </div>
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
