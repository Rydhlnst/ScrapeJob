<?php

namespace App\Services\Scraping\Scrapers;

use App\Models\JobSource;

class ApiJsonJobScraper extends BaseScraper
{
    /**
     * @return array<int, array<string, mixed>>
     */
    protected function scrapeJobs(JobSource $jobSource, array $options = []): array
    {
        $apiUrl = (string) ($options['api_url'] ?? '');
        if ($apiUrl === '') {
            return [];
        }

        $params = (array) ($options['api_params'] ?? []);
        $map = (array) ($options['json_map'] ?? []);

        $response = $this->client->json($apiUrl, $params);
        $items = data_get($response, (string) ($map['list'] ?? 'data'), []);

        if (! is_array($items)) {
            return [];
        }

        $normalized = [];

        foreach ($items as $item) {
            if (! is_array($item)) {
                continue;
            }

            $title = (string) data_get($item, (string) ($map['title'] ?? 'title'), '');
            if ($title === '') {
                continue;
            }

            $url = (string) data_get($item, (string) ($map['apply_url'] ?? 'url'), $jobSource->listing_url ?? $jobSource->base_url);

            $normalized[] = [
                'id' => (string) data_get($item, (string) ($map['id'] ?? 'id'), sha1($title.$url)),
                'title' => $title,
                'company' => [
                    'name' => (string) data_get($item, (string) ($map['company'] ?? 'company'), strtolower($jobSource->name)),
                ],
                'location' => (string) data_get($item, (string) ($map['location'] ?? 'location'), ''),
                'job_type' => $this->normalizeJobType((string) data_get($item, (string) ($map['job_type'] ?? 'job_type'), '')),
                'salary' => (string) data_get($item, (string) ($map['salary'] ?? 'salary'), ''),
                'description' => (string) data_get($item, (string) ($map['description'] ?? 'description'), ''),
                'url' => $url,
                'original_url' => $url,
                'posted_at' => data_get($item, (string) ($map['posted_at'] ?? 'posted_at')),
                'expires_at' => data_get($item, (string) ($map['expires_at'] ?? 'expires_at')),
            ];
        }

        return $normalized;
    }
}
