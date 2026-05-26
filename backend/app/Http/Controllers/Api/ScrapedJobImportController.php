<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImportScrapedJobsRequest;
use App\Services\ScrapedJobImportService;

class ScrapedJobImportController extends Controller
{
    public function __construct(
        private readonly ScrapedJobImportService $importService,
    ) {}

    public function __invoke(ImportScrapedJobsRequest $request)
    {
        $payload = $request->validated();
        $summary = $this->importService->import(
            source: $payload['source'],
            scrapedAt: $payload['scraped_at'] ?? null,
            jobs: $payload['jobs'],
        );

        return response()->json([
            'success' => true,
            'message' => 'Scraped jobs imported successfully.',
            'summary' => $summary,
        ]);
    }
}
