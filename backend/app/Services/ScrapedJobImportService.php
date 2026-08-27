<?php

namespace App\Services;

use App\Jobs\CleanScrapedJobWithAI;
use App\Models\ScrapedJob;
use App\Services\Jobs\ScrapedJobPublishingService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ScrapedJobImportService
{
    public function __construct(
        private readonly ScrapedJobPublishingService $publishingService,
    ) {}

    public function import(string $source, ?string $scrapedAt, array $jobs): array
    {
        $summary = [
            'received' => count($jobs),
            'created_count' => 0,
            'updated_count' => 0,
            'duplicate_count' => 0,
            'error_count' => 0,
            'pending_count' => 0,
            'draft_count' => 0,
            'published_count' => 0,
        ];

        $scrapedAtCarbon = $scrapedAt ? Carbon::parse($scrapedAt) : now();

        DB::beginTransaction();
        try {
            foreach ($jobs as $job) {
                try {
                    $externalId = (string) ($job['external_job_id'] ?? '');
                    $sourceUrl = $this->normalizeUrl((string) ($job['source_url'] ?? ''));
                    $title = (string) ($job['title'] ?? '');
                    $company = (string) ($job['company_name'] ?? '');
                    $location = (string) ($job['location'] ?? '');

                    $existingByExternal = ScrapedJob::query()
                        ->where('source', $source)
                        ->where('external_id', $externalId)
                        ->first();
                    if ($existingByExternal) {
                        $wasPending = $existingByExternal->status === 'pending';
                        $existingByExternal->update($this->toScrapedJobPayload($job, $source, $scrapedAtCarbon));
                        if (config('services.ai_cleanup.enabled')) {
                            CleanScrapedJobWithAI::dispatch($existingByExternal)->afterCommit();
                        }
                        if ($wasPending) {
                            $this->maybeCreateDraft($existingByExternal, $summary);
                        }
                        $summary['updated_count']++;
                        $summary['pending_count']++;
                        continue;
                    }

                    $existingByHash = ScrapedJob::query()
                        ->whereRaw('LOWER(title) = ?', [strtolower($title)])
                        ->whereRaw('LOWER(company) = ?', [strtolower($company)])
                        ->whereRaw('LOWER(COALESCE(location, \'\')) = ?', [strtolower($location)])
                        ->whereRaw('LOWER(source_url) = ?', [strtolower($sourceUrl)])
                        ->first();

                    if ($existingByHash) {
                        $summary['duplicate_count']++;
                        continue;
                    }

                    $scrapedJob = ScrapedJob::query()->create($this->toScrapedJobPayload($job, $source, $scrapedAtCarbon));
                    if (config('services.ai_cleanup.enabled')) {
                        CleanScrapedJobWithAI::dispatch($scrapedJob)->afterCommit();
                    }
                    $this->maybeCreateDraft($scrapedJob, $summary);
                    $summary['created_count']++;
                    $summary['pending_count']++;
                } catch (\Throwable $exception) {
                    report($exception);
                    $summary['error_count']++;
                }
            }
            DB::commit();
        } catch (\Throwable $exception) {
            DB::rollBack();
            throw $exception;
        }

        return $summary;
    }

    private function maybeCreateDraft(ScrapedJob $scrapedJob, array &$summary): void
    {
        if (! (bool) config('scraper.auto_create_drafts', false)) {
            return;
        }

        $result = $this->publishingService->moveToDraft($scrapedJob->refresh(), false);
        if ($result['result'] === 'duplicate') {
            $summary['duplicate_count']++;

            return;
        }

        $summary['draft_count']++;
    }

    private function normalizeUrl(string $url): string
    {
        $parts = parse_url($url);
        if (!$parts) {
            return $url;
        }

        $scheme = isset($parts['scheme']) ? strtolower($parts['scheme']) : 'http';
        $host = isset($parts['host']) ? strtolower($parts['host']) : '';
        $port = isset($parts['port']) ? ':' . $parts['port'] : '';
        $path = isset($parts['path']) ? $parts['path'] : '';

        // Trim trailing slashes from path
        $path = rtrim($path, '/');

        // Reconstruct URL (ignoring query and fragment)
        return $scheme . '://' . $host . $port . $path;
    }

    private function toScrapedJobPayload(array $job, string $source, Carbon $scrapedAtCarbon): array
    {
        $salaryMin = isset($job['salary_min']) ? (int) $job['salary_min'] : null;
        $salaryMax = isset($job['salary_max']) ? (int) $job['salary_max'] : null;

        $salaryText = null;
        if ($salaryMin !== null && $salaryMax !== null) {
            $salaryText = sprintf('IDR %s - %s', number_format($salaryMin), number_format($salaryMax));
        } elseif ($salaryMin !== null) {
            $salaryText = sprintf('IDR %s', number_format($salaryMin));
        }

        return [
            'external_id' => (string) ($job['external_job_id'] ?? ''),
            'source' => $source,
            'source_url' => $this->normalizeUrl((string) ($job['source_url'] ?? '')),
            'role_keyword' => null,
            'title' => (string) ($job['title'] ?? ''),
            'company' => (string) ($job['company_name'] ?? ''),
            'location' => $job['location'] ?? null,
            'salary' => $salaryText,
            'employment_type' => $job['job_type'] ?? null,
            'description' => $job['description'] ?? null,
            'description_summary' => null,
            'posted_date' => $job['posted_at'] ?? null,
            'scraped_at' => $job['scraped_at'] ?? $scrapedAtCarbon,
            'status' => 'pending',
            'raw_json' => $job,
        ];
    }
}
