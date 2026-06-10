<?php

namespace App\Services\Jobs;

use App\Models\Job;
use App\Models\ScrapedJob;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class ScrapedJobPublishingService
{
    public function __construct(
        private readonly JobHashService $jobHashService,
        private readonly JobNormalizationService $normalizationService,
    ) {}

    public function publish(ScrapedJob $scrapedJob): string
    {
        $payload = $this->toJobPayload($scrapedJob);

        $existingByUrl = Job::query()
            ->where('source_url_hash', $payload['source_url_hash'])
            ->first();

        if ($existingByUrl) {
            $existingByUrl->update([
                ...$payload,
                'notified' => $existingByUrl->notified,
                'published_at' => $existingByUrl->published_at ?? now(),
            ]);
            $scrapedJob->update(['status' => 'published']);

            return 'updated';
        }

        $existingByFingerprint = Job::query()
            ->where('fingerprint', $payload['fingerprint'])
            ->first();

        if ($existingByFingerprint) {
            $scrapedJob->update(['status' => 'duplicate']);

            return 'duplicate';
        }

        $existingByContent = Job::query()
            ->where('content_hash', $payload['content_hash'])
            ->first();

        if ($existingByContent) {
            $scrapedJob->update(['status' => 'duplicate']);

            return 'duplicate';
        }

        Job::query()->create($payload + ['notified' => false]);
        $scrapedJob->update(['status' => 'published']);

        return 'created';
    }

    private function toJobPayload(ScrapedJob $scrapedJob): array
    {
        $description = $this->normalizationService->sanitizeDescription($scrapedJob->description ?? '');
        $location = (string) ($scrapedJob->location ?? 'Unknown');
        $locationParts = $this->normalizationService->parseLocation($location);
        $salary = $scrapedJob->salary
            ? $this->normalizationService->parseSalary($scrapedJob->salary)
            : ['min' => null, 'max' => null, 'currency' => 'IDR', 'period' => null, 'is_disclosed' => false];

        return [
            'scraped_job_id' => $scrapedJob->id,
            'external_id' => $scrapedJob->external_id,
            'fingerprint' => Job::makeFingerprint(
                source: $scrapedJob->source,
                title: $scrapedJob->title,
                company: $scrapedJob->company,
                location: $scrapedJob->location,
            ),
            'source' => $scrapedJob->source,
            'title' => $scrapedJob->title,
            'company_name' => $scrapedJob->company,
            'company_meta' => null,
            'location' => $location,
            'location_city' => $locationParts['city'],
            'location_province' => $locationParts['province'],
            'location_country' => 'ID',
            'remote_type' => $this->normalizationService->detectRemoteType((string) ($scrapedJob->employment_type ?? '')),
            'job_type' => $scrapedJob->employment_type
                ? $this->normalizationService->mapJobType((string) $scrapedJob->employment_type)
                : null,
            'salary_text' => $scrapedJob->salary,
            'salary_min' => $salary['min'],
            'salary_max' => $salary['max'],
            'salary_currency' => $salary['currency'],
            'salary_period' => $salary['period'],
            'salary_is_disclosed' => $salary['is_disclosed'],
            'experience_level' => $this->normalizationService->mapExperienceLevel(
                $this->normalizationService->normalizeString($scrapedJob->title)
            ),
            'experience_years_min' => null,
            'experience_years_max' => null,
            'education_level' => null,
            'description' => $description,
            'raw_description' => $scrapedJob->description,
            'requirements' => $this->normalizationService->extractBullets($description),
            'responsibilities' => [],
            'skills' => $this->normalizationService->extractSkills($description),
            'benefits' => $this->normalizationService->extractBenefits($description),
            'apply_url' => $scrapedJob->source_url,
            'source_url' => $scrapedJob->source_url,
            'source_url_hash' => $this->jobHashService->makeSourceUrlHash($scrapedJob->source_url),
            'source_name' => Str::title($scrapedJob->source),
            'content_hash' => $this->jobHashService->makeContentHash(
                $scrapedJob->title,
                $scrapedJob->company,
                $scrapedJob->location ?? '',
            ),
            'status' => 'published',
            'scraped_at' => $scrapedJob->scraped_at ?? now(),
            'posted_at' => $scrapedJob->posted_date ? Carbon::parse($scrapedJob->posted_date) : null,
            'published_at' => now(),
            'expires_at' => null,
            'is_active' => true,
            'tags' => [],
            'unified_payload' => [
                'source' => $scrapedJob->source,
                'raw' => $scrapedJob->raw_json,
            ],
        ];
    }
}
