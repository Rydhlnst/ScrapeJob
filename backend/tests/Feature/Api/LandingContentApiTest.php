<?php

namespace Tests\Feature\Api;

use App\Models\Job;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingContentApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_admin_can_save_draft_and_publish_landing_content(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $draftPayload = [
            'hero' => [
                'title' => 'Find jobs faster',
                'description' => 'Review curated openings without leaving the homepage.',
                'primaryCta' => ['label' => 'Browse jobs', 'href' => '/jobs'],
                'secondaryCta' => ['label' => 'Review content', 'href' => '/admin/content'],
                'quickLinks' => [
                    ['label' => 'Remote', 'href' => '/jobs?location=Remote'],
                ],
            ],
            'featuredJobs' => [
                'title' => 'Fresh listings',
                'description' => 'Latest published jobs.',
                'emptyState' => 'No jobs yet.',
                'rules' => [
                    'sort' => 'newest',
                    'limit' => 6,
                    'category' => null,
                    'source' => null,
                ],
            ],
            'benefits' => [
                'title' => 'Why browse here first',
                'items' => [
                    ['title' => 'Faster scan', 'description' => 'See the important details first.'],
                ],
            ],
            'trustedCompanies' => [
                'title' => 'Trusted by job seekers',
                'items' => [
                    ['id' => 'spotify', 'name' => 'Spotify', 'url' => 'https://spotify.com/careers', 'brandColor' => '#1DB954'],
                ],
            ],
            'cta' => [
                'title' => 'Find work in one place',
                'body' => 'Search, compare, and continue to the official source.',
                'primaryButton' => ['label' => 'Find work', 'href' => '/jobs'],
                'secondaryButton' => ['label' => 'Contact', 'href' => '/#employers'],
            ],
        ];

        $saveResponse = $this->actingAs($admin, 'sanctum')
            ->putJson('/api/admin/landing-page-content', [
                'draftPayload' => $draftPayload,
            ]);

        $saveResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.hasDraft', true)
            ->assertJsonPath('data.publishedPayload', null)
            ->assertJsonPath('data.draftPayload.hero.title', 'Find jobs faster');

        $publicBeforePublish = $this->getJson('/api/landing-page-content');

        $publicBeforePublish->assertOk()
            ->assertJsonPath('data', null);

        $publishResponse = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/landing-page-content/publish');

        $publishResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.hasDraft', false)
            ->assertJsonPath('data.publishedPayload.hero.title', 'Find jobs faster');

        $publicAfterPublish = $this->getJson('/api/landing-page-content');

        $publicAfterPublish->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.hero.title', 'Find jobs faster')
            ->assertJsonMissingPath('data.draftPayload');
    }

    public function test_dashboard_summary_returns_priority_queues_and_landing_content_status(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        Job::query()->create([
            'title' => 'Raw Backend Engineer',
            'slug' => 'raw-backend-engineer',
            'company_name' => 'Acme',
            'location' => 'Jakarta',
            'description' => 'Raw job description',
            'source_url' => 'https://example.com/jobs/raw-backend-engineer',
            'source_url_hash' => hash('sha256', 'https://example.com/jobs/raw-backend-engineer'),
            'source_name' => 'Example',
            'status' => 'raw',
        ]);

        Job::query()->create([
            'title' => 'Draft Product Designer',
            'slug' => 'draft-product-designer',
            'company_name' => 'Acme',
            'location' => 'Remote',
            'description' => 'Draft job description',
            'source_url' => 'https://example.com/jobs/draft-product-designer',
            'source_url_hash' => hash('sha256', 'https://example.com/jobs/draft-product-designer'),
            'source_name' => 'Example',
            'status' => 'draft',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->putJson('/api/admin/landing-page-content', [
                'draftPayload' => [
                    'hero' => [
                        'title' => 'Draft hero',
                        'description' => 'Draft description',
                        'primaryCta' => ['label' => 'Browse jobs', 'href' => '/jobs'],
                        'secondaryCta' => ['label' => 'Review content', 'href' => '/admin/content'],
                        'quickLinks' => [],
                    ],
                    'featuredJobs' => [
                        'title' => 'Fresh listings',
                        'description' => 'Latest published jobs.',
                        'emptyState' => 'No jobs yet.',
                        'rules' => ['sort' => 'newest', 'limit' => 6, 'category' => null, 'source' => null],
                    ],
                    'benefits' => ['title' => 'Benefits', 'items' => []],
                    'trustedCompanies' => ['title' => 'Trusted', 'items' => []],
                    'cta' => [
                        'title' => 'CTA',
                        'body' => 'CTA body',
                        'primaryButton' => ['label' => 'Find work', 'href' => '/jobs'],
                        'secondaryButton' => ['label' => 'Contact', 'href' => '/#employers'],
                    ],
                ],
            ])
            ->assertOk();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.statusCounts.raw', 1)
            ->assertJsonPath('data.statusCounts.draft', 1)
            ->assertJsonPath('data.priorityQueues.needsReview.0.title', 'Raw Backend Engineer')
            ->assertJsonPath('data.priorityQueues.readyToPublish.0.title', 'Draft Product Designer')
            ->assertJsonPath('data.content.status', 'draft')
            ->assertJsonPath('data.content.hasDraft', true);
    }
}
