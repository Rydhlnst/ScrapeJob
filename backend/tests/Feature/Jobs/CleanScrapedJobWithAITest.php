<?php

namespace Tests\Feature\Jobs;

use App\Jobs\CleanScrapedJobWithAI;
use App\Models\ScrapedJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CleanScrapedJobWithAITest extends TestCase
{
    use RefreshDatabase;

    public function test_job_skips_when_disabled(): void
    {
        Http::fake();

        config(['services.ai_cleanup.enabled' => false]);

        $scrapedJob = ScrapedJob::query()->create([
            'external_id' => 'job-test-disabled',
            'source' => 'test_source',
            'source_url' => 'https://example.com/jobs/1',
            'title' => 'Raw Title',
            'company' => 'Raw Company',
            'location' => 'Raw Location',
            'status' => 'pending',
        ]);

        CleanScrapedJobWithAI::dispatchSync($scrapedJob);

        Http::assertNothingSent();
        $this->assertSame('Raw Title', $scrapedJob->fresh()->title);
    }

    public function test_job_sends_http_post_and_updates_scraped_job(): void
    {
        config([
            'services.ai_cleanup.enabled' => true,
            'services.ai_cleanup.url' => 'http://localhost:3000/api/internal/clean-job',
            'services.ai_cleanup.token' => 'test-token',
        ]);

        Http::fake([
            'http://localhost:3000/api/internal/clean-job' => Http::response([
                'success' => true,
                'data' => [
                    'title' => 'Clean Title',
                    'company' => 'Clean Company',
                    'location' => 'Clean Location',
                    'salary' => 'IDR 10,000,000',
                    'employment_type' => 'Full-time',
                    'description' => '<p>Clean Description</p>',
                    'description_summary' => 'Clean summary description',
                ]
            ], 200)
        ]);

        $scrapedJob = ScrapedJob::query()->create([
            'external_id' => 'job-test-enabled',
            'source' => 'test_source',
            'source_url' => 'https://example.com/jobs/2',
            'title' => 'Raw Title',
            'company' => 'Raw Company',
            'location' => 'Raw Location',
            'description' => 'Raw Description',
            'status' => 'pending',
        ]);

        CleanScrapedJobWithAI::dispatchSync($scrapedJob);

        Http::assertSent(function ($request) {
            return $request->url() === 'http://localhost:3000/api/internal/clean-job'
                && $request->hasHeader('Authorization', 'Bearer test-token')
                && $request['title'] === 'Raw Title'
                && $request['company'] === 'Raw Company';
        });

        $scrapedJob = $scrapedJob->fresh();
        $this->assertSame('Clean Title', $scrapedJob->title);
        $this->assertSame('Clean Company', $scrapedJob->company);
        $this->assertSame('Clean Location', $scrapedJob->location);
        $this->assertSame('IDR 10,000,000', $scrapedJob->salary);
        $this->assertSame('Full-time', $scrapedJob->employment_type);
        $this->assertSame('<p>Clean Description</p>', $scrapedJob->description);
        $this->assertSame('Clean summary description', $scrapedJob->description_summary);
    }

    public function test_job_throws_exception_on_api_error(): void
    {
        config([
            'services.ai_cleanup.enabled' => true,
            'services.ai_cleanup.url' => 'http://localhost:3000/api/internal/clean-job',
            'services.ai_cleanup.token' => 'test-token',
        ]);

        Http::fake([
            'http://localhost:3000/api/internal/clean-job' => Http::response([
                'success' => false,
                'error' => 'API limit exceeded'
            ], 500)
        ]);

        $scrapedJob = ScrapedJob::query()->create([
            'external_id' => 'job-test-error',
            'source' => 'test_source',
            'source_url' => 'https://example.com/jobs/3',
            'title' => 'Raw Title',
            'company' => 'Raw Company',
            'location' => 'Raw Location',
            'status' => 'pending',
        ]);

        $this->expectException(\RuntimeException::class);
        CleanScrapedJobWithAI::dispatchSync($scrapedJob);
    }
}
