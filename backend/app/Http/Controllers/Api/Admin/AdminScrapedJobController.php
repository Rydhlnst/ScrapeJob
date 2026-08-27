<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobResource;
use App\Http\Resources\ScrapedJobResource;
use App\Models\Job;
use App\Models\ScrapedJob;
use App\Models\WebsiteJob;
use App\Services\WebsiteContext;
use App\Jobs\CleanScrapedJobWithAI;
use App\Services\Jobs\JobNormalizationService;
use App\Services\Jobs\ScrapedJobPublishingService;
use App\Support\ApiResponse;
use Illuminate\Bus\Batch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Throwable;

class AdminScrapedJobController extends Controller
{
    public function __construct(
        private readonly ScrapedJobPublishingService $publishingService,
        private readonly JobNormalizationService $normalizer,
        private readonly WebsiteContext $websiteContext,
    ) {}

    public function index(Request $request)
    {
        $perPage = min(max((int) $request->query('perPage', 15), 1), 100);

        $rows = ScrapedJob::query()
            ->with('job.websiteJobs.website')
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('source'), fn ($query) => $query->where('source', $request->string('source')))
            ->when($request->filled('keyword'), function ($query) use ($request) {
                $keyword = $request->string('keyword')->value();
                $query->where(function ($sub) use ($keyword) {
                    $sub->where('title', 'like', "%{$keyword}%")
                        ->orWhere('company', 'like', "%{$keyword}%")
                        ->orWhere('location', 'like', "%{$keyword}%");
                });
            })
            ->orderByDesc('scraped_at')
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return ApiResponse::paginated($rows, ScrapedJobResource::collection($rows)->resolve(), 'Scraped jobs retrieved successfully');
    }

    public function show(ScrapedJob $scrapedJob)
    {
        return ApiResponse::success(new ScrapedJobResource($scrapedJob->load('job.websiteJobs.website')), 'Scraped job retrieved successfully');
    }

    public function update(Request $request, ScrapedJob $scrapedJob)
    {
        $payload = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:500'],
            'company' => ['sometimes', 'required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:191'],
            'salary' => ['nullable', 'string', 'max:191'],
            'employment_type' => ['nullable', 'string', 'max:191'],
            'description' => ['nullable', 'string', 'max:65535'],
            'description_summary' => ['nullable', 'string', 'max:65535'],
            'posted_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:pending,approved,rejected,duplicate,published'],
        ]);

        if (array_key_exists('description', $payload) && $payload['description'] !== null) {
            $payload['description'] = $this->normalizer->sanitizeDescription($payload['description']);
        }

        $scrapedJob->update($payload);

        return ApiResponse::success(new ScrapedJobResource($scrapedJob->refresh()), 'Scraped job updated successfully');
    }

    public function approve(ScrapedJob $scrapedJob)
    {
        $result = $this->publishingService->moveToDraft($scrapedJob->refresh());
        if ($result['result'] === 'duplicate') {
            return ApiResponse::error('Job already exists in draft or published jobs.', 409);
        }

        return ApiResponse::success(new JobResource($result['job']->load('category')), 'Scraped job moved to draft successfully');
    }
    public function reject(ScrapedJob $scrapedJob)
    {
        $scrapedJob->update(['status' => 'rejected']);

        return ApiResponse::success(new ScrapedJobResource($scrapedJob->refresh()), 'Scraped job rejected successfully');
    }

    public function publish(ScrapedJob $scrapedJob, Request $request)
    {
        if ($scrapedJob->status !== 'approved') {
            return ApiResponse::error('Only approved scraped jobs can be published.', 422);
        }

        $result = $this->publishingService->publish($scrapedJob->refresh());
        if ($result === 'duplicate') {
            return ApiResponse::error('Job already exists in published jobs.', 409);
        }

        $job = $scrapedJob->refresh()->job ?? null;
        $job ??= \App\Models\Job::query()->where('scraped_job_id', $scrapedJob->id)->first();
        if ($job) {
            $website = $this->websiteContext->resolve($request);
            WebsiteJob::query()->updateOrCreate(
                ['website_id' => $website->id, 'job_id' => $job->id],
                ['status' => 'published', 'published_at' => now(), 'expired_at' => null],
            );
            $job->update(['status' => 'published', 'published_at' => now()]);
        }

        return ApiResponse::success(new JobResource($job?->refresh()), 'Scraped job published successfully');
    }

    public function cleanAi(ScrapedJob $scrapedJob)
    {
        // Queue the job so the operator UI does not block on the AI provider
        // round-trip (60s+). The client polls the row until draft_status
        // transitions to drafted_ai or a fail_reason is recorded.
        $scrapedJob->update([
            'fail_reason' => null,
        ]);

        try {
            CleanScrapedJobWithAI::dispatch($scrapedJob);
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage(), 500);
        }

        return ApiResponse::success(
            [
                'scraped_job_id' => $scrapedJob->id,
                'status' => 'queued',
            ],
            'AI cleanup job queued',
            202,
        );
    }

    public function bulkCleanAi(Request $request)
    {
        $payload = $request->validate([
            'ids' => ['required', 'array', 'max:100'],
            'ids.*' => ['required', 'string', 'uuid'],
        ]);

        $jobs = ScrapedJob::query()
            ->whereIn('id', $payload['ids'])
            ->where('draft_status', 'drafted_raw')
            ->get();

        if ($jobs->isEmpty()) {
            return ApiResponse::error('No eligible scraped jobs to clean.', 422);
        }

        $userId = optional($request->user())->getKey() ?? 'system';

        $batch = Bus::batch(
            $jobs->map(fn (ScrapedJob $job) => new CleanScrapedJobWithAI($job))->all(),
        )
            ->name("scraped-jobs:clean-ai:{$userId}")
            ->allowFailures()
            ->dispatch();

        return ApiResponse::success(
            [
                'batch_id' => $batch->id,
                'total' => $batch->totalJobs,
            ],
            'Bulk AI cleanup batch dispatched',
            202,
        );
    }

    public function bulkCleanAiStatus(string $batchId)
    {
        $batch = Bus::findBatch($batchId);
        if (! $batch instanceof Batch) {
            return ApiResponse::error('Batch not found', 404);
        }

        return ApiResponse::success([
            'batch_id' => $batch->id,
            'name' => $batch->name,
            'total' => $batch->totalJobs,
            'pending' => $batch->pendingJobs,
            'processed' => $batch->processedJobs(),
            'failed' => $batch->failedJobs,
            'progress' => $batch->progress(),
            'finished_at' => $batch->finishedAt?->toIso8601String(),
            'cancelled' => $batch->cancelled(),
        ], 'Batch status retrieved');
    }

    public function bulkApprove(Request $request)
    {
        $payload = $request->validate([
            'ids' => ['required', 'array', 'max:100'],
            'ids.*' => ['required', 'string', 'uuid'],
        ]);

        $jobs = ScrapedJob::query()
            ->whereIn('id', $payload['ids'])
            ->whereIn('status', ['pending', 'approved'])
            ->get();

        $successCount = 0;
        $duplicateCount = 0;

        foreach ($jobs as $scrapedJob) {
            $result = $this->publishingService->moveToDraft($scrapedJob);
            if ($result['result'] === 'duplicate') {
                $duplicateCount++;
            } else {
                $successCount++;
            }
        }

        return ApiResponse::success([
            'success_count' => $successCount,
            'duplicate_count' => $duplicateCount,
        ], 'Bulk move to draft completed');
    }
    public function bulkReject(Request $request)
    {
        $payload = $request->validate([
            'ids' => ['required', 'array', 'max:100'],
            'ids.*' => ['required', 'string', 'uuid'],
        ]);

        ScrapedJob::query()
            ->whereIn('id', $payload['ids'])
            ->whereIn('status', ['pending', 'approved'])
            ->update(['status' => 'rejected']);

        return ApiResponse::success(null, 'Bulk rejection successful');
    }

    public function bulkPublish(Request $request)
    {
        $payload = $request->validate([
            'ids' => ['required', 'array', 'max:100'],
            'ids.*' => ['required', 'string', 'uuid'],
        ]);

        $jobs = ScrapedJob::query()
            ->whereIn('id', $payload['ids'])
            ->where('status', 'approved')
            ->get();

        $successCount = 0;
        $duplicateCount = 0;
        $website = $this->websiteContext->resolve($request);

        foreach ($jobs as $scrapedJob) {
            $result = $this->publishingService->publish($scrapedJob);
            if ($result === 'duplicate') {
                $duplicateCount++;
            } else {
                $job = Job::query()->where('scraped_job_id', $scrapedJob->id)->first();
                if ($job) {
                    WebsiteJob::query()->updateOrCreate(
                        ['website_id' => $website->id, 'job_id' => $job->id],
                        ['status' => 'published', 'published_at' => now(), 'expired_at' => null],
                    );
                    $job->update(['status' => 'published', 'published_at' => now()]);
                }
                $successCount++;
            }
        }

        return ApiResponse::success([
            'success_count' => $successCount,
            'duplicate_count' => $duplicateCount,
        ], 'Bulk publishing completed');
    }
}
