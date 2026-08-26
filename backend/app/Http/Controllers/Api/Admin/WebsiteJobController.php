<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ScrapedJobResource;
use App\Http\Resources\WebsiteJobResource;
use App\Models\Job;
use App\Models\ScrapedJob;
use App\Models\Website;
use App\Models\WebsiteJob;
use App\Services\Jobs\ScrapedJobPublishingService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class WebsiteJobController extends Controller
{
    public function __construct(private readonly ScrapedJobPublishingService $publishingService) {}

    public function assignments(ScrapedJob $scrapedJob)
    {
        $job = Job::query()->where('scraped_job_id', $scrapedJob->id)->first();
        $assignments = $job
            ? WebsiteJob::query()->with('website')->where('job_id', $job->id)->get()
            : collect();

        return ApiResponse::success([
            'scrapedJob' => new ScrapedJobResource($scrapedJob),
            'assignments' => WebsiteJobResource::collection($assignments)->resolve(),
        ], 'Website assignments retrieved successfully');
    }

    public function sync(Request $request, ScrapedJob $scrapedJob)
    {
        $payload = $request->validate([
            'assignments' => ['required', 'array', 'max:50'],
            'assignments.*.website_id' => ['required', 'uuid', 'exists:websites,id'],
            'assignments.*.status' => ['required', 'in:unused,draft,published,expired,nonaktif'],
        ]);

        $result = $this->publishingService->moveToDraft($scrapedJob->refresh());
        if (! $result['job']) {
            return ApiResponse::error('This scraped job is already a duplicate.', 409);
        }

        $job = $result['job']->refresh();
        $activeWebsiteIds = Website::query()->where('is_active', true)->pluck('id');
        $requestedWebsiteIds = collect($payload['assignments'])->pluck('website_id')->unique();
        if ($requestedWebsiteIds->diff($activeWebsiteIds)->isNotEmpty()) {
            return ApiResponse::error('Inactive websites cannot receive job assignments.', 422);
        }

        DB::transaction(function () use ($payload, $job, $activeWebsiteIds): void {
            foreach ($activeWebsiteIds as $websiteId) {
                WebsiteJob::query()->firstOrCreate(
                    ['website_id' => $websiteId, 'job_id' => $job->id],
                    ['status' => 'unused'],
                );
            }

            foreach ($payload['assignments'] as $assignment) {
                $status = $assignment['status'];
                WebsiteJob::query()->updateOrCreate(
                    ['website_id' => $assignment['website_id'], 'job_id' => $job->id],
                    [
                        'status' => $status,
                        'published_at' => $status === 'published' ? now() : null,
                        'expired_at' => $status === 'expired' ? now() : null,
                    ],
                );
            }

            $this->syncMasterStatus($job);
        });

        return ApiResponse::success([
            'job' => $job->refresh()->load('category'),
            'assignments' => WebsiteJobResource::collection(
                WebsiteJob::query()->with('website')->where('job_id', $job->id)->get(),
            )->resolve(),
        ], 'Website assignments saved successfully');
    }

    public function updateStatus(Request $request, WebsiteJob $websiteJob)
    {
        $payload = $request->validate(['status' => ['required', 'in:unused,draft,published,expired,nonaktif']]);
        $status = $payload['status'];
        $websiteJob->update([
            'status' => $status,
            'published_at' => $status === 'published' ? now() : null,
            'expired_at' => $status === 'expired' ? now() : null,
        ]);
        $this->syncMasterStatus($websiteJob->job);

        return ApiResponse::success(new WebsiteJobResource($websiteJob->refresh()->load(['website', 'job'])), 'Website job status updated successfully');
    }

    private function syncMasterStatus(Job $job): void
    {
        $published = $job->websiteJobs()->where('status', 'published')->exists();
        if ($published) {
            $job->update(['status' => 'published', 'published_at' => $job->published_at ?? now()]);
        } elseif (! in_array($job->status, ['rejected', 'duplicate'], true)) {
            $job->update(['status' => 'draft', 'published_at' => null]);
        }
    }
}
