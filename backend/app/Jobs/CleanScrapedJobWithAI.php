<?php

namespace App\Jobs;

use App\Models\ScrapedJob;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CleanScrapedJobWithAI implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly ScrapedJob $scrapedJob
    ) {
        $this->queue = 'ai-cleanup';
    }

    /**
     * Get the middleware the job should pass through.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new RateLimited('ai-cleanup')];
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // 1. Check if AI Cleanup is enabled in services configuration
        $config = config('services.ai_cleanup');
        if (! ($config['enabled'] ?? true)) {
            Log::info("AI Scraped Job cleanup is disabled. Skipping job: {$this->scrapedJob->id}");
            return;
        }

        $url = $config['url'];
        $token = $config['token'];

        Log::info("Starting AI cleanup for scraped job ID: {$this->scrapedJob->id}, title: {$this->scrapedJob->title}");

        // 2. Prepare payload from raw scraped job details
        $payload = [
            'title' => $this->scrapedJob->title,
            'company' => $this->scrapedJob->company,
            'location' => $this->scrapedJob->location,
            'salary' => $this->scrapedJob->salary,
            'employment_type' => $this->scrapedJob->employment_type,
            'description' => $this->scrapedJob->description,
        ];

        try {
            // 3. Make HTTP request to Next.js API endpoint
            $response = Http::withToken($token)
                ->timeout(60) // AI request might take some time
                ->post($url, $payload);

            $responseData = null;
            try {
                $responseData = $response->json();
            } catch (\Throwable $e) {
                // ignore
            }

            if ($response->status() === 402 ||
                $response->status() === 429 ||
                (is_array($responseData) && isset($responseData['code']) && $responseData['code'] === 'INSUFFICIENT_CREDIT') ||
                (is_array($responseData) && isset($responseData['error']) && str_contains(strtolower($responseData['error']), 'quota')) ||
                (is_array($responseData) && isset($responseData['error']) && str_contains(strtolower($responseData['error']), 'credit'))
            ) {
                $warning = "AI cleanup stopped for job ID: {$this->scrapedJob->id} due to Insufficient Credits or usage limits. Leaving it as Drafted Raw.";
                Log::warning($warning);
                $this->scrapedJob->update([
                    'draft_status' => 'drafted_raw',
                    'fail_reason' => 'AI quota limit or credits exceeded. Processing paused.'
                ]);
                return;
            }

            if ($response->failed()) {
                Log::error("AI cleanup API returned error status {$response->status()} for job ID: {$this->scrapedJob->id}. Body: {$response->body()}");
                throw new \RuntimeException("AI Cleanup API returned error status: " . $response->status());
            }

            if (! is_array($responseData) || ! isset($responseData['success']) || ! $responseData['success'] || ! isset($responseData['data'])) {
                Log::error("AI cleanup API returned invalid format for job ID: {$this->scrapedJob->id}. Body: {$response->body()}");
                throw new \RuntimeException("AI Cleanup API returned invalid payload format");
            }

            // 4. Update the ScrapedJob model with cleaned data
            $cleaned = $responseData['data'];

            $this->scrapedJob->update([
                'title' => $cleaned['title'] ?? $this->scrapedJob->title,
                'company' => $cleaned['company'] ?? $this->scrapedJob->company,
                'location' => $cleaned['location'] ?? $this->scrapedJob->location,
                'salary' => $cleaned['salary'] ?? $this->scrapedJob->salary,
                'employment_type' => $cleaned['employment_type'] ?? $this->scrapedJob->employment_type,
                'description' => $cleaned['description'] ?? $this->scrapedJob->description,
                'description_summary' => $cleaned['description_summary'] ?? $this->scrapedJob->description_summary,
                'draft_status' => 'drafted_ai',
                'fail_reason' => null,
            ]);

            Log::info("Successfully cleaned scraped job ID: {$this->scrapedJob->id} using AI.");

        } catch (\Throwable $exception) {
            $this->scrapedJob->update([
                'fail_reason' => $exception->getMessage(),
            ]);
            Log::error("Failed AI cleanup for scraped job ID: {$this->scrapedJob->id}. Exception: {$exception->getMessage()}");
            throw $exception;
        }
    }
}
