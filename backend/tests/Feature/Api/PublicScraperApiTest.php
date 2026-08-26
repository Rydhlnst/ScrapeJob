<?php

namespace Tests\Feature\Api;

use App\Jobs\ScrapeJobsJob;
use App\Models\JobSource;
use App\Models\ScrapeLog;
use App\Models\ScrapeRun;
use App\Services\Scraping\ScrapeExecutionService;
use App\Services\Scraping\ScraperManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class PublicScraperApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_ok_public_scraper_trigger_dispatches_queue_job(): void
    {
        Queue::fake();

        $response = $this->postJson('/api/scraper/run', [
            'source' => 'glints',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.source', 'glints');

        Queue::assertPushed(ScrapeJobsJob::class, function (ScrapeJobsJob $job): bool {
            return $job->source === 'glints';
        });
    }

    public function test_ok_all_source_queue_job_fans_out_to_one_job_per_active_source(): void
    {
        Queue::fake();

        foreach (['glints', 'jobstreet', 'kalibrr'] as $sourceName) {
            JobSource::query()->create([
                'name' => $sourceName,
                'base_url' => 'https://example.com',
                'listing_url' => 'https://example.com/jobs',
                'is_active' => true,
                'scraping_allowed' => true,
            ]);
        }

        $job = new ScrapeJobsJob();
        $job->handle(app(ScrapeExecutionService::class), app(ScraperManager::class));

        Queue::assertPushed(ScrapeJobsJob::class, 3);
        Queue::assertPushed(ScrapeJobsJob::class, fn (ScrapeJobsJob $queued): bool => $queued->source !== null);
    }

    public function test_err_public_scraper_trigger_rejects_unknown_source(): void
    {
        Queue::fake();

        $response = $this->postJson('/api/scraper/run', [
            'source' => 'unknown-source',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);

        Queue::assertNothingPushed();
    }

    public function test_ok_public_scraper_logs_returns_paginated_data(): void
    {
        $run = ScrapeRun::query()->create([
            'source_name' => 'glints',
            'status' => 'success',
            'started_at' => now()->subMinute(),
            'finished_at' => now(),
        ]);

        ScrapeLog::query()->create([
            'scrape_run_id' => $run->id,
            'url' => 'https://example.com/job/1',
            'title' => 'Backend Engineer',
            'status' => 'success',
            'message' => 'created',
            'payload' => ['id' => '1'],
        ]);

        $response = $this->getJson('/api/scraper/logs');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');
    }
}
