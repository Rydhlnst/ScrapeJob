<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Job;
use App\Services\Jobs\JobHashService;
use Illuminate\Database\Seeder;

class JobSeeder extends Seeder
{
    public function run(): void
    {
        $hashService = app(JobHashService::class);
        $categories = Category::query()->pluck('id', 'slug');

        $jobs = [
            ['title' => 'Backend Laravel Developer', 'company_name' => 'Nusantara Tech', 'location' => 'Jakarta', 'category' => 'it-software', 'status' => 'published'],
            ['title' => 'Frontend Next.js Engineer', 'company_name' => 'Garuda Digital', 'location' => 'Bandung', 'category' => 'it-software', 'status' => 'published'],
            ['title' => 'Full Stack TypeScript Engineer', 'company_name' => 'Astra Ventures', 'location' => 'Jakarta', 'category' => 'it-software', 'status' => 'published'],
            ['title' => 'Mobile Flutter Developer', 'company_name' => 'Kilat Apps', 'location' => 'Remote', 'category' => 'it-software', 'status' => 'published'],
            ['title' => 'Digital Marketing Specialist', 'company_name' => 'Aroma Retail', 'location' => 'Surabaya', 'category' => 'marketing', 'status' => 'published'],
            ['title' => 'Growth Marketing Manager', 'company_name' => 'Lokal Brand Co.', 'location' => 'Jakarta', 'category' => 'marketing', 'status' => 'published'],
            ['title' => 'UI/UX Designer', 'company_name' => 'Loka Studio', 'location' => 'Yogyakarta', 'category' => 'it-software', 'status' => 'published'],
            ['title' => 'Product Designer', 'company_name' => 'Pixel Karya', 'location' => 'Jakarta', 'category' => 'it-software', 'status' => 'published'],
            ['title' => 'Finance Staff', 'company_name' => 'Prima Finance', 'location' => 'Medan', 'category' => 'finance', 'status' => 'published'],
            ['title' => 'Accounting Officer', 'company_name' => 'Sinar Sentosa', 'location' => 'Semarang', 'category' => 'finance', 'status' => 'published'],
            ['title' => 'Sales Executive', 'company_name' => 'Maju Bersama', 'location' => 'Jakarta', 'category' => 'marketing', 'status' => 'draft'],
            ['title' => 'Business Development Rep', 'company_name' => 'Nusa Trading', 'location' => 'Surabaya', 'category' => 'marketing', 'status' => 'draft'],
            ['title' => 'Customer Support Officer', 'company_name' => 'Helply', 'location' => 'Remote', 'category' => 'customer-service', 'status' => 'draft'],
            ['title' => 'Customer Success Manager', 'company_name' => 'Serba Cloud', 'location' => 'Remote', 'category' => 'customer-service', 'status' => 'draft'],
            ['title' => 'Data Analyst', 'company_name' => 'Data Nusantara', 'location' => 'Jakarta', 'category' => 'it-software', 'status' => 'draft'],
            ['title' => 'DevOps Engineer', 'company_name' => 'CloudId', 'location' => 'Remote', 'category' => 'it-software', 'status' => 'draft'],
            ['title' => 'Data Entry Operator', 'company_name' => 'Sinar Data', 'location' => 'Bandung', 'category' => 'it-software', 'status' => 'raw'],
            ['title' => 'Graphic Designer', 'company_name' => 'Studio Warna', 'location' => 'Surabaya', 'category' => 'it-software', 'status' => 'rejected'],
            ['title' => 'Product Intern', 'company_name' => 'Inovasi Anak Bangsa', 'location' => 'Remote', 'category' => 'it-software', 'status' => 'duplicate'],
            ['title' => 'HR Generalist', 'company_name' => 'Talenta Group', 'location' => 'Jakarta', 'category' => 'finance', 'status' => 'published'],
        ];

        foreach ($jobs as $index => $item) {
            $sourceUrl = "https://example.com/jobs/{$index}";
            $descriptionHtml = <<<HTML
<p>Perusahaan kami sedang mencari <strong>{$item['title']}</strong> yang bersemangat, kolaboratif, dan siap tumbuh bersama tim.</p>
<h3>Kualifikasi</h3>
<ul>
    <li>Minimal 2 tahun pengalaman relevan.</li>
    <li>Terbiasa bekerja lintas fungsi &amp; agile.</li>
    <li>Komunikasi bahasa Indonesia &amp; Inggris.</li>
</ul>
<h3>Benefit</h3>
<ul>
    <li>Asuransi kesehatan, WFH friendly.</li>
    <li>Learning budget tahunan.</li>
</ul>
HTML;

            Job::query()->updateOrCreate(
                ['source_url_hash' => $hashService->makeSourceUrlHash($sourceUrl)],
                [
                    'title' => $item['title'],
                    'company_name' => $item['company_name'],
                    'location' => $item['location'],
                    'category_id' => $categories[$item['category']] ?? $categories['it-software'] ?? null,
                    'job_type' => $index % 3 === 0 ? 'full-time' : ($index % 3 === 1 ? 'contract' : 'internship'),
                    'salary_text' => 'Rp '.number_format(6 + $index, 0).'.000.000 - Rp '.number_format(10 + $index, 0).'.000.000',
                    'description' => $descriptionHtml,
                    'raw_description' => 'RAW '.strtoupper($item['title']),
                    'source_url' => $sourceUrl,
                    'source_name' => $index % 2 === 0 ? 'Example Source' : 'Jobstreet ID',
                    'content_hash' => $hashService->makeContentHash($item['title'], $item['company_name'], $item['location']),
                    'status' => $item['status'],
                    'published_at' => $item['status'] === 'published' ? now()->subDays($index) : null,
                ]
            );
        }
    }
}
