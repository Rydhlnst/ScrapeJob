<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            ['title' => 'Tentang Lowonganku', 'status' => 'published', 'summary' => 'Kenali visi & misi platform Lowonganku dalam menghubungkan talenta dengan perusahaan.'],
            ['title' => 'Kebijakan Privasi', 'status' => 'published', 'summary' => 'Bagaimana kami memproses & melindungi data personal pengguna.'],
            ['title' => 'Syarat & Ketentuan', 'status' => 'published', 'summary' => 'Aturan penggunaan platform Lowonganku bagi pencari kerja dan perusahaan.'],
            ['title' => 'FAQ Pencari Kerja', 'status' => 'published', 'summary' => 'Pertanyaan paling sering diajukan oleh pencari kerja.'],
            ['title' => 'FAQ Perusahaan', 'status' => 'published', 'summary' => 'Panduan lengkap untuk perusahaan yang ingin memasang lowongan.'],
            ['title' => 'Panduan Melamar Kerja', 'status' => 'published', 'summary' => 'Tips efektif melamar melalui Lowonganku.'],
            ['title' => 'Karier di Lowonganku', 'status' => 'draft', 'summary' => 'Bergabunglah bersama tim yang membangun masa depan rekrutmen di Indonesia.'],
            ['title' => 'Media Kit', 'status' => 'draft', 'summary' => 'Aset resmi Lowonganku untuk keperluan media & pers.'],
            ['title' => 'Blog Karier', 'status' => 'published', 'summary' => 'Artikel & panduan seputar dunia karier.'],
            ['title' => 'Kontak', 'status' => 'published', 'summary' => 'Hubungi tim Lowonganku untuk pertanyaan atau kemitraan.'],
        ];

        foreach ($pages as $item) {
            $slug = Str::slug($item['title']);
            Page::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $item['title'],
                    'status' => $item['status'],
                    'summary' => $item['summary'],
                    'content' => "<p>{$item['summary']}</p><p>Konten halaman ini akan segera dilengkapi oleh tim editorial Lowonganku.</p>",
                    'seo_title' => $item['title'].' | Lowonganku',
                    'seo_description' => $item['summary'],
                    'published_at' => $item['status'] === 'published' ? now() : null,
                ],
            );
        }
    }
}
