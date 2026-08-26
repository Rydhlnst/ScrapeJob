<?php

namespace App\Jobs;

use App\Models\ScrapeRun;
use App\Services\Scraping\ScrapeExecutionService;
use App\Services\Scraping\ScraperManager;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class ScrapeJobsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 720;

    public int $backoff = 30;

    public function __construct(
        public readonly ?string $source = null,
        public readonly ?int $createdBy = null,
        public readonly ?string $keyword = null,
        public readonly ?string $location = null,
        public readonly ?\App\Models\ScrapeRun $scrapeRun = null,
    ) {}

    public function handle(ScrapeExecutionService $executionService, ScraperManager $scraperManager): void
    {
        if ($this->source === null || trim($this->source) === '') {
            foreach ($scraperManager->activeSources() as $sourceName) {
                self::dispatch($sourceName, $this->createdBy, $this->keyword, $this->location);
            }

            return;
        }

        $executionService->runBySourceName($this->source, $this->createdBy, $this->keyword, $this->location, $this->scrapeRun);
    }

    public function failed(?Throwable $exception): void
    {
        if (! $this->scrapeRun) {
            return;
        }

        $run = ScrapeRun::query()->find($this->scrapeRun->getKey());
        if (! $run) {
            return;
        }

        $run->update([
            'status' => 'failed',
            'finished_at' => now(),
            'error_message' => $exception?->getMessage() ?: 'Scrape queue job failed.',
        ]);
    }
}
