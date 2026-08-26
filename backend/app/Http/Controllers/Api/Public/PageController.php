<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\ApiResponse;
use App\Services\WebsiteContext;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function index(Request $request, WebsiteContext $websiteContext)
    {
        $website = $websiteContext->resolve($request);
        $perPage = (int) $request->integer('per_page', 12);
        $perPage = max(1, min($perPage, 50));

        $pages = Page::query()
            ->where('website_id', $website->id)
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->orderByDesc('updated_at')
            ->paginate($perPage);

        $data = $pages->getCollection()->map(fn (Page $page) => [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'summary' => $page->summary,
            'publishedAt' => optional($page->published_at)?->toIso8601String(),
            'updatedAt' => optional($page->updated_at)?->toIso8601String(),
        ]);

        return ApiResponse::success($data, 'Pages retrieved successfully', 200, [
            'currentPage' => $pages->currentPage(),
            'perPage' => $pages->perPage(),
            'total' => $pages->total(),
            'lastPage' => $pages->lastPage(),
        ]);
    }

    public function show(string $slug, Request $request, WebsiteContext $websiteContext)
    {
        $page = Page::query()
            ->where('website_id', $websiteContext->resolve($request)->id)
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return ApiResponse::success([
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'summary' => $page->summary,
            'content' => $page->content,
            'seoTitle' => $page->seo_title,
            'seoDescription' => $page->seo_description,
            'publishedAt' => optional($page->published_at)?->toIso8601String(),
            'updatedAt' => optional($page->updated_at)?->toIso8601String(),
        ], 'Page retrieved successfully');
    }
}
