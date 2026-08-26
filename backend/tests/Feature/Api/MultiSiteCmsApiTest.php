<?php

namespace Tests\Feature\Api;

use App\Models\Job;
use App\Models\ScrapedJob;
use App\Models\User;
use App\Models\Website;
use App\Models\WebsiteJob;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MultiSiteCmsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_admin_can_list_seeded_websites_and_assign_scraped_job_to_multiple_sites(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $scrapedJob = ScrapedJob::query()->create([
            'external_id' => 'multi-site-job-1',
            'source' => 'test',
            'source_url' => 'https://example.com/jobs/multi-site-job-1',
            'title' => 'Operations Manager',
            'company' => 'Example Co',
            'location' => 'Jakarta',
            'description' => 'A complete job description.',
            'status' => 'pending',
        ]);
        $websites = Website::query()->whereIn('domain', ['lowonganku.com', 'daftarkerja.id'])->get();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/websites')
            ->assertOk()
            ->assertJsonCount(4, 'data');

        $response = $this->actingAs($admin, 'sanctum')->putJson('/api/admin/scraped-jobs/'.$scrapedJob->id.'/websites', [
            'assignments' => [
                ['website_id' => $websites->firstWhere('domain', 'lowonganku.com')->id, 'status' => 'published'],
                ['website_id' => $websites->firstWhere('domain', 'daftarkerja.id')->id, 'status' => 'draft'],
            ],
        ]);

        $response->assertOk()->assertJsonCount(4, 'data.assignments');
        $this->assertSame(1, Job::query()->where('scraped_job_id', $scrapedJob->id)->count());
        $this->assertDatabaseHas('website_jobs', ['website_id' => $websites->firstWhere('domain', 'lowonganku.com')->id, 'status' => 'published']);
        $this->assertDatabaseHas('website_jobs', ['website_id' => $websites->firstWhere('domain', 'daftarkerja.id')->id, 'status' => 'draft']);
    }

    public function test_public_jobs_are_filtered_by_website_domain(): void
    {
        $lowonganku = Website::query()->where('domain', 'lowonganku.com')->firstOrFail();
        $daftarKerja = Website::query()->where('domain', 'daftarkerja.id')->firstOrFail();
        $job = Job::query()->create([
            'title' => 'Site-specific Job',
            'slug' => 'site-specific-job',
            'company_name' => 'Example Co',
            'location' => 'Jakarta',
            'description' => 'Description',
            'source_url' => 'https://example.com/jobs/site-specific-job',
            'source_url_hash' => hash('sha256', 'https://example.com/jobs/site-specific-job'),
            'source_name' => 'Example',
            'status' => 'draft',
        ]);
        WebsiteJob::query()->where('job_id', $job->id)->update(['status' => 'unused']);
        WebsiteJob::query()->where(['website_id' => $lowonganku->id, 'job_id' => $job->id])->update(['status' => 'published']);

        $this->getJson('/api/jobs', ['X-Website-Domain' => 'lowonganku.com'])->assertOk()->assertJsonPath('data.0.slug', 'site-specific-job');
        $this->getJson('/api/jobs', ['X-Website-Domain' => 'daftarkerja.id'])->assertOk()->assertJsonCount(0, 'data');
    }
}
