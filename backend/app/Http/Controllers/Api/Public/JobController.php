<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobResource;
use App\Models\Job;
use App\Support\ApiResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class JobController extends Controller
{
    private function applyOrdering(Builder $query, Request $request): void
    {
        $sort = $request->string('sort')->value();

        if ($sort === 'oldest') {
            $query->orderBy('published_at')->orderBy('created_at');

            return;
        }

        if ($sort === 'company') {
            $query
                ->orderBy('company_name')
                ->orderByDesc('published_at')
                ->orderByDesc('created_at');

            return;
        }

        if ($sort === 'relevance' && $request->filled('keyword')) {
            $keyword = mb_strtolower(trim($request->string('keyword')->value()));

            $query
                ->orderByRaw(
                    'CASE
                        WHEN lower(title) = ? THEN 0
                        WHEN lower(company_name) = ? THEN 1
                        WHEN lower(title) LIKE ? THEN 2
                        WHEN lower(company_name) LIKE ? THEN 3
                        WHEN lower(location) LIKE ? THEN 4
                        WHEN lower(description) LIKE ? THEN 5
                        ELSE 6
                    END',
                    [
                        $keyword,
                        $keyword,
                        $keyword.'%',
                        $keyword.'%',
                        $keyword.'%',
                        '%'.$keyword.'%',
                    ]
                )
                ->orderByDesc('published_at')
                ->orderByDesc('created_at');

            return;
        }

        $query->orderByDesc('published_at')->orderByDesc('created_at');
    }

    public function index(Request $request)
    {
        $perPage = min(max((int) ($request->query('limit', $request->query('perPage', 15))), 1), 100);

        $jobs = Job::query()
            ->select([
                'id',
                'title',
                'slug',
                'company_name',
                'location',
                'category_id',
                'job_type',
                'remote_type',
                'salary_text',
                'description',
                'source_url',
                'source_name',
                'published_at',
                'created_at',
            ])
            ->with('category')
            ->where('status', 'published')
            ->where('is_active', true)
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
            ->when($request->filled('location'), function ($query) use ($request) {
                $location = mb_strtolower(trim($request->string('location')->value()));
                $query->whereRaw('lower(location) LIKE ?', ['%'.$location.'%']);
            })
            ->when($request->filled('category'), function ($query) use ($request) {
                $category = $request->string('category')->value();
                $isUuid = Str::isUuid($category);

                $query->where(function (Builder $sub) use ($category, $isUuid): void {
                    if ($isUuid) {
                        $sub->where('category_id', $category);
                    }

                    $sub->orWhereHas('category', function (Builder $categoryQuery) use ($category, $isUuid): void {
                        if ($isUuid) {
                            $categoryQuery->where('id', $category);
                        }

                        $categoryQuery
                            ->orWhere('slug', $category)
                            ->orWhere('name', 'like', "%{$category}%");
                    });
                });
            })
            ->when($request->filled('job_type') || $request->filled('jobType'), function ($query) use ($request) {
                $jobType = $request->string('job_type')->value() ?: $request->string('jobType')->value();
                $query->where('job_type', $jobType);
            })
            ->when($request->filled('work_arrangement'), fn ($query) => $query->where('remote_type', $request->string('work_arrangement')))
            ->when($request->filled('source'), fn ($query) => $query->where('source_name', $request->string('source')))
            ->tap(fn ($query) => $this->applyOrdering($query, $request))
            ->paginate($perPage)
            ->withQueryString();

        return ApiResponse::paginated($jobs, JobResource::collection($jobs)->resolve(), 'Jobs retrieved successfully');
    }

    public function show(string $identifier)
    {
        $job = Job::query()
            ->select([
                'id',
                'title',
                'slug',
                'company_name',
                'location',
                'category_id',
                'job_type',
                'salary_text',
                'description',
                'source_url',
                'source_name',
                'published_at',
                'created_at',
            ])
            ->with('category')
            ->where('status', 'published')
            ->where('is_active', true)
            ->where(function (Builder $query) use ($identifier): void {
                $query->where('slug', $identifier);

                if (Str::isUuid($identifier)) {
                    $query->orWhere('id', $identifier);
                }
            })
            ->firstOrFail();

        return ApiResponse::success(new JobResource($job), 'Job retrieved successfully');
    }

    public function stats()
    {
        $base = Job::query()->where('status', 'published')->where('is_active', true);

        $totalBySource = (clone $base)
            ->selectRaw('source_name, COUNT(*) as total')
            ->groupBy('source_name')
            ->pluck('total', 'source_name');

        return ApiResponse::success([
            'totalActive' => (clone $base)->count(),
            'totalBySource' => $totalBySource,
            'newToday' => (clone $base)->whereDate('created_at', today())->count(),
            'remoteJobs' => (clone $base)->whereIn('job_type', ['remote', 'hybrid'])->count(),
        ], 'Job stats retrieved successfully');
    }
}
