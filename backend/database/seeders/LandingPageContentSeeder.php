<?php

namespace Database\Seeders;

use App\Models\LandingPageContent;
use App\Models\Website;
use Illuminate\Database\Seeder;

class LandingPageContentSeeder extends Seeder
{
    public function run(): void
    {
        $websiteId = Website::query()->where('domain', 'lowonganku.com')->value('id');
        $payload = [
            'hero' => [
                'title' => 'Temukan Lowongan Terbaik dari Perusahaan Terpercaya',
                'description' => 'Ratusan ribu lowongan aktif dari seluruh Indonesia, diperbarui setiap hari.',
                'primaryCta' => ['label' => 'Cari Lowongan', 'href' => '/jobs'],
                'secondaryCta' => ['label' => 'Hubungi Kami', 'href' => '/contact'],
                'quickLinks' => [
                    ['label' => 'S1 Jakarta', 'href' => '/jobs?q=S1+Jakarta'],
                    ['label' => 'Fresh Graduate', 'href' => '/jobs?q=Fresh+Graduate'],
                    ['label' => 'Remote', 'href' => '/jobs?q=Remote'],
                    ['label' => 'Full Time', 'href' => '/jobs?q=Full+Time'],
                ],
            ],
            'featuredJobs' => [
                'title' => 'Lowongan Pilihan Minggu Ini',
                'description' => 'Kurasi mingguan tim editor Lowonganku.',
                'emptyState' => 'Belum ada lowongan pilihan.',
                'rules' => [
                    'sort' => 'newest',
                    'limit' => 8,
                    'category' => null,
                    'source' => null,
                ],
            ],
            'benefits' => [
                'title' => 'Kenapa Lowonganku',
                'items' => [
                    ['title' => 'Data Terverifikasi', 'description' => 'Setiap lowongan melewati review sebelum tayang.'],
                    ['title' => 'Update Harian', 'description' => 'Ribuan lowongan baru masuk pipeline setiap hari.'],
                    ['title' => 'Filter Cerdas', 'description' => 'Cari sesuai lokasi, pendidikan, dan pengalaman.'],
                    ['title' => 'Gratis Selamanya', 'description' => 'Tidak ada biaya untuk pencari kerja.'],
                ],
            ],
            'trustedCompanies' => [
                'title' => 'Perusahaan yang Mempercayai Kami',
                'items' => [
                    ['id' => '1', 'name' => 'Astra Group', 'url' => '/logos/astra.svg', 'brandColor' => '#003DA5'],
                    ['id' => '2', 'name' => 'Bank Mandiri', 'url' => '/logos/mandiri.svg', 'brandColor' => '#003DA5'],
                    ['id' => '3', 'name' => 'Telkomsel', 'url' => '/logos/telkomsel.svg', 'brandColor' => '#E31E24'],
                    ['id' => '4', 'name' => 'Gojek', 'url' => '/logos/gojek.svg', 'brandColor' => '#00AA13'],
                    ['id' => '5', 'name' => 'Traveloka', 'url' => '/logos/traveloka.svg', 'brandColor' => '#0064D2'],
                    ['id' => '6', 'name' => 'Unilever ID', 'url' => '/logos/unilever.svg', 'brandColor' => '#1F36C7'],
                ],
            ],
            'cta' => [
                'title' => 'Temukan lowongan terbaik untuk langkah berikutnya.',
                'body' => 'Cari, bandingkan, lalu lanjutkan ke sumber resmi ketika kamu menemukan peran yang tepat.',
                'primaryButton' => ['label' => 'Cari Lowongan', 'href' => '/jobs'],
                'secondaryButton' => ['label' => 'Jelajahi Kategori', 'href' => '#categories'],
            ],
        ];

        LandingPageContent::query()->updateOrCreate(
            ['website_id' => $websiteId, 'key' => 'landing_page'],
            [
                'draft_payload' => $payload,
                'published_payload' => $payload,
                'published_at' => now(),
            ],
        );
    }
}
