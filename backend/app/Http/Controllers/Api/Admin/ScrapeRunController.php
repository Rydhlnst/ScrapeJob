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
        $status = strtolower(trim((string) $request->query('status', '')));
        $allowedStatuses = ['pending', 'running', 'success', 'partial', 'failed'];

        if ($status !== '' && ! in_array($status, $allowedStatuses, true)) {
            return ApiResponse::error('Invalid scrape run status.', 422);
        }

        $query = ScrapeRun::query()
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
            ->with(['jobSource:id,name', 'creator:id,name,email']);

        if ($status !== '') {
            $query->where('status', $status);
        }

        $runs = $query->latest()->paginate($perPage)->withQueryString();

        return ApiResponse::paginated($runs, ScrapeRunResource::collection($runs)->resolve(), 'Scrape runs retrieved successfully');
    }

    public function run(RunScrapeRequest $request)
    {
        $sourceName = strtolower(trim($request->string('source')->value()));
        $keyword = $request->filled('keyword') ? $request->string('keyword')->trim()->value() : null;
        $location = $request->filled('location') ? $request->string('location')->trim()->value() : null;
        $source = JobSource::query()->whereRaw('LOWER(name) = ?', [$sourceName])->first();

        // Allow built-in sources to run even when they are not persisted yet.
        if ($source && ! $source->is_active) {
            return ApiResponse::error('Source is not active.', 422);
        }

        if ($source && ! $source->scraping_allowed) {
            return ApiResponse::error('Scraping is not allowed for this source.', 422);
        }

        try {
            $scrapeRun = ScrapeRun::query()->create([
                'job_source_id' => $source ? $source->id : null,
                'source_name' => $source ? $source->name : $sourceName,
                'status' => 'pending',
                'started_at' => now(),
                'created_by' => optional($request->user())->id,
            ]);

            \App\Jobs\ScrapeJobsJob::dispatch(
                $sourceName,
                optional($request->user())->id,
                $keyword,
                $location,
                $scrapeRun
            );
        } catch (\Throwable $exception) {
            return ApiResponse::error('Failed to trigger scrape run: '.$exception->getMessage(), 500);
        }

        return ApiResponse::success(new ScrapeRunResource($scrapeRun->refresh()->load(['jobSource', 'creator'])), 'Scrape run triggered successfully');
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
        $status = strtolower(trim((string) $request->query('status', '')));
        $allowedStatuses = ['success', 'failed', 'duplicate', 'skipped'];

        if ($status !== '' && ! in_array($status, $allowedStatuses, true)) {
            return ApiResponse::error('Invalid scrape log status.', 422);
        }

        $query = $run->scrapeLogs()
            ->select([
                'id',
                'scrape_run_id',
                'url',
                'title',
                'status',
                'message',
                'payload',
                'created_at',
            ]);

        if ($status !== '') {
            $query->where('status', $status);
        }

        $logs = $query->latest()->paginate($perPage)->withQueryString();

        return ApiResponse::paginated($logs, ScrapeLogResource::collection($logs)->resolve(), 'Scrape logs retrieved successfully');
    }
}
