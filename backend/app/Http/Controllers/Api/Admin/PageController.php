<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PageController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max((int) $request->query('perPage', 20), 1), 100);

        $pages = Page::query()
            ->when($request->filled('keyword'), function ($query) use ($request) {
                $keyword = $request->string('keyword')->value();

                $query->where(function ($sub) use ($keyword) {
                    $sub->where('title', 'like', "%{$keyword}%")
                        ->orWhere('slug', 'like', "%{$keyword}%")
                        ->orWhere('summary', 'like', "%{$keyword}%");
                });
            })
            ->orderByDesc('updated_at')
            ->paginate($perPage)
            ->withQueryString();

        return ApiResponse::paginated(
            $pages,
            collect($pages->items())->map(fn (Page $page) => $this->serialize($page))->all(),
            'Pages retrieved successfully'
        );
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', Rule::unique('pages', 'slug')],
            'status' => ['nullable', Rule::in(['draft', 'published'])],
            'summary' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string', 'max:200000'],
            'seoTitle' => ['nullable', 'string', 'max:255'],
            'seoDescription' => ['nullable', 'string', 'max:500'],
        ]);

        $page = Page::query()->create([
            'title' => $payload['title'],
            'slug' => $payload['slug'] ?: Str::slug($payload['title']),
            'status' => $payload['status'] ?? 'draft',
            'summary' => $payload['summary'] ?? null,
            'content' => $payload['content'] ?? null,
            'seo_title' => $payload['seoTitle'] ?? null,
            'seo_description' => $payload['seoDescription'] ?? null,
            'published_at' => ($payload['status'] ?? 'draft') === 'published' ? now() : null,
        ]);

        return ApiResponse::success($this->serialize($page), 'Page created successfully', 201);
    }

    public function show(Page $page)
    {
        return ApiResponse::success($this->serialize($page), 'Page retrieved successfully');
    }

    public function update(Request $request, Page $page)
    {
        $payload = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', 'alpha_dash', Rule::unique('pages', 'slug')->ignore($page->id)],
            'status' => ['sometimes', Rule::in(['draft', 'published'])],
            'summary' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string', 'max:200000'],
            'seoTitle' => ['nullable', 'string', 'max:255'],
            'seoDescription' => ['nullable', 'string', 'max:500'],
        ]);

        $nextStatus = $payload['status'] ?? $page->status;

        $page->update([
            'title' => $payload['title'] ?? $page->title,
            'slug' => $payload['slug'] ?? $page->slug,
            'status' => $nextStatus,
            'summary' => array_key_exists('summary', $payload) ? $payload['summary'] : $page->summary,
            'content' => array_key_exists('content', $payload) ? $payload['content'] : $page->content,
            'seo_title' => array_key_exists('seoTitle', $payload) ? $payload['seoTitle'] : $page->seo_title,
            'seo_description' => array_key_exists('seoDescription', $payload) ? $payload['seoDescription'] : $page->seo_description,
            'published_at' => $nextStatus === 'published' ? ($page->published_at ?? now()) : null,
        ]);

        return ApiResponse::success($this->serialize($page->refresh()), 'Page updated successfully');
    }

    public function destroy(Page $page)
    {
        $page->delete();

        return ApiResponse::success(null, 'Page deleted successfully');
    }

    public function publish(Page $page)
    {
        $page->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        return ApiResponse::success($this->serialize($page->refresh()), 'Page published successfully');
    }

    private function serialize(Page $page): array
    {
        return [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'status' => $page->status,
            'summary' => $page->summary,
            'content' => $page->content,
            'seoTitle' => $page->seo_title,
            'seoDescription' => $page->seo_description,
            'publishedAt' => optional($page->published_at)?->toIso8601String(),
            'createdAt' => optional($page->created_at)?->toIso8601String(),
            'updatedAt' => optional($page->updated_at)?->toIso8601String(),
        ];
    }
}
