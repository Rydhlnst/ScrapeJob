<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\LandingPageContent;
use App\Support\ApiResponse;
use App\Services\WebsiteContext;

class LandingPageContentController extends Controller
{
    public function show(WebsiteContext $websiteContext)
    {
        $content = LandingPageContent::query()
            ->where('website_id', $websiteContext->resolve(request())->id)
            ->where('key', 'landing_page')
            ->first();

        return ApiResponse::success($content?->published_payload, 'Landing page content retrieved successfully');
    }
}
