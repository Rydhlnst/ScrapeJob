<?php

namespace App\Services\Scraping\Support;

class HtmlJsonLdExtractor
{
    public function extractJobPostings(string $html): array
    {
        preg_match_all('/<script[^>]*type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/is', $html, $matches);

        $items = [];
        foreach ($matches[1] ?? [] as $block) {
            $decoded = json_decode(trim($block), true);
            if (! is_array($decoded)) {
                continue;
            }

            $candidates = isset($decoded[0]) ? $decoded : [$decoded];
            foreach ($candidates as $candidate) {
                if (! is_array($candidate)) {
                    continue;
                }
                if (($candidate['@type'] ?? null) === 'JobPosting') {
                    $items[] = $candidate;
                }
                if (($candidate['@graph'] ?? null) && is_array($candidate['@graph'])) {
                    foreach ($candidate['@graph'] as $graphItem) {
                        if (($graphItem['@type'] ?? null) === 'JobPosting') {
                            $items[] = $graphItem;
                        }
                    }
                }
            }
        }

        return $items;
    }
}
