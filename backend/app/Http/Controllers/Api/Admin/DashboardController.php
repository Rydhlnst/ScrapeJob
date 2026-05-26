<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Job;
use App\Models\JobSource;
use App\Support\ApiResponse;

class DashboardController extends Controller
{
    public function index()
    {
        return ApiResponse::success([
            'totalJobs' => Job::query()->count(),
            'rawJobs' => Job::query()->where('status', 'raw')->count(),
            'draftJobs' => Job::query()->where('status', 'draft')->count(),
            'publishedJobs' => Job::query()->where('status', 'published')->count(),
            'rejectedJobs' => Job::query()->where('status', 'rejected')->count(),
            'duplicateJobs' => Job::query()->where('status', 'duplicate')->count(),
            'totalCategories' => Category::query()->count(),
            'totalSources' => JobSource::query()->count(),
        ], 'Dashboard retrieved successfully');
    }
}
