<?php

namespace App\Services\Scraping\Scrapers;

use App\Models\JobSource;
use Symfony\Component\DomCrawler\Crawler;

class GenericHtmlJobScraper extends BaseScraper
{
    /**
     * @return array<int, array<string, mixed>>
     */
    protected function scrapeJobs(JobSource $jobSource, array $options = []): array
    {
        $selectors = (array) ($options['selectors'] ?? []);
        $container = (string) ($selectors['container'] ?? '.job-card');
        $listUrl = (string) ($options['list_url'] ?? $jobSource->listing_url ?? $jobSource->base_url);

        if ($listUrl === '') {
            return [];
        }

        $maxPages = (int) data_get($options, 'pagination.max_pages', 1);
        $pattern = data_get($options, 'pagination.pattern');

        $items = [];

        for ($page = 1; $page <= max(1, $maxPages); $page++) {
            $url = is_string($pattern) ? str_replace('{page}', (string) $page, $pattern) : $listUrl;

            try {
                $html = $this->client->rawHtml($url);
            } catch (\Throwable) {
                break;
            }

            $crawler = new Crawler($html);
            $nodes = $crawler->filter($container);

            if ($nodes->count() === 0) {
                break;
            }

            foreach ($nodes as $node) {
                $job = $this->extractFromNode(new Crawler($node), $selectors, $listUrl, strtolower($jobSource->name));
                if ($job !== null) {
                    $items[] = $job;
                }
            }
        }

        return $items;
    }

    /**
     * @param array<string, mixed> $selectors
     * @return array<string, mixed>|null
     */
    private function extractFromNode(Crawler $node, array $selectors, string $listUrl, string $sourceName): ?array
    {
        $read = function (string $key) use ($node, $selectors): ?string {
            $selectorValue = (string) ($selectors[$key] ?? '');
            if ($selectorValue === '') {
                return null;
            }

            [$selector, $attr] = array_pad(explode('@', $selectorValue, 2), 2, null);

            try {
                $el = $node->filter(trim($selector))->first();
            } catch (\Throwable) {
                return null;
            }

            if ($el->count() === 0) {
                return null;
            }

            return $attr ? $el->attr($attr) : trim((string) $el->text('', false));
        };

        $title = (string) ($read('title') ?? '');
        if ($title === '') {
            return null;
        }

        $applyUrl = (string) ($read('apply_url') ?? $listUrl);
        if ($applyUrl !== '' && ! str_starts_with($applyUrl, 'http')) {
            $base = parse_url($listUrl);
            if ($base !== false && isset($base['scheme'], $base['host'])) {
                $applyUrl = $base['scheme'].'://'.$base['host'].$applyUrl;
            }
        }

        return [
            'id' => sha1($sourceName.'|'.$title.'|'.$applyUrl),
            'title' => $title,
            'company' => ['name' => (string) ($read('company') ?? $sourceName)],
            'location' => (string) ($read('location') ?? ''),
            'job_type' => $this->normalizeJobType((string) ($read('job_type') ?? '')),
            'description' => (string) ($read('description') ?? ''),
            'url' => $applyUrl,
            'original_url' => $applyUrl,
            'posted_at' => $read('posted_at'),
        ];
    }
}
