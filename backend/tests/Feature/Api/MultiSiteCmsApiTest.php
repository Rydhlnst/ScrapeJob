<?php

namespace Tests\Feature\Api;

use App\Models\Job;
use App\Models\Category;
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
        $this->getJson('/api/jobs', [
            'X-Website-Domain' => 'daftarkerja.id',
            'X-Website-Id' => $lowonganku->id,
        ])->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_publish_and_unpublish_are_independent_per_website(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $job = Job::query()->create([
            'title' => 'Independent publication job',
            'slug' => 'independent-publication-job',
            'company_name' => 'Example Co',
            'location' => 'Jakarta',
            'description' => 'Description',
            'source_url' => 'https://example.com/jobs/independent',
            'source_url_hash' => hash('sha256', 'https://example.com/jobs/independent'),
            'source_name' => 'Example',
            'status' => 'draft',
        ]);
        $siteA = Website::query()->where('domain', 'lowonganku.com')->firstOrFail();
        $siteB = Website::query()->where('domain', 'daftarkerja.id')->firstOrFail();

        $this->actingAs($admin, 'sanctum')
            ->withHeader('X-Website-Id', $siteA->id)
            ->patchJson('/api/admin/jobs/'.$job->id.'/publish')
            ->assertOk();

        $this->assertDatabaseHas('website_jobs', ['website_id' => $siteA->id, 'job_id' => $job->id, 'status' => 'published']);
        $this->assertDatabaseHas('website_jobs', ['website_id' => $siteB->id, 'job_id' => $job->id, 'status' => 'unused']);

        $this->actingAs($admin, 'sanctum')
            ->withHeader('X-Website-Id', $siteB->id)
            ->patchJson('/api/admin/jobs/'.$job->id.'/publish')
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->withHeader('X-Website-Id', $siteA->id)
            ->patchJson('/api/admin/jobs/'.$job->id.'/unpublish')
            ->assertOk();

        $this->assertDatabaseHas('website_jobs', ['website_id' => $siteA->id, 'job_id' => $job->id, 'status' => 'draft']);
        $this->assertDatabaseHas('website_jobs', ['website_id' => $siteB->id, 'job_id' => $job->id, 'status' => 'published']);
    }

    public function test_website_job_overrides_are_scoped_and_return_effective_public_content(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $siteA = Website::query()->where('domain', 'lowonganku.com')->firstOrFail();
        $siteB = Website::query()->where('domain', 'daftarkerja.id')->firstOrFail();
        $categoryA = Category::query()->create(['website_id' => $siteA->id, 'name' => 'Technology A', 'slug' => 'technology-a']);
        $categoryB = Category::query()->create(['website_id' => $siteB->id, 'name' => 'Technology B', 'slug' => 'technology-b']);
        $job = Job::query()->create([
            'title' => 'Canonical title',
            'slug' => 'canonical-title',
            'company_name' => 'Example Co',
            'location' => 'Jakarta',
            'description' => 'Canonical description',
            'source_url' => 'https://example.com/jobs/canonical',
            'source_url_hash' => hash('sha256', 'https://example.com/jobs/canonical'),
            'source_name' => 'Example',
            'status' => 'draft',
        ]);
        WebsiteJob::query()->where('job_id', $job->id)->update(['status' => 'published']);

        $this->actingAs($admin, 'sanctum')
            ->withHeader('X-Website-Id', $siteA->id)
            ->putJson('/api/admin/jobs/'.$job->id.'/site-content', [
                'title' => 'Site A title',
                'slug' => 'site-a-title',
                'description' => 'Site A description',
                'category_id' => $categoryA->id,
                'seo_title' => 'Site A SEO',
            ])
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->withHeader('X-Website-Id', $siteA->id)
            ->putJson('/api/admin/jobs/'.$job->id.'/site-content', [
                'category_id' => $categoryB->id,
            ])
            ->assertStatus(422);

        $this->getJson('/api/jobs/site-a-title', ['X-Website-Domain' => 'lowonganku.com'])
            ->assertOk()
            ->assertJsonPath('data.title', 'Site A title')
            ->assertJsonPath('data.category.name', 'Technology A');

        $this->getJson('/api/jobs/canonical-title', ['X-Website-Domain' => 'daftarkerja.id'])
            ->assertOk()
            ->assertJsonPath('data.title', 'Canonical title');
    }

    public function test_domain_alias_and_disabled_website_resolution(): void
    {
        $this->getJson('/api/site-config', ['X-Website-Domain' => 'www.daftarkerja.id'])
            ->assertOk()
            ->assertJsonPath('data.website.domain', 'daftarkerja.id');

        Website::query()->where('domain', 'daftarkerja.id')->update(['is_active' => false]);

        $this->getJson('/api/site-config', ['X-Website-Domain' => 'www.daftarkerja.id'])
            ->assertNotFound();
    }

    public function test_new_website_receives_existing_jobs_as_unused_assignments(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $job = Job::query()->create([
            'title' => 'Existing job',
            'slug' => 'existing-job',
            'company_name' => 'Example Co',
            'location' => 'Jakarta',
            'description' => 'Description',
            'source_url' => 'https://example.com/jobs/existing',
            'source_url_hash' => hash('sha256', 'https://example.com/jobs/existing'),
            'source_name' => 'Example',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/websites', [
            'name' => 'New Site',
            'domain' => 'new-site.test',
        ])->assertCreated();
        $websiteId = $response->json('data.id');

        $this->assertDatabaseHas('website_jobs', [
            'website_id' => $websiteId,
            'job_id' => $job->id,
            'status' => 'unused',
        ]);
    }

    public function test_admin_can_register_and_remove_a_website_alias_without_changing_the_primary_domain(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $website = Website::query()->where('domain', 'lowonganku.com')->firstOrFail();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/websites/'.$website->id.'/domains', ['host' => 'staging.lowonganku.test'])
            ->assertCreated()
            ->assertJsonPath('data.domain', 'lowonganku.com')
            ->assertJsonFragment(['host' => 'staging.lowonganku.test']);

        $this->getJson('/api/site-config', ['X-Website-Domain' => 'staging.lowonganku.test'])
            ->assertOk()
            ->assertJsonPath('data.website.domain', 'lowonganku.com');
        $this->getJson('/api/site-config', ['X-Website-Domain' => 'www.staging.lowonganku.test'])
            ->assertOk()
            ->assertJsonPath('data.website.domain', 'lowonganku.com');

        $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/admin/websites/'.$website->id.'/domains/staging.lowonganku.test')
            ->assertOk()
            ->assertJsonPath('data.domain', 'lowonganku.com');

        $this->getJson('/api/site-config', ['X-Website-Domain' => 'staging.lowonganku.test'])
            ->assertNotFound();
        $this->getJson('/api/site-config', ['X-Website-Domain' => 'www.staging.lowonganku.test'])
            ->assertNotFound();
    }
}
