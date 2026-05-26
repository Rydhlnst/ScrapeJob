<?php

namespace App\Console\Commands;

use App\Jobs\ScrapeJobsJob;
use App\Jobs\SendJobNotificationJob;
use App\Services\Scraping\ScrapeExecutionService;
use App\Services\Scraping\ScraperManager;
use Illuminate\Console\Command;

class ScrapeJobsCommand extends Command
{
    protected $signature = 'jobs:scrape
                            {source? : Source name. Empty = all active sources}
                            {--keyword= : Keyword for scrape run}
                            {--location= : Location filter for scrape run}
                            {--queue : Dispatch scraping to queue}
                            {--notify : Send notification after scraping}
                            {--list : List available sources}';

    protected $description = 'Scrape jobs from all active or selected source';

    public function handle(ScraperManager $manager, ScrapeExecutionService $executionService): int
    {
        if ($this->option('list')) {
            $this->table(
                ['Source', 'Active'],
                collect($manager->availableSources())
                    ->map(fn (string $source): array => [
                        $source,
                        in_array($source, $manager->activeSources(), true) ? 'yes' : 'no',
                    ])
                    ->values()
                    ->all()
            );

            return self::SUCCESS;
        }

        $source = $this->argument('source');
        $keyword = $this->option('keyword');
        $location = $this->option('location');

        if ($this->option('queue')) {
            ScrapeJobsJob::dispatch($source ?: null, null, $keyword ?: null, $location ?: null);
            $this->info('Scrape job dispatched to queue.');

            if ($this->option('notify')) {
                SendJobNotificationJob::dispatch()->delay(now()->addMinutes(5));
                $this->info('Notification job scheduled.');
            }

            return self::SUCCESS;
        }

        $runs = $executionService->runBySourceName($source ?: null, null, $keyword ?: null, $location ?: null);

        foreach ($runs as $run) {
            $this->line(sprintf(
                '%s => status=%s found=%d success=%d duplicate=%d failed=%d',
                strtolower($run->source_name),
                $run->status,
                (int) $run->total_found,
                (int) $run->success_count,
                (int) $run->duplicate_count,
                (int) $run->failed_count,
            ));
        }

        if ($this->option('notify')) {
            SendJobNotificationJob::dispatch();
            $this->info('Notification job dispatched.');
        }

        return self::SUCCESS;
    }
}
