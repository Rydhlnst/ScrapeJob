<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\WebsiteResource;
use App\Models\Website;
use App\Services\WebsiteContext;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class WebsiteController extends Controller
{
    public function index()
    {
        return ApiResponse::success(WebsiteResource::collection(Website::query()->orderBy('name')->get())->resolve(), 'Websites retrieved successfully');
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'domain' => ['required', 'string', 'max:191'],
            'is_active' => ['sometimes', 'boolean'],
            'theme' => ['nullable', 'string', 'max:191'],
            'logo' => ['nullable', 'string', 'max:2048'],
            'settings' => ['nullable', 'array'],
        ]);
        $payload['domain'] = WebsiteContext::normalizeDomain($payload['domain']);
        if (Website::query()->where('domain', $payload['domain'])->exists()) {
            return ApiResponse::error('That domain is already registered.', 422);
        }

        $website = Website::query()->create($payload + ['is_active' => true]);

        return ApiResponse::success(new WebsiteResource($website), 'Website created successfully', 201);
    }

    public function show(Website $website)
    {
        return ApiResponse::success(new WebsiteResource($website), 'Website retrieved successfully');
    }

    public function update(Request $request, Website $website)
    {
        $payload = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:191'],
            'domain' => ['sometimes', 'required', 'string', 'max:191'],
            'is_active' => ['sometimes', 'boolean'],
            'theme' => ['nullable', 'string', 'max:191'],
            'logo' => ['nullable', 'string', 'max:2048'],
            'settings' => ['nullable', 'array'],
        ]);
        if (array_key_exists('domain', $payload)) {
            $payload['domain'] = WebsiteContext::normalizeDomain($payload['domain']);
            if (Website::query()->where('domain', $payload['domain'])->where('id', '!=', $website->id)->exists()) {
                return ApiResponse::error('That domain is already registered.', 422);
            }
        }
        $website->update($payload);

        return ApiResponse::success(new WebsiteResource($website->refresh()), 'Website updated successfully');
    }

    public function destroy(Website $website)
    {
        if ($website->websiteJobs()->exists()) {
            return ApiResponse::error('Website with assigned jobs cannot be deleted. Disable it instead.', 422);
        }

        $website->delete();
        return ApiResponse::success(null, 'Website deleted successfully');
    }
}
