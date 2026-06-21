<?php

namespace App\Jobs;

use App\Services\Scraping\ScrapeExecutionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ScrapeJobsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 600;

    public function __construct(
        public readonly ?string $source = null,
        public readonly ?int $createdBy = null,
        public readonly ?string $keyword = null,
        public readonly ?string $location = null,
        public readonly ?\App\Models\ScrapeRun $scrapeRun = null,
    ) {}

    public function handle(ScrapeExecutionService $executionService): void
    {
        $executionService->runBySourceName($this->source, $this->createdBy, $this->keyword, $this->location, $this->scrapeRun);
    }
}
