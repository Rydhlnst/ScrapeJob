<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $websites = DB::table('websites')->where('is_active', true)->get(['id', 'domain']);
        $jobs = DB::table('jobs')->get(['id', 'status', 'published_at']);
        $defaultDomain = 'lowonganku.com';

        foreach ($websites as $website) {
            foreach ($jobs as $job) {
                $existing = DB::table('website_jobs')
                    ->where('website_id', $website->id)
                    ->where('job_id', $job->id)
                    ->first();

                if ($existing) {
                    continue;
                }

                $status = 'unused';
                if ($website->domain === $defaultDomain) {
                    $status = match ($job->status) {
                        'published' => 'published',
                        'draft' => 'draft',
                        default => 'unused',
                    };
                }

                DB::table('website_jobs')->insert([
                    'id' => (string) Str::uuid(),
                    'website_id' => $website->id,
                    'job_id' => $job->id,
                    'status' => $status,
                    'published_at' => $status === 'published' ? ($job->published_at ?? now()) : null,
                    'expired_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        foreach (['auto_publish_jobs', 'notify_on_scrape', 'notify_emails', 'scraper_active_sources', 'ai_cleanup_url', 'ai_cleanup_token'] as $key) {
            $row = DB::table('settings')->where('key', $key)->whereNotNull('website_id')->first();
            if ($row && ! DB::table('settings')->where('key', $key)->whereNull('website_id')->exists()) {
                DB::table('settings')->where('id', $row->id)->update(['website_id' => null]);
            }
        }
    }

    public function down(): void
    {
        // Assignment backfills are intentionally retained on rollback because
        // they may contain editorial decisions made after deployment.
    }
};
