<?php

namespace App\Services\Scraping;

use App\Models\Job;
use App\Models\ScrapeLog;
use App\Models\ScrapeRun;
use App\Services\Jobs\JobHashService;
use App\Services\Jobs\JobNormalizationService;
use App\Services\Scraping\Mappers\UnifiedJobMapper;
use Illuminate\Support\Carbon;

class ScrapeIngestionService
{
    public function __construct(
        private readonly UnifiedJobMapper $mapper,
        private readonly JobHashService $hashService,
        private readonly JobNormalizationService $normalizationService,
    ) {}

    public function ingest(ScrapeRun $run, array $scrapeResult): array
    {
        $mappedCount = 0;
        $created = 0;
        $updated = 0;
        $duplicates = 0;
        $errors = 0;
        $activeUrlHashes = [];
        $samples = [];

        foreach ($scrapeResult['items'] ?? [] as $rawItem) {
            try {
                $mapped = $this->mapper->map($rawItem, (string) ($scrapeResult['source'] ?? $run->source_name));
                $mappedCount++;
                if (count($samples) < 3) {
                    $samples[] = $mapped;
                }

                $sourceUrlHash = $this->hashService->makeSourceUrlHash((string) $mapped['original_url']);
                $contentHash = $this->hashService->makeContentHash(
                    (string) $mapped['title'],
                    (string) data_get($mapped, 'company.name', ''),
                    (string) data_get($mapped, 'location.city', ''),
                );
                $fingerprint = Job::makeFingerprint(
                    (string) $mapped['source'],
                    (string) $mapped['title'],
                    (string) data_get($mapped, 'company.name', ''),
                    (string) data_get($mapped, 'location.city', ''),
                );

                $activeUrlHashes[] = $sourceUrlHash;

                $existingByUrl = Job::query()->where('source_url_hash', $sourceUrlHash)->first();
                if ($existingByUrl) {
                    $existingByUrl->update($this->toJobPayload($mapped, $sourceUrlHash, $contentHash, $fingerprint, $existingByUrl->notified));
                    $updated++;
                    $this->log($run, $mapped, 'success', 'updated');
                    continue;
                }

                $existingByFingerprint = Job::query()->where('fingerprint', $fingerprint)->first();
                if ($existingByFingerprint) {
                    $duplicates++;
                    $this->log($run, $mapped, 'duplicate', 'duplicate:fingerprint');
                    continue;
                }

                $existingByHash = Job::query()->where('content_hash', $contentHash)->first();
                if ($existingByHash) {
                    $duplicates++;
                    $this->log($run, $mapped, 'duplicate', 'duplicate');
                    continue;
                }

                Job::query()->create($this->toJobPayload($mapped, $sourceUrlHash, $contentHash, $fingerprint, false));
                $created++;
                $this->log($run, $mapped, 'success', 'created');
            } catch (\Throwable $exception) {
                $errors++;
                ScrapeLog::query()->create([
                    'scrape_run_id' => $run->id,
                    'url' => (string) ($rawItem['url'] ?? null),
                    'title' => (string) ($rawItem['title'] ?? null),
                    'status' => 'failed',
                    'message' => 'error: '.$exception->getMessage(),
                    'payload' => $rawItem,
                ]);
            }
        }

        if ($activeUrlHashes !== []) {
            Job::query()
                ->where('source_name', $run->source_name)
                ->where('is_active', true)
                ->whereNotIn('source_url_hash', $activeUrlHashes)
                ->update(['is_active' => false]);
        }

        return [
            'mapped_count' => $mappedCount,
            'created_count' => $created,
            'updated_count' => $updated,
            'duplicate_count' => $duplicates,
            'error_count' => $errors,
            'sample_payloads' => $samples,
        ];
    }

    private function log(ScrapeRun $run, array $mapped, string $status, string $message): void
    {
        ScrapeLog::query()->create([
            'scrape_run_id' => $run->id,
            'url' => $mapped['original_url'],
            'title' => $mapped['title'],
            'status' => $status,
            'message' => $message,
            'payload' => $mapped,
        ]);
    }

    private function toJobPayload(
        array $mapped,
        string $sourceUrlHash,
        string $contentHash,
        string $fingerprint,
        bool $notified
    ): array
    {
        $postedAt = $mapped['posted_at'] ? Carbon::parse($mapped['posted_at']) : null;
        $expiresAt = $mapped['expires_at'] ? Carbon::parse($mapped['expires_at']) : null;

        return [
            'external_id' => $mapped['_external_id'],
            'fingerprint' => $fingerprint,
            'source' => $mapped['source'],
            'title' => $mapped['title'],
            'company_name' => data_get($mapped, 'company.name'),
            'company_meta' => $mapped['company'],
            'location' => trim(implode(', ', array_filter([data_get($mapped, 'location.city'), data_get($mapped, 'location.province')]))),
            'location_city' => data_get($mapped, 'location.city'),
            'location_province' => data_get($mapped, 'location.province'),
            'location_country' => data_get($mapped, 'location.country', 'ID'),
            'remote_type' => data_get($mapped, 'location.remote_type'),
            'job_type' => $mapped['job_type'],
            'salary_text' => $this->salaryText($mapped['salary']),
            'salary_min' => data_get($mapped, 'salary.min'),
            'salary_max' => data_get($mapped, 'salary.max'),
            'salary_currency' => data_get($mapped, 'salary.currency', 'IDR'),
            'salary_period' => data_get($mapped, 'salary.period'),
            'salary_is_disclosed' => (bool) data_get($mapped, 'salary.is_disclosed', false),
            'experience_level' => $mapped['experience_level'],
            'experience_years_min' => data_get($mapped, 'experience_years.min'),
            'experience_years_max' => data_get($mapped, 'experience_years.max'),
            'education_level' => $mapped['education'],
            'description' => $this->normalizationService->sanitizeDescription($mapped['description']),
            'raw_description' => $mapped['description'],
            'requirements' => $mapped['requirements'],
            'responsibilities' => $mapped['responsibilities'],
            'skills' => $mapped['skills'],
            'benefits' => $mapped['benefits'],
            'apply_url' => $mapped['apply_url'],
            'source_url' => $mapped['original_url'],
            'source_url_hash' => $sourceUrlHash,
            'source_name' => ucfirst($mapped['source']),
            'content_hash' => $contentHash,
            'status' => 'draft',
            'scraped_at' => now(),
            'posted_at' => $postedAt,
            'expires_at' => $expiresAt,
            'is_active' => (bool) ($mapped['is_active'] ?? true),
            'notified' => $notified,
            'tags' => $mapped['tags'],
            'unified_payload' => $mapped,
        ];
    }

    private function salaryText(array $salary): ?string
    {
        if (! ($salary['is_disclosed'] ?? false)) {
            return null;
        }

        $min = $salary['min'] ?? null;
        $max = $salary['max'] ?? null;

        if ($min && $max && $min !== $max) {
            return sprintf('IDR %s - %s', number_format((int) $min), number_format((int) $max));
        }

        return $min ? sprintf('IDR %s', number_format((int) $min)) : null;
    }
}
