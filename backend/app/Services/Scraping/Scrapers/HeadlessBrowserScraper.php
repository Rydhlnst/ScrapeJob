<?php

namespace App\Services\Scraping\Scrapers;

use App\Models\JobSource;
use Illuminate\Support\Facades\Log;

class HeadlessBrowserScraper extends BaseScraper
{
    /**
     * @return array<int, array<string, mixed>>
     */
    protected function scrapeJobs(JobSource $jobSource, array $options = []): array
    {
        $targetUrl = (string) ($options['target_url'] ?? $jobSource->listing_url ?? $jobSource->base_url);
        $extract = (array) ($options['extract'] ?? []);

        if ($targetUrl === '') {
            return [];
        }

        $scriptPath = $this->generateScript($jobSource, $targetUrl, $extract);

        try {
            $output = $this->runScript($scriptPath);
            if ($output === null) {
                return [];
            }

            $decoded = json_decode($output, true);
            if (! is_array($decoded)) {
                return [];
            }

            return array_values(array_filter(array_map(function (mixed $item) use ($targetUrl, $jobSource) {
                if (! is_array($item)) {
                    return null;
                }

                $url = (string) ($item['apply_url'] ?? $item['url'] ?? $targetUrl);

                if ($url !== '' && ! str_starts_with($url, 'http')) {
                    $base = parse_url($targetUrl);
                    if ($base !== false && isset($base['scheme'], $base['host'])) {
                        $url = $base['scheme'].'://'.$base['host'].$url;
                    }
                }

                $title = trim((string) ($item['title'] ?? ''));
                if ($title === '') {
                    return null;
                }

                return [
                    'id' => sha1(strtolower($jobSource->name).'|'.$title.'|'.$url),
                    'title' => $title,
                    'company' => ['name' => (string) ($item['company'] ?? strtolower($jobSource->name))],
                    'location' => (string) ($item['location'] ?? ''),
                    'job_type' => $this->normalizeJobType((string) ($item['job_type'] ?? '')),
                    'description' => (string) ($item['description'] ?? ''),
                    'url' => $url,
                    'original_url' => $url,
                    'posted_at' => $item['posted_at'] ?? null,
                ];
            }, $decoded)));
        } finally {
            if (is_file($scriptPath)) {
                @unlink($scriptPath);
            }
        }
    }

    private function generateScript(JobSource $jobSource, string $targetUrl, array $extract): string
    {
        $source = addslashes(strtolower($jobSource->name));
        $url = addslashes($targetUrl);
        $extractJson = json_encode($extract, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $script = <<<JS
const puppeteer = require('puppeteer');

(async () => {
  const extract = {$extractJson};
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36');
    await page.goto('{$url}', { waitUntil: 'networkidle2', timeout: 60000 });

    if (extract.waitForSelector) {
      await page.waitForSelector(extract.waitForSelector, { timeout: 15000 }).catch(() => {});
    }

    if (extract.scrollToBottom) {
      await page.evaluate(async () => {
        for (let i = 0; i < 5; i++) {
          window.scrollBy(0, window.innerHeight);
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      });
    }

    const jobs = await page.evaluate((cfg, source) => {
      const selectors = cfg.jobs || {};
      const containerSelector = selectors.container || '.job-card';
      const nodes = document.querySelectorAll(containerSelector);

      const get = (node, selectorDef) => {
        if (!selectorDef) return null;
        const [selector, attr] = selectorDef.split('@');
        const found = node.querySelector(selector);
        if (!found) return null;
        return attr ? found.getAttribute(attr) : (found.textContent || '').trim();
      };

      return Array.from(nodes).map((node) => ({
        source,
        title: get(node, selectors.title),
        company: get(node, selectors.company),
        location: get(node, selectors.location),
        job_type: get(node, selectors.job_type),
        apply_url: get(node, selectors.url),
        posted_at: get(node, selectors.date),
        description: get(node, selectors.description),
      }));
    }, extract, '{$source}');

    console.log(JSON.stringify(jobs));
  } finally {
    await browser.close();
  }
})();
JS;

        $path = storage_path('app/puppeteer_'.uniqid().'.js');
        file_put_contents($path, $script);

        return $path;
    }

    private function runScript(string $path): ?string
    {
        $nodePath = (string) config('scraper.node_path', 'node');
        $escapedPath = escapeshellarg($path);
        $command = $nodePath.' '.$escapedPath;

        exec($command, $lines, $exitCode);

        if ($exitCode !== 0) {
            Log::warning('HeadlessBrowserScraper script failed', [
                'command' => $command,
                'exit_code' => $exitCode,
            ]);

            return null;
        }

        return implode('', $lines);
    }
}
