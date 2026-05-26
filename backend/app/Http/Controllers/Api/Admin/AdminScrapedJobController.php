<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobResource;
use App\Http\Resources\ScrapedJobResource;
use App\Models\Job;
use App\Models\ScrapedJob;
use App\Services\Jobs\JobHashService;
use App\Services\Jobs\JobNormalizationService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminScrapedJobController extends Controller
{
    public function __construct(
        private readonly JobHashService $jobHashService,
        private readonly JobNormalizationService $normalizationService,
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

        if (array_key_exists('description', $payload)) {
            $payload['description'] = $this->normalizationService->sanitizeDescription($payload['description']);
        }

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
        if (! in_array($scrapedJob->status, ['approved', 'pending'], true)) {
            return ApiResponse::error('Only pending or approved scraped jobs can be published.', 422);
        }

        $existing = Job::query()->where('source_url_hash', $this->jobHashService->makeSourceUrlHash($scrapedJob->source_url))->first();
        if ($existing) {
            $scrapedJob->update(['status' => 'duplicate']);

            return ApiResponse::error('Job already exists in published jobs.', 409);
        }

        $description = $this->normalizationService->sanitizeDescription($scrapedJob->description ?? '');

        $job = Job::query()->create([
            'scraped_job_id' => $scrapedJob->id,
            'external_id' => $scrapedJob->external_id,
            'fingerprint' => Job::makeFingerprint(
                source: $scrapedJob->source,
                title: $scrapedJob->title,
                company: $scrapedJob->company,
                location: $scrapedJob->location,
            ),
            'source' => $scrapedJob->source,
            'title' => $scrapedJob->title,
            'company_name' => $scrapedJob->company,
            'location' => $scrapedJob->location ?? 'Unknown',
            'job_type' => $scrapedJob->employment_type,
            'salary_text' => $scrapedJob->salary,
            'description' => $description,
            'raw_description' => $scrapedJob->description,
            'source_url' => $scrapedJob->source_url,
            'source_url_hash' => $this->jobHashService->makeSourceUrlHash($scrapedJob->source_url),
            'source_name' => $scrapedJob->source,
            'content_hash' => $this->jobHashService->makeContentHash(
                $scrapedJob->title,
                $scrapedJob->company,
                $scrapedJob->location ?? '',
            ),
            'status' => 'published',
            'is_active' => true,
            'scraped_at' => $scrapedJob->scraped_at ?? now(),
            'posted_at' => $scrapedJob->posted_date ? Carbon::parse($scrapedJob->posted_date) : null,
            'published_at' => now(),
            'apply_url' => $scrapedJob->source_url,
            'unified_payload' => [
                'source' => $scrapedJob->source,
                'raw' => $scrapedJob->raw_json,
            ],
        ]);

        $scrapedJob->update(['status' => 'published']);

        return ApiResponse::success(new JobResource($job->refresh()), 'Scraped job published successfully');
    }
}
