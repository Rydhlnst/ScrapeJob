<?php

namespace App\Services\Scraping\Scrapers;

use App\Models\Job;
use App\Models\JobSource;
use App\Services\Scraping\Http\ScraperHttpClient;
use Illuminate\Support\Carbon;

abstract class BaseScraper
{
    public function __construct(protected readonly ScraperHttpClient $client) {}

    final public function run(JobSource $jobSource, array $options = []): array
    {
        $startedAt = microtime(true);

        try {
            $rawItems = $this->scrapeJobs($jobSource, $options);
        } catch (\Throwable $exception) {
            return [
                'source' => strtolower($jobSource->name),
                'status' => 'failed',
                'found' => 0,
                'items' => [],
                'metrics' => [
                    'found' => 0,
                    'skipped' => 0,
                    'errors' => 1,
                    'duration_seconds' => round(microtime(true) - $startedAt, 2),
                ],
                'message' => $exception->getMessage(),
            ];
        }

        $dedupedItems = [];
        $seen = [];

        foreach ($rawItems as $item) {
            $fingerprint = $this->itemFingerprint($jobSource, $item);

            if (isset($seen[$fingerprint])) {
                continue;
            }

            $seen[$fingerprint] = true;
            $item['posted_at'] = $this->parseDate($item['posted_at'] ?? null);
            $item['description'] = $this->cleanHtml($item['description'] ?? null);

            $dedupedItems[] = $item;
        }

        $found = count($rawItems);
        $mapped = count($dedupedItems);

        return [
            'source' => strtolower($jobSource->name),
            'status' => 'success',
            'found' => $found,
            'items' => $dedupedItems,
            'metrics' => [
                'found' => $found,
                'mapped' => $mapped,
                'skipped' => max(0, $found - $mapped),
                'errors' => 0,
                'duration_seconds' => round(microtime(true) - $startedAt, 2),
            ],
            'message' => 'Scrape completed',
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    abstract protected function scrapeJobs(JobSource $jobSource, array $options = []): array;

    protected function itemFingerprint(JobSource $jobSource, array $item): string
    {
        return Job::makeFingerprint(
            strtolower($jobSource->name),
            (string) ($item['title'] ?? ''),
            (string) data_get($item, 'company.name', $item['company'] ?? ''),
            (string) ($item['location'] ?? ''),
        );
    }

    protected function parseDate(mixed $value): ?string
    {
        if (blank($value)) {
            return null;
        }

        try {
            return Carbon::parse((string) $value)->toIso8601String();
        } catch (\Throwable) {
            return null;
        }
    }

    protected function cleanHtml(?string $html): string
    {
        if (blank($html)) {
            return '';
        }

        return trim(strip_tags(html_entity_decode((string) $html, ENT_QUOTES, 'UTF-8')));
    }

    protected function normalizeJobType(?string $raw): string
    {
        $value = strtolower((string) $raw);

        return match (true) {
            str_contains($value, 'part') => 'part_time',
            str_contains($value, 'contract') => 'contract',
            str_contains($value, 'intern') => 'internship',
            str_contains($value, 'freelance') => 'freelance',
            default => 'full_time',
        };
    }
}
