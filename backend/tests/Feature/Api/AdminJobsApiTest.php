<?php

namespace Tests\Feature\Api;

use App\Models\Job;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminJobsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_err_ac07_admin_jobs_requires_authentication(): void
    {
        $response = $this->getJson('/api/admin/jobs');

        $response->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_err_ac08_admin_jobs_requires_view_jobs_permission(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/admin/jobs');

        $response->assertStatus(403);
    }

    public function test_ok_ac09_admin_can_publish_and_unpublish_job(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $job = Job::query()->create([
            'title' => 'Backend Engineer',
            'slug' => 'backend-engineer',
            'company_name' => 'Acme',
            'location' => 'Jakarta',
            'description' => 'Job description',
            'source_url' => 'https://example.com/jobs/backend',
            'source_url_hash' => hash('sha256', 'https://example.com/jobs/backend'),
            'source_name' => 'Example',
            'status' => 'draft',
        ]);

        $publishResponse = $this->actingAs($admin, 'sanctum')
            ->patchJson('/api/admin/jobs/'.$job->id.'/publish');
        $publishResponse->assertOk()
            ->assertJsonPath('data.status', 'published');

        $this->assertDatabaseHas('jobs', [
            'id' => $job->id,
            'status' => 'published',
        ]);

        $unpublishResponse = $this->actingAs($admin, 'sanctum')
            ->patchJson('/api/admin/jobs/'.$job->id.'/unpublish');
        $unpublishResponse->assertOk()
            ->assertJsonPath('data.status', 'draft');

        $this->assertDatabaseHas('jobs', [
            'id' => $job->id,
            'status' => 'draft',
            'published_at' => null,
        ]);
    }
}
