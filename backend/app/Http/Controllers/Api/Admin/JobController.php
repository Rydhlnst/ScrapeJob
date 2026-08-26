<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreJobRequest;
use App\Http\Requests\Admin\UpdateJobRequest;
use App\Http\Resources\JobResource;
use App\Models\Job;
use App\Models\WebsiteJob;
use App\Services\WebsiteContext;
use App\Services\Jobs\JobDeduplicationService;
use App\Services\Jobs\JobHashService;
use App\Services\Jobs\JobNormalizationService;
use App\Services\Jobs\JobPublishingService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use InvalidArgumentException;

class JobController extends Controller
{
    public function __construct(
        private readonly JobHashService $jobHashService,
        private readonly JobNormalizationService $normalizationService,
        private readonly JobPublishingService $publishingService,
        private readonly JobDeduplicationService $deduplicationService,
        private readonly WebsiteContext $websiteContext,
    ) {}

    public function index(Request $request)
    {
        $website = $this->websiteContext->resolve($request);
        $perPage = min(max((int) $request->query('perPage', 15), 1), 100);

        $jobs = Job::query()
            ->select([
                'id',
                'external_id',
                'fingerprint',
                'source',
                'title',
                'slug',
                'company_name',
                'company_meta',
                'location',
                'location_city',
                'location_province',
                'location_country',
                'remote_type',
                'category_id',
                'job_type',
                'salary_text',
                'salary_min',
                'salary_max',
                'salary_currency',
                'salary_period',
                'salary_is_disclosed',
                'experience_level',
                'experience_years_min',
                'experience_years_max',
                'education_level',
                'description',
                'raw_description',
                'requirements',
                'responsibilities',
                'skills',
                'benefits',
                'apply_url',
                'source_url',
                'source_url_hash',
                'source_name',
                'content_hash',
                'status',
                'scraped_at',
                'published_at',
                'posted_at',
                'expires_at',
                'is_active',
                'notified',
                'tags',
                'unified_payload',
                'created_at',
                'updated_at',
            ])
            ->with('category')
            ->where(function ($query) use ($website) {
                $query->whereHas('websiteJobs', fn ($relation) => $relation->where('website_id', $website->id));
                if ($website->domain === 'lowonganku.com') {
                    $query->orWhereDoesntHave('websiteJobs');
                }
            })
            ->when($request->filled('keyword'), function ($query) use ($request) {
                $keyword = mb_strtolower(trim($request->string('keyword')->value()));
                $like = '%'.$keyword.'%';

                $query->where(function ($sub) use ($like) {
                    $sub->whereRaw('lower(title) LIKE ?', [$like])
                        ->orWhereRaw('lower(company_name) LIKE ?', [$like])
                        ->orWhereRaw('lower(location) LIKE ?', [$like])
                        ->orWhereRaw('lower(description) LIKE ?', [$like]);
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('location'), fn ($query) => $query->where('location', 'like', '%'.$request->string('location').'%'))
            ->when($request->filled('category'), function ($query) use ($request) {
                $category = $request->string('category')->value();
                $isUuid = Str::isUuid($category);

                $query->where(function ($sub) use ($category, $isUuid) {
                    if ($isUuid) {
                        $sub->where('category_id', $category);
                    }

                    $sub->orWhereHas('category', function ($categoryQuery) use ($category, $isUuid) {
                        if ($isUuid) {
                            $categoryQuery->where('id', $category);
                        }

                        $categoryQuery
                            ->orWhere('slug', $category)
                            ->orWhere('name', 'like', "%{$category}%");
                    });
                });
            })
            ->when($request->filled('jobType'), fn ($query) => $query->where('job_type', $request->string('jobType')))
            ->when($request->filled('source'), fn ($query) => $query->where('source_name', $request->string('source')))
            ->when($request->filled('sort'), function ($query) use ($request) {
                $sort = $request->string('sort')->value();
                if ($sort === 'oldest') {
                    $query->orderBy('created_at');

                    return;
                }

                $query->orderByDesc('created_at');
            }, fn ($query) => $query->orderByDesc('created_at'))
            ->paginate($perPage)
            ->withQueryString();

        return ApiResponse::paginated($jobs, JobResource::collection($jobs)->resolve(), 'Jobs retrieved successfully');
    }

    public function store(StoreJobRequest $request)
    {
        $payload = $request->validated();
        $payload['description'] = $this->normalizationService->sanitizeDescription($payload['description']);
        $payload['raw_description'] = isset($payload['raw_description']) ? $this->normalizationService->sanitizeDescription($payload['raw_description']) : null;

        $duplicate = $this->deduplicationService->detectDuplicate(
            $payload['source_url'],
            $payload['title'],
            $payload['company_name'],
            $payload['location'],
        );

        if ($duplicate) {
            $payload['status'] = 'duplicate';
        }

        $payload['content_hash'] = $this->jobHashService->makeContentHash($payload['title'], $payload['company_name'], $payload['location']);
        $payload['source_url_hash'] = $this->jobHashService->makeSourceUrlHash($payload['source_url']);
        $payload['status'] = $payload['status'] ?? 'draft';

        if ($payload['status'] === 'published') {
            $payload['published_at'] = Carbon::now();
        }

        $job = Job::query()->create($payload);

        return ApiResponse::success(new JobResource($job->load('category')), 'Job created successfully', 201);
    }

    public function show(Job $job)
    {
        return ApiResponse::success(new JobResource($job->load('category')), 'Job retrieved successfully');
    }

    public function update(UpdateJobRequest $request, Job $job)
    {
        $payload = $request->validated();
        if (array_key_exists('description', $payload)) {
            $payload['description'] = $this->normalizationService->sanitizeDescription($payload['description']);
        }
        if (array_key_exists('raw_description', $payload)) {
            $payload['raw_description'] = $this->normalizationService->sanitizeDescription($payload['raw_description']);
        }

        $title = $payload['title'] ?? $job->title;
        $companyName = $payload['company_name'] ?? $job->company_name;
        $location = $payload['location'] ?? $job->location;

        if (isset($payload['title']) || isset($payload['company_name']) || isset($payload['location'])) {
            $payload['content_hash'] = $this->jobHashService->makeContentHash($title, $companyName, $location);
        }

        if (isset($payload['source_url'])) {
            $payload['source_url_hash'] = $this->jobHashService->makeSourceUrlHash($payload['source_url']);
        }

        $job->update($payload);

        return ApiResponse::success(new JobResource($job->refresh()->load('category')), 'Job updated successfully');
    }

    public function destroy(Job $job)
    {
        $job->delete();

        return ApiResponse::success(null, 'Job deleted successfully');
    }

    public function publish(Job $job, Request $request)
    {
        try {
            $job = $this->publishingService->publish($job);
            $website = $this->websiteContext->resolve($request);
            WebsiteJob::query()->updateOrCreate(
                ['website_id' => $website->id, 'job_id' => $job->id],
                ['status' => 'published', 'published_at' => now(), 'expired_at' => null],
            );
        } catch (InvalidArgumentException $exception) {
            return ApiResponse::error($exception->getMessage(), 422);
        }

        return ApiResponse::success(new JobResource($job->load('category')), 'Job published successfully');
    }

    public function unpublish(Job $job, Request $request)
    {
        $job = $this->publishingService->unpublish($job);
        $website = $this->websiteContext->resolve($request);
        WebsiteJob::query()->updateOrCreate(
            ['website_id' => $website->id, 'job_id' => $job->id],
            ['status' => 'draft', 'published_at' => null],
        );
        if ($job->websiteJobs()->where('status', 'published')->exists()) {
            $job->update(['status' => 'published', 'published_at' => now()]);
        }

        return ApiResponse::success(new JobResource($job->load('category')), 'Job unpublished successfully');
    }

    public function reject(Job $job)
    {
        $job->update(['status' => 'rejected']);

        return ApiResponse::success(new JobResource($job->refresh()->load('category')), 'Job rejected successfully');
    }

    public function markDuplicate(Job $job)
    {
        $job->update(['status' => 'duplicate']);

        return ApiResponse::success(new JobResource($job->refresh()->load('category')), 'Job marked as duplicate successfully');
    }

    public function restoreDraft(Job $job)
    {
        $job->update(['status' => 'draft', 'published_at' => null]);

        return ApiResponse::success(new JobResource($job->refresh()->load('category')), 'Job restored to draft successfully');
    }
}
