<?php

namespace App\Services\Scraping;

use App\Models\JobSource;
use App\Models\ScrapeRun;
use App\Services\ScrapedJobImportService;
use Illuminate\Support\Str;

class ScrapeExecutionService
{
    public function __construct(
        private readonly ScraperManager $scraperManager,
        private readonly PythonScraperExecutor $pythonExecutor,
        private readonly ScrapedJobImportService $importService,
    ) {}

    /**
     * @return array<int, ScrapeRun>
     */
    public function runBySourceName(?string $sourceName = null, ?int $createdBy = null, ?string $keyword = null, ?string $location = null, ?ScrapeRun $run = null): array
    {
        if ($sourceName !== null && trim($sourceName) !== '') {
            return [$this->runSingle($this->resolveSource($sourceName), $createdBy, $keyword, $location, $run)];
        }

        $runs = [];

        foreach ($this->scraperManager->activeSources() as $activeSource) {
            $runs[] = $this->runSingle($this->resolveSource($activeSource), $createdBy, $keyword, $location);
        }

        return $runs;
    }

    public function runSingle(JobSource $source, ?int $createdBy = null, ?string $keyword = null, ?string $location = null, ?ScrapeRun $run = null): ScrapeRun
    {
        if (! $source->scraping_allowed) {
            throw new \InvalidArgumentException('Scraping is not allowed for this source.');
        }

        if ($run) {
            $run->update([
                'status' => 'running',
                'started_at' => now(),
            ]);
        } else {
            $run = ScrapeRun::query()->create([
                'job_source_id' => $source->exists ? $source->id : null,
                'source_name' => $source->name,
                'status' => 'running',
                'started_at' => now(),
                'created_by' => $createdBy,
            ]);
        }

        try {
            if (! (bool) config('scraper.use_python_executor', true)) {
                throw new \RuntimeException('Laravel native scraper executor is disabled for PRD-aligned workflow.');
            }

            $result = $this->pythonExecutor->run($source, $keyword, $location);
            $ingested = $this->importService->import(
                source: (string) ($result['source'] ?? strtolower($source->name)),
                scrapedAt: $result['scraped_at'] ?? null,
                jobs: (array) ($result['jobs'] ?? []),
            );

            $errors = (int) ($ingested['error_count'] ?? 0);
            $scraperError = trim((string) ($result['error'] ?? ''));
            $status = $errors > 0 || $scraperError !== '' ? 'partial' : 'success';

            $run->update([
                'status' => $status,
                'finished_at' => now(),
                'total_found' => (int) ($result['total'] ?? 0),
                'mapped_count' => (int) ($ingested['received'] ?? 0),
                'success_count' => (int) (($ingested['created_count'] ?? 0) + ($ingested['updated_count'] ?? 0)),
                'duplicate_count' => (int) ($ingested['duplicate_count'] ?? 0),
                'failed_count' => $errors,
                'error_count' => $errors,
                'skipped_count' => (int) ($ingested['duplicate_count'] ?? 0),
                'error_message' => $scraperError !== ''
                    ? Str::limit($scraperError, 65535, '')
                    : null,
                'sample_payloads' => array_slice((array) ($result['jobs'] ?? []), 0, 3),
            ]);

            if ($source->exists) {
                $source->update(['last_scraped_at' => now()]);
            }
        } catch (\Throwable $exception) {
            $run->update([
                'status' => 'failed',
                'finished_at' => now(),
                'error_message' => Str::limit($exception->getMessage(), 65535, ''),
            ]);

            throw $exception;
        }

        return $run->refresh();
    }

    private function resolveSource(string $sourceName): JobSource
    {
        $normalized = strtolower(trim($sourceName));

        $source = JobSource::query()
            ->whereRaw('LOWER(name) = ?', [$normalized])
            ->first();

        if ($source) {
            return $source;
        }

        $source = new JobSource();
        $configured = data_get(config('scraper.builtin_sources', []), $normalized, []);

        $source->name = $normalized;
        $source->base_url = (string) data_get($configured, 'base_url', data_get($configured, 'api_url', data_get($configured, 'target_url', '')));
        $source->listing_url = (string) data_get($configured, 'list_url', data_get($configured, 'target_url', ''));
        $source->notes = is_array($configured) && $configured !== [] ? json_encode($configured) : null;
        $source->is_active = true;
        $source->scraping_allowed = true;

        return $source;
    }
}
