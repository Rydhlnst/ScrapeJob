<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\WebsiteResource;
use App\Models\Job;
use App\Models\Website;
use App\Models\WebsiteDomain;
use App\Models\WebsiteJob;
use App\Services\WebsiteContext;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class WebsiteController extends Controller
{
    public function index()
    {
        return ApiResponse::success(WebsiteResource::collection(Website::query()->with('domains')->orderBy('name')->get())->resolve(), 'Websites retrieved successfully');
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'domain' => ['required', 'string', 'max:191'],
            'is_active' => ['sometimes', 'boolean'],
            'theme' => ['nullable', 'string', 'max:191'],
            'logo' => $this->logoRules(),
            'settings' => ['nullable', 'array'],
            'settings.primaryColor' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'settings.accentColor' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'settings.inkColor' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'settings.backgroundColor' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);
        $payload['domain'] = WebsiteContext::normalizeDomain($payload['domain']);
        if ($this->domainsConflict($payload['domain'])) {
            return ApiResponse::error('That domain is already registered.', 422);
        }

        $website = DB::transaction(function () use ($payload): Website {
            $website = Website::query()->create($payload + ['is_active' => true]);
            $this->syncDomains($website, $website->domain);

            Job::query()->select('id')->each(function (Job $job) use ($website): void {
                WebsiteJob::query()->firstOrCreate(
                    ['website_id' => $website->id, 'job_id' => $job->id],
                    ['status' => 'unused'],
                );
            });

            return $website;
        });

        return ApiResponse::success(new WebsiteResource($website->load('domains')), 'Website created successfully', 201);
    }

    public function show(Website $website)
    {
        return ApiResponse::success(new WebsiteResource($website->load('domains')), 'Website retrieved successfully');
    }

    public function update(Request $request, Website $website)
    {
        $payload = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:191'],
            'domain' => ['sometimes', 'required', 'string', 'max:191'],
            'is_active' => ['sometimes', 'boolean'],
            'theme' => ['nullable', 'string', 'max:191'],
            'logo' => $this->logoRules(),
            'settings' => ['nullable', 'array'],
            'settings.primaryColor' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'settings.accentColor' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'settings.inkColor' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'settings.backgroundColor' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);
        if (array_key_exists('domain', $payload)) {
            $payload['domain'] = WebsiteContext::normalizeDomain($payload['domain']);
            if ($this->domainsConflict($payload['domain'], $website->id)) {
                return ApiResponse::error('That domain is already registered.', 422);
            }
        }
        DB::transaction(function () use ($website, $payload): void {
            $website->update($payload);
            if (array_key_exists('domain', $payload)) {
                $this->syncDomains($website, $payload['domain']);
            }
        });

        return ApiResponse::success(new WebsiteResource($website->refresh()->load('domains')), 'Website updated successfully');
    }

    public function destroy(Website $website)
    {
        if ($website->websiteJobs()->exists()) {
            return ApiResponse::error('Website with assigned jobs cannot be deleted. Disable it instead.', 422);
        }

        $website->delete();
        return ApiResponse::success(null, 'Website deleted successfully');
    }

    public function addDomain(Request $request, Website $website)
    {
        $payload = $request->validate([
            'host' => ['required', 'string', 'max:191'],
        ]);
        $host = WebsiteContext::normalizeDomain($payload['host']);

        if ($host === '' || $host === $website->domain) {
            return ApiResponse::error('The host must be a non-primary alias.', 422);
        }
        if ($this->domainsConflict($host, $website->id)) {
            return ApiResponse::error('That domain is already registered.', 422);
        }

        foreach (array_unique([$host, ...(!str_starts_with($host, 'www.') ? ['www.'.$host] : [])]) as $aliasHost) {
            WebsiteDomain::query()->create([
                'website_id' => $website->id,
                'host' => $aliasHost,
                'is_primary' => false,
                'is_active' => true,
            ]);
        }

        return ApiResponse::success(new WebsiteResource($website->refresh()->load('domains')), 'Website alias added successfully', 201);
    }

    public function removeDomain(Website $website, string $host)
    {
        $normalizedHost = WebsiteContext::normalizeDomain($host);
        $hosts = [$normalizedHost];
        if (!str_starts_with($normalizedHost, 'www.')) {
            $hosts[] = 'www.'.$normalizedHost;
        }
        $domain = $website->domains()->where('host', $normalizedHost)->where('is_primary', false)->first();

        if (!$domain) {
            return ApiResponse::error('Website alias not found.', 404);
        }

        $website->domains()->whereIn('host', $hosts)->where('is_primary', false)->delete();

        return ApiResponse::success(new WebsiteResource($website->refresh()->load('domains')), 'Website alias removed successfully');
    }

    private function syncDomains(Website $website, string $primaryHost): void
    {
        $hosts = [$primaryHost];
        if (!str_starts_with($primaryHost, 'www.')) {
            $hosts[] = 'www.'.$primaryHost;
        }
        WebsiteDomain::query()
            ->where('website_id', $website->id)
            ->whereNotIn('host', $hosts)
            ->update(['is_active' => false, 'is_primary' => false]);
        WebsiteDomain::query()->where('website_id', $website->id)->update(['is_primary' => false]);
        WebsiteDomain::query()->updateOrCreate(
            ['host' => $primaryHost],
            ['website_id' => $website->id, 'is_primary' => true, 'is_active' => true],
        );

        if (!str_starts_with($primaryHost, 'www.')) {
            WebsiteDomain::query()->updateOrCreate(
                ['host' => 'www.'.$primaryHost],
                ['website_id' => $website->id, 'is_primary' => false, 'is_active' => true],
            );
        }
    }

    /**
     * @return array<int, mixed>
     */
    private function logoRules(): array
    {
        return [
            'nullable',
            'string',
            'max:2048',
            function (string $attribute, mixed $value, \Closure $fail): void {
                if ($value === null || trim((string) $value) === '') {
                    return;
                }

                $logo = trim((string) $value);
                $isAppRelativePath = str_starts_with($logo, '/') && !str_starts_with($logo, '//');
                $scheme = parse_url($logo, PHP_URL_SCHEME);
                $isHttpUrl = in_array($scheme, ['http', 'https'], true) && filter_var($logo, FILTER_VALIDATE_URL) !== false;

                if (!$isAppRelativePath && !$isHttpUrl) {
                    $fail('The logo must be an HTTP(S) image URL or an app-relative path.');
                }
            },
        ];
    }

    private function domainsConflict(string $primaryHost, ?string $exceptWebsiteId = null): bool
    {
        $hosts = [$primaryHost];
        if (!str_starts_with($primaryHost, 'www.')) {
            $hosts[] = 'www.'.$primaryHost;
        }

        return WebsiteDomain::query()
            ->whereIn('host', $hosts)
            ->when($exceptWebsiteId, fn ($query) => $query->where('website_id', '!=', $exceptWebsiteId))
            ->exists()
            || Website::query()
                ->whereIn('domain', $hosts)
                ->when($exceptWebsiteId, fn ($query) => $query->where('id', '!=', $exceptWebsiteId))
                ->exists();
    }
}
