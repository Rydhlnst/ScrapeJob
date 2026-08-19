<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCategoriesApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_categories_require_authentication(): void
    {
        $this->getJson('/api/admin/categories')->assertUnauthorized();
    }

    public function test_admin_can_create_read_update_and_delete_category(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $create = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/categories', [
            'name' => 'Product Design',
            'description' => 'Design and research roles.',
        ]);

        $create->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Product Design')
            ->assertJsonPath('data.slug', 'product-design');

        $categoryId = $create->json('data.id');

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/categories/'.$categoryId)
            ->assertOk()
            ->assertJsonPath('data.id', $categoryId)
            ->assertJsonPath('data.description', 'Design and research roles.');

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/categories')
            ->assertOk()
            ->assertJsonPath('data.0.id', $categoryId);

        $this->actingAs($admin, 'sanctum')
            ->putJson('/api/admin/categories/'.$categoryId, [
                'name' => 'Product Engineering',
                'description' => 'Updated description.',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Product Engineering')
            ->assertJsonPath('data.slug', 'product-engineering')
            ->assertJsonPath('data.description', 'Updated description.');

        $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/admin/categories/'.$categoryId)
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('categories', ['id' => $categoryId]);
    }
}
