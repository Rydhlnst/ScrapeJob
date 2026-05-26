<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RunScrapeRequest;
use App\Http\Resources\ScrapeLogResource;
use App\Http\Resources\ScrapeRunResource;
use App\Models\JobSource;
use App\Models\ScrapeRun;
use App\Services\Scraping\ScrapeExecutionService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class ScrapeRunController extends Controller
{
    public function __construct(
        private readonly ScrapeExecutionService $executionService,
    ) {}

    public function index(Request $request)
    {
        $perPage = min(max((int) $request->query('perPage', 15), 1), 100);

        $runs = ScrapeRun::query()
            ->select([
                'id',
                'job_source_id',
                'source_name',
                'status',
                'started_at',
                'finished_at',
                'total_found',
                'mapped_count',
                'success_count',
                'duplicate_count',
                'failed_count',
                'error_count',
                'skipped_count',
                'error_message',
                'sample_payloads',
                'created_by',
                'created_at',
            ])
            ->with(['jobSource:id,name', 'creator:id,name,email'])
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return ApiResponse::paginated($runs, ScrapeRunResource::collection($runs)->resolve(), 'Scrape runs retrieved successfully');
    }

    public function run(RunScrapeRequest $request)
    {
        $sourceName = strtolower(trim($request->string('source')->value()));
        $keyword = $request->filled('keyword') ? $request->string('keyword')->trim()->value() : null;
        $location = $request->filled('location') ? $request->string('location')->trim()->value() : null;
        $source = JobSource::query()->whereRaw('LOWER(name) = ?', [$sourceName])->first();

        if (! $source || ! $source->is_active) {
            return ApiResponse::error('Source is not active or not found.', 422);
        }

        if (! $source->scraping_allowed) {
            return ApiResponse::error('Scraping is not allowed for this source.', 422);
        }

        try {
            $runs = $this->executionService->runBySourceName(
                $sourceName,
                optional($request->user())->id,
                $keyword,
                $location
            );
            $scrapeRun = $runs[0] ?? null;
        } catch (\Throwable $exception) {
            return ApiResponse::error('Scrape run failed: '.$exception->getMessage(), 500);
        }

        if (! $scrapeRun) {
            return ApiResponse::error('Scrape run failed to start.', 500);
        }

        return ApiResponse::success(new ScrapeRunResource($scrapeRun->load(['jobSource', 'creator'])), 'Scrape run triggered successfully');
    }

    public function show(string $id)
    {
        $run = ScrapeRun::query()
            ->with(['jobSource:id,name', 'creator:id,name,email', 'scrapeLogs'])
            ->findOrFail($id);

        return ApiResponse::success(new ScrapeRunResource($run), 'Scrape run retrieved successfully');
    }

    public function logs(string $id, Request $request)
    {
        $run = ScrapeRun::query()->findOrFail($id);
        $perPage = min(max((int) $request->query('perPage', 25), 1), 100);

        $logs = $run->scrapeLogs()
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
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return ApiResponse::paginated($logs, ScrapeLogResource::collection($logs)->resolve(), 'Scrape logs retrieved successfully');
    }
}
