<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LandingPageContent;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class LandingPageContentController extends Controller
{
    private const CONTENT_KEY = 'landing_page';

    public function show()
    {
        return ApiResponse::success($this->serialize($this->resolveContent()), 'Landing page content retrieved successfully');
    }

    public function update(Request $request)
    {
        $payload = $request->validate([
            'draftPayload' => ['required', 'array'],
        ]);

        $content = $this->resolveContent();
        $content->fill([
            'draft_payload' => $payload['draftPayload'],
            'updated_by' => $request->user()?->id,
        ])->save();

        return ApiResponse::success($this->serialize($content->fresh()), 'Landing page content draft saved successfully');
    }

    public function publish(Request $request)
    {
        $content = $this->resolveContent();

        if (! $content->hasDraft()) {
            return ApiResponse::error('No draft content available to publish.', 422);
        }

        $content->fill([
            'published_payload' => $content->draft_payload,
            'draft_payload' => null,
            'updated_by' => $request->user()?->id,
            'published_by' => $request->user()?->id,
            'published_at' => now(),
        ])->save();

        return ApiResponse::success($this->serialize($content->fresh()), 'Landing page content published successfully');
    }

    private function resolveContent(): LandingPageContent
    {
        return LandingPageContent::query()->firstOrCreate(
            ['key' => self::CONTENT_KEY],
            ['draft_payload' => null, 'published_payload' => null],
        );
    }

    private function serialize(LandingPageContent $content): array
    {
        return [
            'id' => $content->id,
            'key' => $content->key,
            'status' => $content->hasDraft() ? 'draft' : ($content->published_payload ? 'published' : 'empty'),
            'hasDraft' => $content->hasDraft(),
            'draftPayload' => $content->draft_payload,
            'publishedPayload' => $content->published_payload,
            'updatedAt' => optional($content->updated_at)?->toIso8601String(),
            'publishedAt' => optional($content->published_at)?->toIso8601String(),
        ];
    }
}
