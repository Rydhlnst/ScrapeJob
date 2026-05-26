<?php

namespace Tests\Feature\Api;

use App\Models\JobSource;
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
}
