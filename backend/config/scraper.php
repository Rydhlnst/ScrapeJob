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

    'python' => [
        'timeout_seconds' => (int) env('SCRAPER_PYTHON_TIMEOUT_SECONDS', 900),
        'bin' => env('SCRAPER_PYTHON_BIN', ''),
        'mode' => env('SCRAPER_PYTHON_MODE', 'local'),
        'docker_bin' => env('SCRAPER_DOCKER_BIN', 'docker'),
        'docker_image' => env('SCRAPER_DOCKER_IMAGE', 'scrapejob-scraper:local'),
        'docker_env_file' => env('SCRAPER_DOCKER_ENV_FILE', base_path('../scraper-service/.env')),
    ],

    'schedule' => [
        'enabled' => (bool) env('SCRAPER_SCHEDULE_ENABLED', true),
        'cron_expression' => env('SCRAPER_SCHEDULE_CRON', '0 */8 * * *'),
        'timezone' => env('SCRAPER_SCHEDULE_TIMEZONE', env('APP_TIMEZONE', 'Asia/Jakarta')),
        'without_overlapping_minutes' => (int) env('SCRAPER_SCHEDULE_WITHOUT_OVERLAPPING_MINUTES', 60),
    ],

    'active_sources' => $parseCsv(env('SCRAPER_ACTIVE_SOURCES'), ['glints', 'jobstreet']),

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
            'list_url' => 'https://glints.com/id/en/opportunities/jobs',
        ],
        'jobstreet' => [
            'base_url' => 'https://www.jobstreet.co.id',
            'list_url' => 'https://www.jobstreet.co.id/id/jobs',
        ],
        'jobstreetexpress' => [
            'base_url' => 'https://id.jora.com',
            'list_url' => 'https://id.jora.com/lowongan-Full-time',
        ],
        'kalibrr' => [
            'base_url' => 'https://www.kalibrr.com',
            'list_url' => 'https://www.kalibrr.com/job-board/te',
        ],
        'lokerid' => [
            'base_url' => 'https://www.loker.id',
            'list_url' => 'https://www.loker.id/cari-lowongan-kerja',
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
