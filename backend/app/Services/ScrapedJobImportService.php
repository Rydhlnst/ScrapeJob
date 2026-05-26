<?php

namespace App\Services;

use App\Models\ScrapedJob;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ScrapedJobImportService
{
    public function import(string $source, ?string $scrapedAt, array $jobs): array
    {
        $summary = [
            'received' => count($jobs),
            'created_count' => 0,
            'updated_count' => 0,
            'duplicate_count' => 0,
            'error_count' => 0,
        ];

        $scrapedAtCarbon = $scrapedAt ? Carbon::parse($scrapedAt) : now();

        DB::beginTransaction();
        try {
            foreach ($jobs as $job) {
                try {
                    $externalId = (string) ($job['external_job_id'] ?? '');
                    $sourceUrl = (string) ($job['source_url'] ?? '');
                    $title = (string) ($job['title'] ?? '');
                    $company = (string) ($job['company_name'] ?? '');
                    $location = (string) ($job['location'] ?? '');

                    $existingByExternal = ScrapedJob::query()
                        ->where('source', $source)
                        ->where('external_id', $externalId)
                        ->first();
                    if ($existingByExternal) {
                        $existingByExternal->update($this->toScrapedJobPayload($job, $source, $scrapedAtCarbon));
                        $summary['updated_count']++;
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

                    ScrapedJob::query()->create($this->toScrapedJobPayload($job, $source, $scrapedAtCarbon));
                    $summary['created_count']++;
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
            'source_url' => (string) ($job['source_url'] ?? ''),
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
