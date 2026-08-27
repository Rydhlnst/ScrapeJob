<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Setting;
use App\Support\ApiResponse;
use App\Services\WebsiteContext;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    private const KEYS = [
        'site_name'             => 'string',
        'site_tagline'          => 'string',
        'contact_email'         => 'string',
        'auto_publish_jobs'     => 'boolean',
        'ai_cleanup_url'        => 'secret',
        'ai_cleanup_token'      => 'secret',
        'notify_on_scrape'      => 'boolean',
        'notify_emails'         => 'string',
        'scraper_active_sources'=> 'string',
    ];

    private const GLOBAL_KEYS = [
        'auto_publish_jobs',
        'ai_cleanup_url',
        'ai_cleanup_token',
        'notify_on_scrape',
        'notify_emails',
        'scraper_active_sources',
    ];

    public function index(Request $request, WebsiteContext $websiteContext)
    {
        $websiteId = $websiteContext->resolve($request)->id;
        $rows = Setting::whereIn('key', array_keys(self::KEYS))
            ->where(function ($query) use ($websiteId): void {
                $query->whereNull('website_id')->orWhere('website_id', $websiteId);
            })
            ->get()
            ->sortBy(fn (Setting $setting) => $setting->website_id === null ? 0 : 1)
            ->keyBy('key');

        $data = [];
        foreach (self::KEYS as $key => $type) {
            $row = $rows->get($key);
            $value = $row?->value;

            // Mask secrets — only send prefix
            if ($type === 'secret' && $value !== null && $value !== '') {
                $value = substr($value, 0, 4) . str_repeat('*', max(0, strlen($value) - 4));
            }

            $data[$key] = [
                'value' => $value,
                'type'  => $type,
            ];
        }

        return ApiResponse::success($data, 'Settings retrieved');
    }

    public function update(Request $request, WebsiteContext $websiteContext)
    {
        $websiteId = $websiteContext->resolve($request)->id;
        $payload = $request->validate([
            'settings'          => 'required|array',
            'settings.*.key'    => 'required|string',
            'settings.*.value'  => 'present|nullable',
        ]);

        $before = [];
        $after  = [];

        foreach ($payload['settings'] as $item) {
            $key = $item['key'];
            if (! array_key_exists($key, self::KEYS)) continue;

            $type  = self::KEYS[$key];
            $value = $item['value'];

            // Skip if user just sent back the masked placeholder
            if ($type === 'secret' && is_string($value) && str_contains($value, '****')) {
                continue;
            }

            $scopeId = in_array($key, self::GLOBAL_KEYS, true) ? null : $websiteId;
            $old = Setting::where('website_id', $scopeId)->where('key', $key)->value('value');
            $before[$key] = $type === 'secret' ? '[redacted]' : $old;

            if ($value === null || $value === '') {
                Setting::where('website_id', $scopeId)->where('key', $key)->delete();
                $after[$key] = null;
            } else {
                Setting::set($key, $value, $type, $scopeId);
                $after[$key] = $type === 'secret' ? '[redacted]' : $value;
            }
        }

        AuditLog::record('settings.update', 'Setting', null, $before, $after);

        return ApiResponse::success(null, 'Settings saved');
    }
}
