<?php

namespace App\Services\Scraping\Http;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class ScraperHttpClient
{
    /**
     * @var array<int, string>
     */
    private array $userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
    ];

    public function request(string $url, array $query = [], array $headers = [], string $method = 'get'): Response
    {
        $request = Http::acceptJson()
            ->timeout(25)
            ->connectTimeout(10)
            ->retry(3, function (int $attempt): int {
                return random_int(300 * $attempt, 700 * $attempt);
            })
            ->withHeaders(array_merge([
                'User-Agent' => $this->randomUserAgent(),
                'Accept-Language' => 'id-ID,id;q=0.9,en-US;q=0.8',
            ], $headers));

        return strtolower($method) === 'post'
            ? $request->post($url, $query)
            : $request->get($url, $query);
    }

    public function rawHtml(string $url, array $query = [], array $headers = []): string
    {
        return $this->request($url, $query, array_merge(['Accept' => 'text/html,application/xhtml+xml'], $headers))
            ->throw()
            ->body();
    }

    public function json(string $url, array $query = [], array $headers = [], string $method = 'get'): array
    {
        return $this->request($url, $query, $headers, $method)
            ->throw()
            ->json() ?? [];
    }

    public function pending(array $headers = []): PendingRequest
    {
        return Http::timeout(25)
            ->connectTimeout(10)
            ->retry(3, function (int $attempt): int {
                return random_int(300 * $attempt, 700 * $attempt);
            })
            ->withHeaders(array_merge([
                'User-Agent' => $this->randomUserAgent(),
                'Accept-Language' => 'id-ID,id;q=0.9,en-US;q=0.8',
            ], $headers));
    }

    private function randomUserAgent(): string
    {
        return $this->userAgents[array_rand($this->userAgents)];
    }
}
