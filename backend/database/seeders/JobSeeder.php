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
            ['title' => 'Backend Laravel Developer', 'company_name' => 'Nusantara Tech', 'location' => 'Jakarta', 'status' => 'published'],
            ['title' => 'Frontend Next.js Engineer', 'company_name' => 'Garuda Digital', 'location' => 'Bandung', 'status' => 'published'],
            ['title' => 'Digital Marketing Specialist', 'company_name' => 'Aroma Retail', 'location' => 'Surabaya', 'status' => 'published'],
            ['title' => 'UI/UX Designer', 'company_name' => 'Loka Studio', 'location' => 'Yogyakarta', 'status' => 'published'],
            ['title' => 'Finance Staff', 'company_name' => 'Prima Finance', 'location' => 'Medan', 'status' => 'published'],
            ['title' => 'Sales Executive', 'company_name' => 'Maju Bersama', 'location' => 'Jakarta', 'status' => 'draft'],
            ['title' => 'Customer Support Officer', 'company_name' => 'Helply', 'location' => 'Remote', 'status' => 'draft'],
            ['title' => 'Data Entry Operator', 'company_name' => 'Sinar Data', 'location' => 'Bandung', 'status' => 'raw'],
            ['title' => 'Graphic Designer', 'company_name' => 'Pixel Karya', 'location' => 'Surabaya', 'status' => 'rejected'],
            ['title' => 'Product Intern', 'company_name' => 'Inovasi Anak Bangsa', 'location' => 'Remote', 'status' => 'duplicate'],
        ];

        foreach ($jobs as $index => $item) {
            $sourceUrl = "https://example.com/jobs/{$index}";

            Job::query()->updateOrCreate(
                ['source_url_hash' => $hashService->makeSourceUrlHash($sourceUrl)],
                [
                    'title' => $item['title'],
                    'company_name' => $item['company_name'],
                    'location' => $item['location'],
                    'category_id' => $categories['it-software'] ?? null,
                    'job_type' => 'full-time',
                    'salary_text' => 'Rp 6.000.000 - Rp 10.000.000',
                    'description' => 'Kesempatan berkarier dengan tim profesional dan growth tinggi.',
                    'raw_description' => 'RAW DATA '.strtoupper($item['title']),
                    'source_url' => $sourceUrl,
                    'source_name' => 'Example Source',
                    'content_hash' => $hashService->makeContentHash($item['title'], $item['company_name'], $item['location']),
                    'status' => $item['status'],
                    'published_at' => $item['status'] === 'published' ? now() : null,
                ]
            );
        }
    }
}
