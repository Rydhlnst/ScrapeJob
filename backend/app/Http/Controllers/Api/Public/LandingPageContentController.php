<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\LandingPageContent;
use App\Support\ApiResponse;

class LandingPageContentController extends Controller
{
    public function show()
    {
        $content = LandingPageContent::query()
            ->where('key', 'landing_page')
            ->first();

        return ApiResponse::success($content?->published_payload, 'Landing page content retrieved successfully');
    }
}
