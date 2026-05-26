<?php

namespace App\Services\Scraping\Scrapers;

use App\Models\JobSource;
use App\Services\Scraping\Support\HtmlJsonLdExtractor;

class JobstreetScraper extends BaseScraper
{
    public function __construct(
        \App\Services\Scraping\Http\ScraperHttpClient $client,
        private readonly HtmlJsonLdExtractor $jsonLdExtractor,
    ) {
        parent::__construct($client);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function scrapeJobs(JobSource $jobSource, array $options = []): array
    {
        $items = [];
        $keywords = config('scraper.jobstreet.keywords', ['software', 'developer', 'engineer']);

        foreach ($keywords as $keyword) {
            for ($page = 1; $page <= 5; $page++) {
                $baseUrl = $jobSource->listing_url ?: 'https://www.jobstreet.co.id/en/job-search/'.$keyword.'-jobs';
                $url = $baseUrl.'?page='.$page;

                try {
                    $html = $this->client->rawHtml($url);
                } catch (\Throwable) {
                    break;
                }

                $postings = $this->jsonLdExtractor->extractJobPostings($html);
                if ($postings === []) {
                    break;
                }

                foreach ($postings as $posting) {
                    $originalUrl = (string) ($posting['url'] ?? '');
                    $items[] = [
                        'id' => (string) data_get($posting, 'identifier.value', sha1($originalUrl)),
                        'title' => (string) ($posting['title'] ?? ''),
                        'company' => ['name' => (string) data_get($posting, 'hiringOrganization.name', '')],
                        'location' => (string) data_get($posting, 'jobLocation.address.addressLocality', ''),
                        'job_type' => $this->normalizeJobType((string) ($posting['employmentType'] ?? '')),
                        'salary' => (string) data_get($posting, 'baseSalary.value.value', ''),
                        'description' => (string) ($posting['description'] ?? ''),
                        'url' => $originalUrl,
                        'original_url' => $originalUrl,
                        'posted_at' => data_get($posting, 'datePosted'),
                        'expires_at' => data_get($posting, 'validThrough'),
                    ];
                }
            }
        }

        return $items;
    }
}
