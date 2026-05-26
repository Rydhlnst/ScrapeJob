<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\TriggerScraperRequest;
use App\Http\Resources\ScrapeLogResource;
use App\Jobs\ScrapeJobsJob;
use App\Models\ScrapeLog;
use App\Services\Scraping\ScraperManager;
use App\Support\ApiResponse;

class ScraperController extends Controller
{
    public function trigger(TriggerScraperRequest $request, ScraperManager $manager)
    {
        $source = $request->string('source')->trim()->value() ?: null;

        if ($source !== null && ! in_array(strtolower($source), $manager->availableSources(), true)) {
            return ApiResponse::error('Unknown scraper source.', 422);
        }

        ScrapeJobsJob::dispatch($source);

        return ApiResponse::success([
            'source' => $source ?? 'all',
            'queued' => true,
        ], 'Scrape job queued successfully.');
    }

    public function logs(TriggerScraperRequest $request)
    {
        $perPage = min(max((int) $request->query('perPage', 25), 1), 100);

        $logs = ScrapeLog::query()
            ->select([
                'id',
                'scrape_run_id',
                'url',
                'title',
                'status',
                'message',
                'payload',
                'created_at',
            ])
            ->with(['scrapeRun:id,source_name,status,started_at,finished_at'])
            ->when($request->filled('source'), function ($query) use ($request): void {
                $source = strtolower($request->string('source')->value());
                $query->whereHas('scrapeRun', function ($runQuery) use ($source): void {
                    $runQuery->whereRaw('LOWER(source_name) = ?', [$source]);
                });
            })
            ->latest('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return ApiResponse::paginated($logs, ScrapeLogResource::collection($logs)->resolve(), 'Scraper logs retrieved successfully');
    }
}
