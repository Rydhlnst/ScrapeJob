<?php

namespace App\Services\Jobs;

use App\Models\Job;

class JobDeduplicationService
{
    public function __construct(
        private readonly JobHashService $hashService,
        private readonly JobNormalizationService $normalizationService,
    ) {}

    public function detectDuplicate(string $sourceUrl, string $title, string $companyName, string $location): ?array
    {
        $sourceUrlHash = $this->hashService->makeSourceUrlHash($sourceUrl);

        $duplicateByUrl = Job::query()
            ->where('source_url_hash', $sourceUrlHash)
            ->first();

        if ($duplicateByUrl) {
            return ['type' => 'source_url', 'job' => $duplicateByUrl];
        }

        $contentHash = $this->hashService->makeContentHash(
            $this->normalizationService->normalizeString($title),
            $this->normalizationService->normalizeString($companyName),
            $this->normalizationService->normalizeString($location),
        );

        $duplicateByHash = Job::query()
            ->where('content_hash', $contentHash)
            ->first();

        if ($duplicateByHash) {
            return ['type' => 'content_hash', 'job' => $duplicateByHash];
        }

        return null;
    }
}

