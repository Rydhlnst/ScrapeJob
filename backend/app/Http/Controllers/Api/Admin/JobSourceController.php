<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreJobSourceRequest;
use App\Http\Requests\Admin\UpdateJobSourceRequest;
use App\Http\Resources\JobSourceResource;
use App\Models\JobSource;
use App\Support\ApiResponse;

class JobSourceController extends Controller
{
    public function index()
    {
        $sources = JobSource::query()->latest()->paginate(15);

        return ApiResponse::paginated($sources, JobSourceResource::collection($sources)->resolve(), 'Job sources retrieved successfully');
    }

    public function store(StoreJobSourceRequest $request)
    {
        $source = JobSource::query()->create([
            ...$request->validated(),
            'scraping_allowed' => (bool) $request->input('scraping_allowed', false),
            'is_active' => (bool) $request->input('is_active', true),
        ]);

        return ApiResponse::success(new JobSourceResource($source), 'Job source created successfully', 201);
    }

    public function show(JobSource $jobSource)
    {
        return ApiResponse::success(new JobSourceResource($jobSource), 'Job source retrieved successfully');
    }

    public function update(UpdateJobSourceRequest $request, JobSource $jobSource)
    {
        $jobSource->update($request->validated());

        return ApiResponse::success(new JobSourceResource($jobSource->refresh()), 'Job source updated successfully');
    }

    public function destroy(JobSource $jobSource)
    {
        $jobSource->delete();

        return ApiResponse::success(null, 'Job source deleted successfully');
    }
}
