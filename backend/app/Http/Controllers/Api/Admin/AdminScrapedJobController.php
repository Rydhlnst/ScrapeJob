<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobResource;
use App\Http\Resources\ScrapedJobResource;
use App\Models\ScrapedJob;
use App\Jobs\CleanScrapedJobWithAI;
use App\Services\Jobs\ScrapedJobPublishingService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class AdminScrapedJobController extends Controller
{
    public function __construct(
        private readonly ScrapedJobPublishingService $publishingService,
    ) {}

    public function index(Request $request)
    {
        $perPage = min(max((int) $request->query('perPage', 15), 1), 100);

        $rows = ScrapedJob::query()
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
        return ApiResponse::success(new ScrapedJobResource($scrapedJob), 'Scraped job retrieved successfully');
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

        $scrapedJob->update($payload);

        return ApiResponse::success(new ScrapedJobResource($scrapedJob->refresh()), 'Scraped job updated successfully');
    }

    public function approve(ScrapedJob $scrapedJob)
    {
        $scrapedJob->update(['status' => 'approved']);

        return ApiResponse::success(new ScrapedJobResource($scrapedJob->refresh()), 'Scraped job approved successfully');
    }

    public function reject(ScrapedJob $scrapedJob)
    {
        $scrapedJob->update(['status' => 'rejected']);

        return ApiResponse::success(new ScrapedJobResource($scrapedJob->refresh()), 'Scraped job rejected successfully');
    }

    public function publish(ScrapedJob $scrapedJob)
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

        return ApiResponse::success(new JobResource($job?->refresh()), 'Scraped job published successfully');
    }

    public function cleanAi(ScrapedJob $scrapedJob)
    {
        try {
            CleanScrapedJobWithAI::dispatchSync($scrapedJob);
            $scrapedJob->refresh();

            if ($scrapedJob->draft_status !== 'drafted_ai' && $scrapedJob->fail_reason) {
                return ApiResponse::error($scrapedJob->fail_reason, 422);
            }

            return ApiResponse::success(new ScrapedJobResource($scrapedJob), 'Scraped job processed with AI successfully');
        } catch (\Throwable $e) {
            return ApiResponse::error($e->getMessage(), 500);
        }
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

        foreach ($jobs as $job) {
            CleanScrapedJobWithAI::dispatch($job);
        }

        return ApiResponse::success(null, 'Bulk AI cleanup jobs dispatched successfully');
    }

    public function bulkApprove(Request $request)
    {
        $payload = $request->validate([
            'ids' => ['required', 'array', 'max:100'],
            'ids.*' => ['required', 'string', 'uuid'],
        ]);

        ScrapedJob::query()
            ->whereIn('id', $payload['ids'])
            ->where('status', 'pending')
            ->update(['status' => 'approved']);

        return ApiResponse::success(null, 'Bulk approval successful');
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

        foreach ($jobs as $scrapedJob) {
            $result = $this->publishingService->publish($scrapedJob);
            if ($result === 'duplicate') {
                $duplicateCount++;
            } else {
                $successCount++;
            }
        }

        return ApiResponse::success([
            'success_count' => $successCount,
            'duplicate_count' => $duplicateCount,
        ], 'Bulk publishing completed');
    }
}
