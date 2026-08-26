<?php

namespace App\Services;

use App\Models\Website;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class WebsiteContext
{
    public static function normalizeDomain(?string $domain): string
    {
        $domain = strtolower(trim((string) $domain));
        $domain = preg_replace('#^https?://#', '', $domain) ?? $domain;
        $domain = explode('/', $domain, 2)[0];
        return explode(':', $domain, 2)[0];
    }

    public function resolve(Request $request): Website
    {
        $websiteId = $request->header('X-Website-Id') ?: $request->query('website_id');
        $domain = $request->header('X-Website-Domain')
            ?: $request->header('X-Forwarded-Host')
            ?: $request->getHost();

        $query = Website::query()->where('is_active', true);
        $website = $websiteId
            ? $query->whereKey($websiteId)->first()
            : $query->where('domain', self::normalizeDomain($domain))->first();

        if ($website) {
            return $website;
        }

        if (in_array(self::normalizeDomain($domain), ['localhost', '127.0.0.1', '::1', 'your-vps-ip'], true)) {
            return Website::query()->firstOrCreate(
                ['domain' => 'lowonganku.com'],
                ['name' => 'Lowonganku.com', 'is_active' => true],
            );
        }

        throw (new ModelNotFoundException)->setModel(Website::class, [$websiteId ?: $domain]);
    }
}
