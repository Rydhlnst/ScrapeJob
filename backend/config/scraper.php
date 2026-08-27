<?php

$parseCsv = static function (?string $value, array $fallback = []): array {
    $raw = trim((string) ($value ?? ''));

    if ($raw === '') {
        return $fallback;
    }

    $items = array_map(static fn (string $item): string => trim($item), explode(',', $raw));
    $items = array_filter($items, static fn (string $item): bool => $item !== '');

    return array_values(array_unique($items));
};

return [
    'use_python_executor' => (bool) env('SCRAPER_USE_PYTHON_EXECUTOR', true),
    'auto_create_drafts' => (bool) env('SCRAPER_AUTO_CREATE_DRAFTS', false),

    'python' => [
        'timeout_seconds' => (int) env('SCRAPER_PYTHON_TIMEOUT_SECONDS', 600),
        'page_timeout_seconds' => (int) env('PAGE_TIMEOUT_SECONDS', 45),
        'detail_timeout_seconds' => (int) env('DETAIL_TIMEOUT_SECONDS', 45),
        'bin' => env('SCRAPER_PYTHON_BIN', ''),
        'mode' => env('SCRAPER_PYTHON_MODE', 'local'),
        'docker_bin' => env('SCRAPER_DOCKER_BIN', 'docker'),
        'docker_image' => env('SCRAPER_DOCKER_IMAGE', 'scrapejob-scraper:local'),
        'docker_env_file' => env('SCRAPER_DOCKER_ENV_FILE', base_path('../scraper-service/.env')),
    ],

    'http_retries' => max(0, min((int) env('HTTP_RETRIES', 3), 5)),
    'scrape_attempts' => max(1, min((int) env('SCRAPE_ATTEMPTS', 2), 3)),
    'firecrawl' => [
        'api_key' => env('FIRECRAWL_API_KEY', ''),
        'api_url' => env('FIRECRAWL_API_URL', 'https://api.firecrawl.dev'),
        'timeout_seconds' => (int) env('FIRECRAWL_TIMEOUT_SECONDS', 60),
        'wait_for_ms' => (int) env('FIRECRAWL_WAIT_FOR_MS', 1000),
    ],

    'schedule' => [
        'enabled' => (bool) env('SCRAPER_SCHEDULE_ENABLED', true),
        'cron_expression' => env('SCRAPER_SCHEDULE_CRON', '0 */8 * * *'),
        'timezone' => env('SCRAPER_SCHEDULE_TIMEZONE', env('APP_TIMEZONE', 'Asia/Jakarta')),
        'without_overlapping_minutes' => (int) env('SCRAPER_SCHEDULE_WITHOUT_OVERLAPPING_MINUTES', 60),
    ],

    'active_sources' => $parseCsv(env('SCRAPER_ACTIVE_SOURCES'), [
        'glints',
        'jobstreet',
        'jobstreetexpress',
        'kalibrr',
        'lokerid',
    ]),

    'notification' => [
        'emails' => $parseCsv(env('SCRAPER_NOTIFY_EMAILS')),
    ],

    'node_path' => env('NODE_PATH', 'node'),
    'puppeteer_timeout' => (int) env('PUPPETEER_TIMEOUT', 120),

    'glints' => [
        'keywords' => $parseCsv(env('GLINTS_KEYWORDS'), ['software engineer', 'backend', 'frontend']),
        'countries' => $parseCsv(env('GLINTS_COUNTRIES'), ['ID']),
    ],

    'jobstreet' => [
        'keywords' => $parseCsv(env('JOBSTREET_KEYWORDS'), ['software', 'developer', 'engineer']),
    ],

    // Built-in examples for extension
    'builtin_sources' => [
        'glints' => [
            'base_url' => 'https://glints.com',
            'list_url' => 'https://glints.com/id/opportunities/jobs/explore',
        ],
        'jobstreet' => [
            'base_url' => 'https://id.jobstreet.com',
            'list_url' => 'https://id.jobstreet.com/id/jobs',
        ],
        'jobstreetexpress' => [
            'base_url' => 'https://id.jora.com',
            'list_url' => 'https://id.jora.com/lowongan-Full-time',
        ],
        'kalibrr' => [
            'base_url' => 'https://www.kalibrr.com',
            'list_url' => 'https://www.kalibrr.com/home/te',
        ],
        'lokerid' => [
            'base_url' => 'https://www.loker.id',
            'list_url' => 'https://www.loker.id/',
        ],
        'example_json' => [
            'type' => 'json',
            'api_url' => 'https://example.com/api/jobs',
            'api_params' => ['page' => 1],
            'json_map' => [
                'list' => 'data',
                'id' => 'id',
                'title' => 'title',
                'company' => 'company',
                'location' => 'location',
                'job_type' => 'job_type',
                'apply_url' => 'url',
                'posted_at' => 'published_at',
            ],
        ],
        'example_html' => [
            'type' => 'html',
            'list_url' => 'https://example.com/jobs',
            'selectors' => [
                'container' => '.job-card',
                'title' => '.job-title',
                'company' => '.company-name',
                'location' => '.location',
                'job_type' => '.employment-type',
                'apply_url' => 'a@href',
                'posted_at' => 'time@datetime',
            ],
        ],
        'example_spa' => [
            'type' => 'headless',
            'target_url' => 'https://example.com/careers',
            'extract' => [
                'waitForSelector' => '.job-list',
                'scrollToBottom' => true,
                'jobs' => [
                    'container' => '.job-card',
                    'title' => '.job-title',
                    'company' => '.company-name',
                    'location' => '.location',
                    'job_type' => '.job-type',
                    'url' => 'a@href',
                    'date' => 'time@datetime',
                ],
            ],
        ],
    ],
];
