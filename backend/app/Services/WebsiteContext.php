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
        $domain = explode(',', $domain, 2)[0];
        $domain = preg_replace('#^https?://#', '', $domain) ?? $domain;
        $domain = explode('/', $domain, 2)[0];
        return explode(':', $domain, 2)[0];
    }

    public function resolve(Request $request): Website
    {
        $domain = $request->header('X-Website-Domain')
            ?: $request->header('X-Forwarded-Host')
            ?: $request->getHost();
        $normalizedDomain = self::normalizeDomain($domain);
        $isAdminRequest = $request->is('api/admin/*');
        $websiteId = $isAdminRequest
            ? ($request->header('X-Website-Id') ?: $request->query('website_id'))
            : null;

        $query = Website::query()->where('is_active', true);
        $website = $websiteId
            ? $query->whereKey($websiteId)->first()
            : $query->where(function ($websiteQuery) use ($normalizedDomain): void {
                $websiteQuery
                    ->where('domain', $normalizedDomain)
                    ->orWhereHas('domains', function ($domainQuery) use ($normalizedDomain): void {
                        $domainQuery->where('host', $normalizedDomain)->where('is_active', true);
                    });
            })->first();

        if ($website) {
            return $website;
        }

        // Allow a newly deployed staging hostname to resolve before the
        // idempotent domain seeder has completed. The persistent alias is
        // still created by WebsiteDomainSeeder during deployment.
        $stagingDomain = self::normalizeDomain((string) env('STAGING_SITE_DOMAIN', ''));
        $stagingTarget = self::normalizeDomain((string) env('STAGING_SITE_TARGET_DOMAIN', ''));
        if (!$websiteId && $stagingDomain !== '' && $stagingTarget !== '' && $normalizedDomain === $stagingDomain) {
            $stagingWebsite = Website::query()
                ->where('domain', $stagingTarget)
                ->where('is_active', true)
                ->first();

            if ($stagingWebsite) {
                return $stagingWebsite;
            }
        }

        if (!$websiteId && in_array($normalizedDomain, ['localhost', '127.0.0.1', '::1', 'your-vps-ip'], true)) {
            return Website::query()->firstOrCreate(
                ['domain' => 'lowonganku.com'],
                ['name' => 'Lowonganku.com', 'is_active' => true],
            );
        }

        throw (new ModelNotFoundException)->setModel(Website::class, [$websiteId ?: $domain]);
    }
}
