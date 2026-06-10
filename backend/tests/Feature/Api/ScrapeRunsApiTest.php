<?php

namespace Tests\Feature\Api;

use App\Models\JobSource;
use App\Models\Job;
use App\Models\ScrapedJob;
use App\Models\User;
use App\Services\Scraping\PythonScraperExecutor;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScrapeRunsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_err_ac10_scrape_run_rejects_source_when_scraping_not_allowed(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $source = JobSource::query()->create([
            'name' => 'example jobs',
            'base_url' => 'https://example.com',
            'listing_url' => 'https://example.com/jobs',
            'is_active' => true,
            'scraping_allowed' => false,
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/scrape-runs/run', [
            'source' => 'example jobs',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_ok_ac11_scrape_run_creates_run_with_metrics_for_execution(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $source = JobSource::query()->create([
            'name' => 'example jobs',
            'base_url' => 'https://example.com',
            'listing_url' => 'https://example.com/jobs',
            'is_active' => true,
            'scraping_allowed' => true,
        ]);

        $executor = $this->createMock(PythonScraperExecutor::class);
        $executor->method('run')->willReturn([
            'source' => 'example jobs',
            'scraped_at' => now()->toIso8601String(),
            'total' => 0,
            'jobs' => [],
        ]);
        $this->app->instance(PythonScraperExecutor::class, $executor);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/scrape-runs/run', [
            'source' => 'example jobs',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.sourceName', 'example jobs')
            ->assertJsonPath('data.mappedCount', 0)
            ->assertJsonPath('data.errorCount', 0);

        $runId = $response->json('data.id');
        $this->assertDatabaseHas('scrape_runs', [
            'id' => $runId,
            'source_name' => 'example jobs',
            'status' => 'success',
            'mapped_count' => 0,
        ]);
    }

    public function test_ok_scrape_run_stores_imported_jobs_as_pending_for_admin_review(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        JobSource::query()->create([
            'name' => 'example jobs',
            'base_url' => 'https://example.com',
            'listing_url' => 'https://example.com/jobs',
            'is_active' => true,
            'scraping_allowed' => true,
        ]);

        $executor = $this->createMock(PythonScraperExecutor::class);
        $executor->method('run')->willReturn([
            'source' => 'example jobs',
            'scraped_at' => now()->toIso8601String(),
            'total' => 1,
            'jobs' => [[
                'external_job_id' => 'job-001',
                'source_url' => 'https://example.com/jobs/job-001',
                'title' => 'Backend Engineer',
                'company_name' => 'Acme Labs',
                'location' => 'Jakarta, DKI Jakarta',
                'job_type' => 'Full Time',
                'description' => '<p>Laravel, React, BPJS, bonus</p>',
                'posted_at' => now()->toDateString(),
                'scraped_at' => now()->toIso8601String(),
            ]],
        ]);
        $this->app->instance(PythonScraperExecutor::class, $executor);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/scrape-runs/run', [
            'source' => 'example jobs',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $scrapedJob = ScrapedJob::query()->first();
        $job = Job::query()->first();

        $this->assertNotNull($scrapedJob);
        $this->assertNull($job);
        $this->assertSame('pending', $scrapedJob->status);
        $this->assertSame('Backend Engineer', $scrapedJob->title);
    }

    public function test_ok_scraped_job_must_be_approved_before_publish(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $scrapedJob = ScrapedJob::query()->create([
            'external_id' => 'job-approve-001',
            'source' => 'example jobs',
            'source_url' => 'https://example.com/jobs/job-approve-001',
            'title' => 'Backend Engineer',
            'company' => 'Acme Labs',
            'location' => 'Jakarta, DKI Jakarta',
            'employment_type' => 'Full Time',
            'description' => '<p>Laravel, React, BPJS, bonus</p>',
            'posted_date' => now()->toDateString(),
            'scraped_at' => now(),
            'status' => 'pending',
        ]);

        $publishWhilePending = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/scraped-jobs/{$scrapedJob->id}/publish");

        $publishWhilePending->assertStatus(422)
            ->assertJsonPath('success', false);

        $approve = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/scraped-jobs/{$scrapedJob->id}/approve");

        $approve->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $publishApproved = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/scraped-jobs/{$scrapedJob->id}/publish");

        $publishApproved->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('jobs', [
            'scraped_job_id' => $scrapedJob->id,
            'status' => 'published',
            'title' => 'Backend Engineer',
        ]);
        $this->assertDatabaseHas('scraped_jobs', [
            'id' => $scrapedJob->id,
            'status' => 'published',
        ]);
    }
}
