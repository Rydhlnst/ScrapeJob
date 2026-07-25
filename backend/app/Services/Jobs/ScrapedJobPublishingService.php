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
        $payload = $this->toJobPayload($scrapedJob, 'published');

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

    private function shouldAutoPublish(): bool
    {
        // Admin can toggle this in /admin/settings — when true, approved
        // scraped jobs skip the manual editorial pass and are published as
        // soon as they move to draft.
        return (bool) \App\Models\Setting::get('auto_publish_jobs', false);
    }

    public function moveToDraft(ScrapedJob $scrapedJob): array
    {
        $payload = $this->toJobPayload($scrapedJob, 'draft');

        $existingByScrapedJob = Job::query()
            ->where('scraped_job_id', $scrapedJob->id)
            ->first();

        if ($existingByScrapedJob) {
            $existingByScrapedJob->update([
                ...$payload,
                'notified' => $existingByScrapedJob->notified,
                'published_at' => null,
            ]);
            $scrapedJob->update(['status' => 'approved']);

            return ['result' => 'updated', 'job' => $existingByScrapedJob->refresh()];
        }

        $existingDraftByUrl = Job::query()
            ->where('source_url_hash', $payload['source_url_hash'])
            ->where('status', 'draft')
            ->first();

        if ($existingDraftByUrl) {
            $existingDraftByUrl->update([
                ...$payload,
                'notified' => $existingDraftByUrl->notified,
                'published_at' => null,
            ]);
            $scrapedJob->update(['status' => 'approved']);

            return ['result' => 'updated', 'job' => $existingDraftByUrl->refresh()];
        }

        $hasDuplicate = Job::query()
            ->where(function ($query) use ($payload) {
                $query->where('source_url_hash', $payload['source_url_hash'])
                    ->orWhere('fingerprint', $payload['fingerprint'])
                    ->orWhere('content_hash', $payload['content_hash']);
            })
            ->exists();

        if ($hasDuplicate) {
            $scrapedJob->update(['status' => 'duplicate']);

            return ['result' => 'duplicate', 'job' => null];
        }

        $job = Job::query()->create($payload + ['notified' => false]);
        $scrapedJob->update(['status' => 'approved']);

        if ($this->shouldAutoPublish()) {
            $this->publish($scrapedJob);

            return ['result' => 'auto-published', 'job' => $job->refresh()];
        }

        return ['result' => 'created', 'job' => $job];
    }

    private function toJobPayload(ScrapedJob $scrapedJob, string $status): array
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
            'status' => $status,
            'scraped_at' => $scrapedJob->scraped_at ?? now(),
            'posted_at' => $scrapedJob->posted_date ? Carbon::parse($scrapedJob->posted_date) : null,
            'published_at' => $status === 'published' ? now() : null,
            'expires_at' => null,
            'is_active' => true,
            'tags' => [],
            'unified_payload' => [
                'source' => $scrapedJob->source,
                'raw' => $scrapedJob->raw_json,
                'editorial' => [
                    'pipeline' => 'ai_cleaned_scraped_job',
                    'draftStatus' => $scrapedJob->draft_status,
                    'cleanedByAi' => $scrapedJob->draft_status === 'drafted_ai',
                    'descriptionSummary' => $scrapedJob->description_summary,
                ],
            ],
        ];
    }
}
