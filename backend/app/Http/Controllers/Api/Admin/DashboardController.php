<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Job;
use App\Models\JobSource;
use App\Models\LandingPageContent;
use App\Services\WebsiteContext;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request, WebsiteContext $websiteContext)
    {
        $website = $websiteContext->resolve($request);
        $content = LandingPageContent::query()
            ->where('website_id', $website->id)
            ->where('key', 'landing_page')
            ->first();
        $websiteJobs = Job::query()->whereHas('websiteJobs', fn ($query) => $query
            ->where('website_id', $website->id));

        return ApiResponse::success([
            'statusCounts' => [
                'total' => Job::query()->count(),
                'raw' => Job::query()->where('status', 'raw')->count(),
                'draft' => Job::query()->where('status', 'draft')->count(),
                'published' => Job::query()->where('status', 'published')->count(),
                'attention' => Job::query()->whereIn('status', ['rejected', 'duplicate'])->count(),
                'rejected' => Job::query()->where('status', 'rejected')->count(),
                'duplicate' => Job::query()->where('status', 'duplicate')->count(),
            ],
            'website' => [
                'id' => $website->id,
                'name' => $website->name,
                'domain' => $website->domain,
            ],
            'websiteStatusCounts' => [
                'total' => (clone $websiteJobs)->count(),
                'unused' => (clone $websiteJobs)->whereRelation('websiteJobs', 'status', 'unused')->count(),
                'draft' => (clone $websiteJobs)->whereRelation('websiteJobs', 'status', 'draft')->count(),
                'published' => (clone $websiteJobs)->whereRelation('websiteJobs', 'status', 'published')->count(),
                'expired' => (clone $websiteJobs)->whereRelation('websiteJobs', 'status', 'expired')->count(),
            ],
            'catalog' => [
                'totalCategories' => Category::query()->where('website_id', $website->id)->count(),
                'totalSources' => JobSource::query()->count(),
            ],
            'priorityQueues' => [
                'needsReview' => Job::query()
                    ->select(['id', 'title', 'company_name', 'status', 'updated_at'])
                    ->where('status', 'raw')
                    ->latest('updated_at')
                    ->limit(5)
                    ->get()
                    ->map(fn (Job $job) => [
                        'id' => $job->id,
                        'title' => $job->title,
                        'companyName' => $job->company_name,
                        'status' => $job->status,
                        'updatedAt' => optional($job->updated_at)?->toIso8601String(),
                        'href' => "/admin/raw-data?job={$job->id}",
                    ])
                    ->values(),
                'readyToPublish' => Job::query()
                    ->select(['id', 'title', 'company_name', 'status', 'updated_at'])
                    ->where('status', 'draft')
                    ->latest('updated_at')
                    ->limit(5)
                    ->get()
                    ->map(fn (Job $job) => [
                        'id' => $job->id,
                        'title' => $job->title,
                        'companyName' => $job->company_name,
                        'status' => $job->status,
                        'updatedAt' => optional($job->updated_at)?->toIso8601String(),
                        'href' => "/admin/jobs/{$job->id}/edit",
                    ])
                    ->values(),
                'landingContentDrafts' => $content && $content->hasDraft()
                    ? [[
                        'id' => $content->id,
                        'title' => 'Landing page content',
                        'companyName' => null,
                        'status' => 'draft',
                        'updatedAt' => optional($content->updated_at)?->toIso8601String(),
                        'href' => '/admin/content',
                    ]]
                    : [],
            ],
            'content' => [
                'status' => $content?->hasDraft() ? 'draft' : ($content?->published_payload ? 'published' : 'empty'),
                'hasDraft' => $content?->hasDraft() ?? false,
                'updatedAt' => optional($content?->updated_at)?->toIso8601String(),
                'publishedAt' => optional($content?->published_at)?->toIso8601String(),
            ],
            'recentActivity' => collect([
                ...Job::query()
                    ->select(['id', 'title', 'company_name', 'status', 'updated_at'])
                    ->latest('updated_at')
                    ->limit(5)
                    ->get()
                    ->map(fn (Job $job) => [
                        'id' => $job->id,
                        'kind' => 'job',
                        'title' => $job->title,
                        'description' => $job->company_name,
                        'status' => $job->status,
                        'updatedAt' => optional($job->updated_at)?->toIso8601String(),
                        'href' => "/admin/jobs/{$job->id}/edit",
                    ])
                    ->all(),
                ...($content
                    ? [[
                        'id' => $content->id,
                        'kind' => 'content',
                        'title' => 'Landing page content updated',
                        'description' => $content->hasDraft() ? 'Draft changes waiting to be published.' : 'Published content is live.',
                        'status' => $content->hasDraft() ? 'draft' : 'published',
                        'updatedAt' => optional($content->updated_at)?->toIso8601String(),
                        'href' => '/admin/content',
                    ]]
                    : []),
            ])->sortByDesc('updatedAt')->values(),
        ], 'Dashboard retrieved successfully');
    }
}
