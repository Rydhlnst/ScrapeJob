<?php

namespace Database\Seeders;

use App\Models\Website;
use App\Models\WebsiteDomain;
use App\Services\WebsiteContext;
use Illuminate\Database\Seeder;
use RuntimeException;

class WebsiteDomainSeeder extends Seeder
{
    public function run(): void
    {
        $alias = WebsiteContext::normalizeDomain((string) env('STAGING_SITE_DOMAIN', ''));
        $target = WebsiteContext::normalizeDomain((string) env('STAGING_SITE_TARGET_DOMAIN', ''));

        if ($alias === '' || $target === '' || $alias === $target) {
            return;
        }

        $website = Website::query()->where('domain', $target)->first();
        if (!$website) {
            throw new RuntimeException("STAGING_SITE_TARGET_DOMAIN is not registered: {$target}");
        }

        $hosts = array_unique([$alias, ...(!str_starts_with($alias, 'www.') ? ['www.'.$alias] : [])]);
        $conflict = WebsiteDomain::query()
            ->whereIn('host', $hosts)
            ->where('website_id', '!=', $website->id)
            ->first();
        if ($conflict) {
            throw new RuntimeException("STAGING_SITE_DOMAIN is already assigned to another website: {$alias}");
        }

        foreach ($hosts as $host) {
            WebsiteDomain::query()->updateOrCreate(
                ['host' => $host],
                [
                    'website_id' => $website->id,
                    'is_primary' => false,
                    'is_active' => true,
                ],
            );
        }
    }
}
