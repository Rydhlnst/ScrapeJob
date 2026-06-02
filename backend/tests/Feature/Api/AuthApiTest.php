<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_ok_ac01_admin_login_returns_bearer_token_and_user_payload(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);
        $user->assignRole('admin');

        $response = $this->postJson('/api/auth/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.tokenType', 'Bearer')
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['accessToken', 'tokenType', 'user' => ['id', 'name', 'email', 'roles', 'permissions']],
            ]);
    }

    public function test_err_ac02_admin_login_rejects_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);
        $user->assignRole('admin');

        $response = $this->postJson('/api/auth/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_err_ac03_admin_login_rejects_non_admin_account(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/auth/admin/login', [
            'email' => 'user@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_ok_ac04_user_login_accepts_regular_account(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/auth/user/login', [
            'email' => 'user@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.tokenType', 'Bearer');
    }

    public function test_err_ac05_user_login_rejects_admin_account(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);
        $admin->assignRole('admin');

        $response = $this->postJson('/api/auth/user/login', [
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_ok_ac06_user_register_creates_new_account_with_token(): void
    {
        $response = $this->postJson('/api/auth/user/register', [
            'name' => 'Regular User',
            'email' => 'regular@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'regular@example.com');

        $this->assertDatabaseHas('users', [
            'email' => 'regular@example.com',
        ]);
    }

    public function test_ok_ac07_admin_register_creates_admin_account_with_token(): void
    {
        $response = $this->postJson('/api/auth/admin/register', [
            'name' => 'Admin User',
            'email' => 'new-admin@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'new-admin@example.com');

        $user = User::query()->where('email', 'new-admin@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('admin'));
    }

    public function test_err_ac08_register_validates_required_fields(): void
    {
        $response = $this->postJson('/api/auth/user/register', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => 'short',
            'password_confirmation' => 'not-match',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_ok_ac09_me_returns_authenticated_user(): void
    {
        $user = User::factory()->create();
        $user->assignRole('editor');

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/auth/me');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_ok_ac10_logout_revokes_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;
        $tokenId = explode('|', $token)[0];

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/auth/logout');

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing((new PersonalAccessToken())->getTable(), [
            'id' => $tokenId,
        ]);
    }
}

