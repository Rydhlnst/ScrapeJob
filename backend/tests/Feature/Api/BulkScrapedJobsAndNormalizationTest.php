<?php

namespace Tests\Feature\Api;

use App\Models\ScrapedJob;
use App\Models\User;
use App\Services\ScrapedJobImportService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BulkScrapedJobsAndNormalizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_bulk_approve_updates_status_to_approved(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $job1 = ScrapedJob::query()->create([
            'external_id' => 'job-bulk-1',
            'source' => 'test_source',
            'source_url' => 'https://example.com/jobs/1',
            'title' => 'Title 1',
            'company' => 'Company 1',
            'location' => 'Location 1',
            'status' => 'pending',
        ]);
        $job2 = ScrapedJob::query()->create([
            'external_id' => 'job-bulk-2',
            'source' => 'test_source',
            'source_url' => 'https://example.com/jobs/2',
            'title' => 'Title 2',
            'company' => 'Company 2',
            'location' => 'Location 2',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/scraped-jobs/bulk-approve', [
            'ids' => [$job1->id, $job2->id],
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('scraped_jobs', ['id' => $job1->id, 'status' => 'approved']);
        $this->assertDatabaseHas('scraped_jobs', ['id' => $job2->id, 'status' => 'approved']);
    }

    public function test_bulk_reject_updates_status_to_rejected(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $job1 = ScrapedJob::query()->create([
            'external_id' => 'job-bulk-3',
            'source' => 'test_source',
            'source_url' => 'https://example.com/jobs/3',
            'title' => 'Title 3',
            'company' => 'Company 3',
            'location' => 'Location 3',
            'status' => 'pending',
        ]);
        $job2 = ScrapedJob::query()->create([
            'external_id' => 'job-bulk-4',
            'source' => 'test_source',
            'source_url' => 'https://example.com/jobs/4',
            'title' => 'Title 4',
            'company' => 'Company 4',
            'location' => 'Location 4',
            'status' => 'approved',
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/scraped-jobs/bulk-reject', [
            'ids' => [$job1->id, $job2->id],
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('scraped_jobs', ['id' => $job1->id, 'status' => 'rejected']);
        $this->assertDatabaseHas('scraped_jobs', ['id' => $job2->id, 'status' => 'rejected']);
    }

    public function test_bulk_publish_creates_jobs_and_returns_counts(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $job1 = ScrapedJob::query()->create([
            'external_id' => 'job-bulk-5',
            'source' => 'test_source',
            'status' => 'approved',
            'title' => 'Engineer 1',
            'company' => 'Acme',
            'location' => 'Jakarta',
            'description' => 'Desc 1',
            'source_url' => 'https://example.com/job1',
        ]);
        $job2 = ScrapedJob::query()->create([
            'external_id' => 'job-bulk-6',
            'source' => 'test_source',
            'status' => 'approved',
            'title' => 'Engineer 2',
            'company' => 'Acme',
            'location' => 'Jakarta',
            'description' => 'Desc 2',
            'source_url' => 'https://example.com/job2',
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/scraped-jobs/bulk-publish', [
            'ids' => [$job1->id, $job2->id],
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.success_count', 2)
            ->assertJsonPath('data.duplicate_count', 0);

        $this->assertDatabaseHas('scraped_jobs', ['id' => $job1->id, 'status' => 'published']);
        $this->assertDatabaseHas('scraped_jobs', ['id' => $job2->id, 'status' => 'published']);
        $this->assertDatabaseHas('jobs', ['scraped_job_id' => $job1->id]);
        $this->assertDatabaseHas('jobs', ['scraped_job_id' => $job2->id]);
    }

    public function test_url_normalization_strips_query_params_and_trailing_slashes(): void
    {
        $importService = app(ScrapedJobImportService::class);

        $jobs = [
            [
                'external_job_id' => 'job-1',
                'source_url' => 'HTTPS://glints.com/id/opportunities/jobs/explore/?ref=123#anchor',
                'title' => 'Backend Developer',
                'company_name' => 'Glints Co',
                'location' => 'Jakarta',
                'description' => 'A great job',
            ],
            [
                'external_job_id' => 'job-2',
                'source_url' => 'https://glints.com/id/opportunities/jobs/explore/?ref=456',
                'title' => 'Backend Developer',
                'company_name' => 'Glints Co',
                'location' => 'Jakarta',
                'description' => 'A great job',
            ]
        ];

        $result = $importService->import('glints', null, $jobs);

        // First job should be created
        // Second job has different query params and different external_job_id,
        // but it is a duplicate by title/company/location/source_url (which should be normalized to the same base URL)
        $this->assertEquals(1, $result['created_count']);
        $this->assertEquals(1, $result['duplicate_count']);

        $scrapedJob = ScrapedJob::query()->where('external_id', 'job-1')->first();
        $this->assertNotNull($scrapedJob);
        $this->assertEquals('https://glints.com/id/opportunities/jobs/explore', $scrapedJob->source_url);
    }
}
