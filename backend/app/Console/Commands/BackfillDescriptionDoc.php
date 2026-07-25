<?php

namespace App\Console\Commands;

use App\Models\Job;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Throwable;

// Fase C.3: convert legacy HTML descriptions into ProseMirror JSON so the
// public renderer can switch to `description_doc` for every job. Idempotent —
// skips rows that already have description_doc populated. Chunks by id so we
// don't hold the whole table in memory.
//
// Usage:
//   php artisan jobs:backfill-description-doc                # dry-run: count only
//   php artisan jobs:backfill-description-doc --apply         # actually write
//   php artisan jobs:backfill-description-doc --apply --limit=500
class BackfillDescriptionDoc extends Command
{
    protected $signature = 'jobs:backfill-description-doc
                            {--apply : Actually write description_doc (otherwise dry-run)}
                            {--limit= : Cap the number of rows processed}
                            {--chunk=100 : Chunk size for id-range iteration}';

    protected $description = 'Populate jobs.description_doc by converting the legacy HTML description via the Next.js html-to-doc endpoint';

    public function handle(): int
    {
        $apply = (bool) $this->option('apply');
        $limit = $this->option('limit') !== null ? (int) $this->option('limit') : null;
        $chunkSize = max(1, (int) $this->option('chunk'));

        $endpoint = rtrim((string) config('services.html_to_doc.url', env('HTML_TO_DOC_URL', '')), '/');
        $token = (string) config('services.html_to_doc.token', env('SCRAPER_INTERNAL_API_TOKEN', ''));

        if ($endpoint === '' || $token === '') {
            $this->error('Missing HTML_TO_DOC_URL / SCRAPER_INTERNAL_API_TOKEN env — cannot call converter.');
            return self::FAILURE;
        }

        $query = Job::query()
            ->whereNull('description_doc')
            ->whereNotNull('description')
            ->where('description', '!=', '');

        $total = (clone $query)->count();
        $this->info("Rows needing backfill: {$total}");
        if ($total === 0) {
            $this->info('Nothing to do.');
            return self::SUCCESS;
        }
        if (! $apply) {
            $this->warn('Dry-run — pass --apply to perform writes.');
            return self::SUCCESS;
        }

        $processed = 0;
        $failed = 0;
        $bar = $this->output->createProgressBar($limit ?? $total);
        $bar->start();

        $query->orderBy('id')->chunkById($chunkSize, function ($jobs) use ($endpoint, $token, $limit, &$processed, &$failed, $bar) {
            foreach ($jobs as $job) {
                if ($limit !== null && $processed >= $limit) return false;

                try {
                    $response = Http::withToken($token)
                        ->timeout(20)
                        ->acceptJson()
                        ->post("{$endpoint}/api/internal/html-to-doc", [
                            'html' => (string) $job->description,
                        ]);

                    if (! $response->successful()) {
                        $failed++;
                        $this->newLine();
                        $this->warn("Job {$job->id}: HTTP {$response->status()}");
                        continue;
                    }

                    $doc = $response->json('data');
                    if (! is_array($doc)) {
                        $failed++;
                        continue;
                    }
                    $job->update(['description_doc' => $doc]);
                    $processed++;
                } catch (Throwable $e) {
                    $failed++;
                    $this->newLine();
                    $this->warn("Job {$job->id}: {$e->getMessage()}");
                }
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine(2);
        $this->info("Done — processed {$processed}, failed {$failed}.");

        return $failed === 0 ? self::SUCCESS : self::FAILURE;
    }
}
