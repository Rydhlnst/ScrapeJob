<?php

namespace Database\Seeders;

use App\Models\JobSource;
use Illuminate\Database\Seeder;

class JobSourceSeeder extends Seeder
{
    public function run(): void
    {
        $sources = [
            [
                'name' => 'glints',
                'base_url' => 'https://glints.com',
                'listing_url' => 'https://glints.com/id/en/opportunities/jobs',
                'is_active' => true,
                'scraping_allowed' => true,
                'notes' => 'Built-in Glints scraper',
            ],
            [
                'name' => 'jobstreet',
                'base_url' => 'https://www.jobstreet.co.id',
                'listing_url' => 'https://www.jobstreet.co.id/id/jobs',
                'is_active' => true,
                'scraping_allowed' => true,
                'notes' => 'Built-in Jobstreet scraper',
            ],
            [
                'name' => 'jobstreetexpress',
                'base_url' => 'https://id.jobstreetexpress.com',
                'listing_url' => 'https://id.jobstreetexpress.com/lowongan-Full-time',
                'is_active' => true,
                'scraping_allowed' => true,
                'notes' => 'Built-in Jobstreet Express scraper',
            ],
            [
                'name' => 'kalibrr',
                'base_url' => 'https://www.kalibrr.com',
                'listing_url' => 'https://www.kalibrr.com/job-board/te',
                'is_active' => true,
                'scraping_allowed' => true,
                'notes' => 'Built-in Kalibrr scraper',
            ],
            [
                'name' => 'lokerid',
                'base_url' => 'https://www.loker.id',
                'listing_url' => 'https://www.loker.id/cari-lowongan-kerja',
                'is_active' => true,
                'scraping_allowed' => true,
                'notes' => 'Built-in Loker.id scraper',
            ],
        ];

        foreach ($sources as $source) {
            JobSource::query()->updateOrCreate(
                ['name' => $source['name']],
                [
                    'base_url' => $source['base_url'],
                    'listing_url' => $source['listing_url'],
                    'is_active' => $source['is_active'],
                    'scraping_allowed' => $source['scraping_allowed'],
                    'notes' => $source['notes'],
                ]
            );
        }
    }
}
