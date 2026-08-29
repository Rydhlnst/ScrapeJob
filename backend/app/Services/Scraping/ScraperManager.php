<?php

namespace App\Services\Scraping;

use App\Models\JobSource;
use App\Services\Scraping\Scrapers\ApiJsonJobScraper;
use App\Services\Scraping\Scrapers\BaseScraper;
use App\Services\Scraping\Scrapers\GenericHtmlJobScraper;
use App\Services\Scraping\Scrapers\GlintsScraper;
use App\Services\Scraping\Scrapers\HeadlessBrowserScraper;
use App\Services\Scraping\Scrapers\JobstreetScraper;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

class ScraperManager
{
    /**
     * @var array<string, BaseScraper>
     */
    private array $customScrapers = [];

    public function __construct(
        private readonly GenericHtmlJobScraper $genericHtmlJobScraper,
        private readonly GlintsScraper $glintsScraper,
        private readonly JobstreetScraper $jobstreetScraper,
        private readonly ApiJsonJobScraper $apiJsonJobScraper,
        private readonly HeadlessBrowserScraper $headlessBrowserScraper,
    ) {}

    public function register(string $name, BaseScraper $scraper): static
    {
        $this->customScrapers[strtolower($name)] = $scraper;

        return $this;
    }

    /**
     * @param JobSource|string $source
     */
    public function run(JobSource|string $source): array
    {
        $jobSource = $source instanceof JobSource
            ? $source
            : $this->resolveJobSource((string) $source);

        $sourceKey = strtolower($jobSource->name);
        $config = $this->sourceConfig($jobSource);

        $scraper = $this->resolveScraper($sourceKey, $config);

        return $scraper->run($jobSource, $config);
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public function runAll(): array
    {
        $results = [];

        foreach ($this->activeSources() as $sourceName) {
            try {
                $results[$sourceName] = $this->run($sourceName);
            } catch (\Throwable $exception) {
                Log::warning('ScraperManager runAll failed for source', [
                    'source' => $sourceName,
                    'error' => $exception->getMessage(),
                ]);

                $results[$sourceName] = [
                    'source' => $sourceName,
                    'status' => 'failed',
                    'found' => 0,
                    'items' => [],
                    'metrics' => [
                        'found' => 0,
                        'mapped' => 0,
                        'skipped' => 0,
                        'errors' => 1,
                        'duration_seconds' => 0,
                    ],
                    'message' => $exception->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * @return array<int, string>
     */
    public function availableSources(): array
    {
        $builtin = ['glints', 'jobstreet', 'jobstreetexpress', 'kalibrr', 'karir'];
        $configSources = array_keys((array) config('scraper.builtin_sources', []));
        $databaseSources = JobSource::query()->pluck('name')->map(static fn (string $name): string => strtolower($name))->all();

        return array_values(array_unique(array_merge(
            $builtin,
            $configSources,
            $databaseSources,
            array_keys($this->customScrapers),
        )));
    }

    /**
     * @return array<int, string>
     */
    public function activeSources(): array
    {
        $databaseSources = JobSource::query()
            ->where('is_active', true)
            ->where('scraping_allowed', true)
            ->pluck('name')
            ->map(static fn (string $name): string => strtolower($name))
            ->all();

        if ($databaseSources !== []) {
            return array_values(array_unique($databaseSources));
        }

        // Admin-configurable override (comma-separated) via /admin/settings.
        // Takes precedence over the env fallback when the DB has no active
        // job_source rows.
        $settingSources = \App\Models\Setting::get('scraper_active_sources');
        if (is_string($settingSources) && trim($settingSources) !== '') {
            $parsed = array_values(array_filter(array_map('trim', explode(',', $settingSources))));
            if ($parsed !== []) {
                return array_values(array_unique(array_map('strtolower', $parsed)));
            }
        }

        $envSources = config('scraper.active_sources', ['glints', 'jobstreet']);

        if (is_string($envSources)) {
            $envSources = array_values(array_filter(array_map('trim', explode(',', $envSources))));
        }

        return array_values(array_unique(array_map('strtolower', (array) $envSources)));
    }

    private function resolveJobSource(string $sourceName): JobSource
    {
        $normalized = strtolower(trim($sourceName));

        if ($normalized === '') {
            throw new InvalidArgumentException('Source name is required.');
        }

        if (! in_array($normalized, $this->availableSources(), true)) {
            throw new InvalidArgumentException("Scraper source '{$normalized}' is not registered.");
        }

        $existing = JobSource::query()
            ->whereRaw('LOWER(name) = ?', [$normalized])
            ->first();

        if ($existing) {
            return $existing;
        }

        $config = (array) data_get(config('scraper.builtin_sources', []), $normalized, []);

        return new JobSource([
            'name' => $normalized,
            'base_url' => (string) ($config['base_url'] ?? $config['api_url'] ?? $config['target_url'] ?? ''),
            'listing_url' => (string) ($config['list_url'] ?? $config['target_url'] ?? ''),
            'notes' => $config === [] ? null : json_encode($config),
            'is_active' => true,
            'scraping_allowed' => true,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function sourceConfig(JobSource $jobSource): array
    {
        $notesConfig = [];

        if (is_string($jobSource->notes) && trim($jobSource->notes) !== '') {
            $decoded = json_decode($jobSource->notes, true);
            if (is_array($decoded)) {
                $notesConfig = $decoded;
            }
        }

        $configured = data_get(config('scraper.builtin_sources', []), strtolower($jobSource->name), []);
        if (! is_array($configured)) {
            $configured = [];
        }

        return array_merge($configured, $notesConfig);
    }

    /**
     * @param array<string, mixed> $config
     */
    private function resolveScraper(string $sourceName, array $config): BaseScraper
    {
        if (isset($this->customScrapers[$sourceName])) {
            return $this->customScrapers[$sourceName];
        }

        if ($sourceName === 'glints') {
            return $this->glintsScraper;
        }

        if ($sourceName === 'jobstreet') {
            return $this->jobstreetScraper;
        }

        $type = strtolower((string) ($config['type'] ?? 'html'));

        return match ($type) {
            'json', 'api' => $this->apiJsonJobScraper,
            'headless', 'spa', 'puppeteer' => $this->headlessBrowserScraper,
            default => $this->genericHtmlJobScraper,
        };
    }
}
