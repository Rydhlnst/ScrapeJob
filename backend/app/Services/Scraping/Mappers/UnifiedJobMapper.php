<?php

namespace App\Services\Scraping\Mappers;

use App\Services\Jobs\JobNormalizationService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class UnifiedJobMapper
{
    public function __construct(private readonly JobNormalizationService $normalizationService) {}

    public function map(array $raw, string $source): array
    {
        $title = trim((string) ($raw['title'] ?? $raw['name'] ?? ''));
        $company = trim((string) data_get($raw, 'company.name', data_get($raw, 'hiringOrganization.name', $raw['company'] ?? '')));
        $locationParts = $this->normalizationService->parseLocation((string) ($raw['location'] ?? data_get($raw, 'jobLocation.address.addressLocality', '')));
        $salary = $this->normalizationService->parseSalary((string) ($raw['salary'] ?? data_get($raw, 'baseSalary.value.value', $raw['salary_text'] ?? '')));
        $experience = $this->normalizationService->parseExperience((string) ($raw['experience'] ?? $raw['requirements_text'] ?? ''));

        $description = $this->normalizationService->sanitizeDescription((string) ($raw['description'] ?? data_get($raw, 'description', '')));
        $requirements = $this->normalizationService->extractBullets((string) ($raw['requirements_text'] ?? $description));
        $responsibilities = $this->normalizationService->extractBullets((string) ($raw['responsibilities_text'] ?? $description));
        $skills = $this->normalizationService->extractSkills($description);

        $sourceId = (string) ($raw['id'] ?? $raw['jobId'] ?? Str::slug($title.'-'.$company));
        $originalUrl = (string) ($raw['original_url'] ?? $raw['url'] ?? $raw['jobUrl'] ?? '');

        return [
            'id' => strtolower($source).'_'.$sourceId,
            'source' => strtolower($source),
            'scraped_at' => now()->toIso8601String(),
            'title' => $title,
            'company' => [
                'name' => $company,
                'logo_url' => data_get($raw, 'company.logo_url'),
                'industry' => data_get($raw, 'company.industry'),
                'size' => data_get($raw, 'company.size'),
            ],
            'location' => [
                'city' => $locationParts['city'],
                'province' => $locationParts['province'],
                'country' => 'ID',
                'remote_type' => $this->normalizationService->detectRemoteType((string) ($raw['remote_type'] ?? $description)),
            ],
            'salary' => $salary,
            'job_type' => $this->normalizationService->mapJobType((string) ($raw['job_type'] ?? data_get($raw, 'employmentType', ''))),
            'experience_level' => $experience['level'],
            'experience_years' => ['min' => $experience['min'], 'max' => $experience['max']],
            'education' => $this->normalizationService->mapEducation((string) ($raw['education'] ?? $description)),
            'description' => $description,
            'requirements' => $requirements,
            'responsibilities' => $responsibilities,
            'skills' => $skills,
            'benefits' => $this->normalizationService->extractBenefits($description),
            'apply_url' => (string) ($raw['apply_url'] ?? $originalUrl),
            'original_url' => $originalUrl,
            'posted_at' => $this->isoDate($raw['posted_at'] ?? data_get($raw, 'datePosted')),
            'expires_at' => $this->isoDate($raw['expires_at'] ?? data_get($raw, 'validThrough')),
            'is_active' => true,
            'tags' => array_values(array_unique(array_filter([$source, $locationParts['city'], $experience['level']]))),
            '_external_id' => $sourceId,
        ];
    }

    private function isoDate(mixed $value): ?string
    {
        if (! $value) {
            return null;
        }
        try {
            return Carbon::parse((string) $value)->toIso8601String();
        } catch (\Throwable) {
            return null;
        }
    }
}
