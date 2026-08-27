<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\WebsiteContext;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class SiteConfigController extends Controller
{
    public function __invoke(Request $request, WebsiteContext $websiteContext)
    {
        $website = $websiteContext->resolve($request);
        $settings = $website->settings ?? [];

        $primaryColor = $settings['primaryColor'] ?? $settings['primary_color'] ?? '#1f5f9f';
        $accentColor = $settings['accentColor'] ?? $settings['accent_color'] ?? '#f2a23a';
        $inkColor = $settings['inkColor'] ?? $settings['ink_color'] ?? '#171717';
        $backgroundColor = $settings['backgroundColor'] ?? $settings['background_color'] ?? '#ffffff';
        $name = Setting::get('site_name', $website->name, $website->id) ?: $website->name;
        $tagline = Setting::get('site_tagline', null, $website->id);
        $contactEmail = Setting::get('contact_email', null, $website->id);

        return ApiResponse::success([
            'website' => [
                'id' => $website->id,
                'name' => $name,
                'domain' => $website->domain,
                'logo' => $website->logo,
            ],
            'branding' => [
                'primaryColor' => $primaryColor,
                'accentColor' => $accentColor,
                'inkColor' => $inkColor,
                'backgroundColor' => $backgroundColor,
                'theme' => $website->theme,
            ],
            'tagline' => $tagline ?: $name,
            'metadata' => [
                'title' => $name,
                'description' => $tagline ?: $name,
            ],
            'contact' => [
                'email' => $contactEmail,
            ],
            'features' => $settings['features'] ?? [],
            'settings' => $settings,
        ], 'Site configuration retrieved successfully');
    }
}
