<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Job;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicJobsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_ok_ac05_public_jobs_only_returns_published_status(): void
    {
        $category = Category::query()->create([
            'name' => 'IT & Software',
            'slug' => 'it-software',
        ]);

        Job::query()->create([
            'title' => 'Frontend Engineer',
            'slug' => 'frontend-engineer',
            'company_name' => 'Acme',
            'location' => 'Jakarta',
            'category_id' => $category->id,
            'description' => 'Published job description',
            'source_url' => 'https://example.com/jobs/1',
            'source_url_hash' => hash('sha256', 'https://example.com/jobs/1'),
            'source_name' => 'Example',
            'status' => 'published',
            'published_at' => now(),
        ]);

        Job::query()->create([
            'title' => 'Hidden Draft Job',
            'slug' => 'hidden-draft-job',
            'company_name' => 'Acme',
            'location' => 'Bandung',
            'description' => 'Draft job',
            'source_url' => 'https://example.com/jobs/2',
            'source_url_hash' => hash('sha256', 'https://example.com/jobs/2'),
            'source_name' => 'Example',
            'status' => 'draft',
        ]);

        $response = $this->getJson('/api/jobs');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'frontend-engineer');
    }

    public function test_err_ac06_public_job_detail_returns_404_for_unpublished_job(): void
    {
        Job::query()->create([
            'title' => 'Raw Job',
            'slug' => 'raw-job',
            'company_name' => 'Raw Inc',
            'location' => 'Remote',
            'description' => 'Raw job',
            'source_url' => 'https://example.com/jobs/raw',
            'source_url_hash' => hash('sha256', 'https://example.com/jobs/raw'),
            'source_name' => 'Example',
            'status' => 'raw',
        ]);

        $response = $this->getJson('/api/jobs/raw-job');

        $response->assertStatus(404)
            ->assertJsonPath('success', false);
    }

    public function test_ok_public_jobs_stats_returns_aggregates(): void
    {
        Job::query()->create([
            'title' => 'Remote Backend Engineer',
            'slug' => 'remote-backend-engineer',
            'company_name' => 'Remote Inc',
            'location' => 'Remote',
            'description' => 'Remote job',
            'source_url' => 'https://example.com/jobs/remote',
            'source_url_hash' => hash('sha256', 'https://example.com/jobs/remote'),
            'source_name' => 'Example',
            'status' => 'published',
            'job_type' => 'remote',
            'is_active' => true,
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/jobs/stats');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.totalActive', 1)
            ->assertJsonPath('data.remoteJobs', 1);
    }
}
