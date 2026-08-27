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
            ->withCount(['jobs' => function ($query) use ($website): void {
                $query
                    ->whereIn('status', ['draft', 'published'])
                    ->whereHas('websiteJobs', fn ($q) => $q->where('website_id', $website->id)->where('status', 'published'))
                    ->where(function ($categoryQuery) use ($website): void {
                        $categoryQuery
                            ->whereColumn('jobs.category_id', 'categories.id')
                            ->orWhereHas('websiteJobs.content', fn ($contentQuery) => $contentQuery
                                ->where('website_id', $website->id)
                                ->whereColumn('category_id', 'categories.id'));
                    });
            }])
            ->orderBy('name')
            ->get();

        return ApiResponse::success(CategoryResource::collection($categories), 'Categories retrieved successfully');
    }
}
