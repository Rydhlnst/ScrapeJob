<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\ApiResponse;

class PageController extends Controller
{
    public function show(string $slug)
    {
        $page = Page::query()
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
