<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminMasterDataApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_admin_can_create_read_update_and_delete_job_source(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $create = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/job-sources', [
            'name' => 'Example Jobs',
            'base_url' => 'https://example.com',
            'listing_url' => 'https://example.com/jobs',
            'is_active' => true,
            'scraping_allowed' => true,
            'notes' => 'Initial source.',
        ]);

        $create->assertCreated()
            ->assertJsonPath('data.name', 'Example Jobs')
            ->assertJsonPath('data.scrapingAllowed', true);

        $sourceId = $create->json('data.id');

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/job-sources/'.$sourceId)
            ->assertOk()
            ->assertJsonPath('data.baseUrl', 'https://example.com');

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/job-sources')
            ->assertOk()
            ->assertJsonPath('data.0.id', $sourceId);

        $this->actingAs($admin, 'sanctum')
            ->putJson('/api/admin/job-sources/'.$sourceId, [
                'name' => 'Updated Jobs',
                'scraping_allowed' => false,
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Jobs')
            ->assertJsonPath('data.scrapingAllowed', false);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/admin/job-sources/'.$sourceId)
            ->assertOk();

        $this->assertDatabaseMissing('job_sources', ['id' => $sourceId]);
    }

    public function test_admin_can_create_read_update_and_delete_location(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $create = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/locations', [
            'name' => 'South Jakarta',
            'province' => 'DKI Jakarta',
        ]);

        $create->assertCreated()
            ->assertJsonPath('data.name', 'South Jakarta')
            ->assertJsonPath('data.slug', 'south-jakarta');

        $locationId = $create->json('data.id');

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/locations/'.$locationId)
            ->assertOk()
            ->assertJsonPath('data.province', 'DKI Jakarta');

        $this->actingAs($admin, 'sanctum')
            ->putJson('/api/admin/locations/'.$locationId, [
                'name' => 'Central Jakarta',
                'province' => 'DKI Jakarta',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Central Jakarta')
            ->assertJsonPath('data.slug', 'south-jakarta');

        $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/admin/locations/'.$locationId)
            ->assertOk();

        $this->assertDatabaseMissing('locations', ['id' => $locationId]);
    }
}
