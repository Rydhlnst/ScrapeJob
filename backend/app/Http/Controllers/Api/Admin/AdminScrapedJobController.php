<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobResource;
use App\Http\Resources\ScrapedJobResource;
use App\Models\ScrapedJob;
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
            'title' => ['sometimes', 'required', 'string'],
            'company' => ['sometimes', 'required', 'string'],
            'location' => ['nullable', 'string'],
            'salary' => ['nullable', 'string'],
            'employment_type' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'description_summary' => ['nullable', 'string'],
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
}
