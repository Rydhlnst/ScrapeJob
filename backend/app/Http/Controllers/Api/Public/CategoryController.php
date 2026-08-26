<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\WebsiteContext;
use App\Support\ApiResponse;

class CategoryController extends Controller
{
    public function index(WebsiteContext $websiteContext)
    {
        $website = $websiteContext->resolve(request());
        $categories = Category::query()
            ->where('website_id', $website->id)
            ->withCount(['jobs' => fn ($query) => $query->whereIn('status', ['draft', 'published'])->whereHas('websiteJobs', fn ($q) => $q->where('website_id', $website->id)->where('status', 'published'))])
            ->orderBy('name')
            ->get();

        return ApiResponse::success(CategoryResource::collection($categories), 'Categories retrieved successfully');
    }
}
