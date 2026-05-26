<?php

namespace App\Services\Scraping\Scrapers;

use App\Models\JobSource;

class GlintsScraper extends BaseScraper
{
    /**
     * @return array<int, array<string, mixed>>
     */
    protected function scrapeJobs(JobSource $jobSource, array $options = []): array
    {
        $items = [];

        $keywords = config('scraper.glints.keywords', ['software engineer', 'backend', 'frontend']);

        foreach ($keywords as $keyword) {
            $baseUrl = $jobSource->listing_url ?: 'https://glints.com/id/opportunities/jobs/explore?keyword=';
            $url = str_contains($baseUrl, '?')
                ? $baseUrl.'&keyword='.urlencode((string) $keyword)
                : $baseUrl.urlencode((string) $keyword);

            $items = array_merge($items, $this->scrapeHtmlListing($url));
        }

        return $items;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function scrapeHtmlListing(string $url): array
    {
        try {
            $html = $this->client->rawHtml($url);
        } catch (\Throwable) {
            return [];
        }

        preg_match_all('/<a[^>]*href="([^"]*\/opportunities\/jobs\/[^"]+)"[^>]*>/i', $html, $urlMatches);
        preg_match_all('/<h3[^>]*>(.*?)<\/h3>/is', $html, $titleMatches);
        preg_match_all('/data-company-name="([^"]+)"/i', $html, $companyMatches);

        $items = [];

        foreach ($urlMatches[1] ?? [] as $index => $href) {
            $finalUrl = str_starts_with($href, 'http') ? $href : 'https://glints.com'.$href;
            $items[] = [
                'id' => sha1($finalUrl),
                'title' => trim(strip_tags($titleMatches[1][$index] ?? '')),
                'company' => ['name' => trim($companyMatches[1][$index] ?? '')],
                'location' => '',
                'job_type' => 'full_time',
                'description' => '',
                'url' => $finalUrl,
                'original_url' => $finalUrl,
            ];
        }

        return $items;
    }
}
