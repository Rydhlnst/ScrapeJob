<?php

namespace App\Services\Jobs;

use Illuminate\Support\Str;

class JobNormalizationService
{
    public function normalizeString(?string $value): string
    {
        return Str::lower(trim(preg_replace('/\s+/', ' ', (string) $value) ?? ''));
    }

    public function sanitizeDescription(?string $description): string
    {
        $allowedTags = '<p><br><ul><ol><li><strong><b><em><i><a><h2><h3><h4><blockquote>';

        return trim(strip_tags((string) $description, $allowedTags));
    }

    public function parseSalary(string $text): array
    {
        $normalized = $this->normalizeString($text);
        preg_match_all('/\d+[\.,]?\d*/', $normalized, $matches);
        $numbers = array_map(static fn ($n) => (float) str_replace(',', '.', $n), $matches[0] ?? []);

        $multiplier = str_contains($normalized, 'jt') ? 1000000 : 1;
        $numbers = array_map(static fn ($n) => (int) round($n * $multiplier), $numbers);

        return [
            'min' => $numbers[0] ?? null,
            'max' => $numbers[1] ?? ($numbers[0] ?? null),
            'currency' => 'IDR',
            'period' => str_contains($normalized, 'tahun') ? 'yearly' : (str_contains($normalized, 'bulan') ? 'monthly' : null),
            'is_disclosed' => ! empty($numbers),
        ];
    }

    public function parseLocation(string $location): array
    {
        $parts = array_values(array_filter(array_map('trim', explode(',', $location))));

        return [
            'city' => $parts[0] ?? null,
            'province' => $parts[1] ?? null,
        ];
    }

    public function parseExperience(string $text): array
    {
        $normalized = $this->normalizeString($text);
        preg_match_all('/\d+/', $normalized, $matches);
        $years = array_map('intval', $matches[0] ?? []);

        return [
            'min' => $years[0] ?? null,
            'max' => $years[1] ?? ($years[0] ?? null),
            'level' => $this->mapExperienceLevel($normalized),
        ];
    }

    public function detectRemoteType(string $text): ?string
    {
        $normalized = $this->normalizeString($text);
        if (str_contains($normalized, 'hybrid')) {
            return 'hybrid';
        }
        if (str_contains($normalized, 'remote')) {
            return 'remote';
        }
        if (str_contains($normalized, 'onsite') || str_contains($normalized, 'on site')) {
            return 'onsite';
        }

        return null;
    }

    public function mapJobType(string $text): string
    {
        $normalized = $this->normalizeString($text);

        return match (true) {
            str_contains($normalized, 'part') => 'part_time',
            str_contains($normalized, 'contract') => 'contract',
            str_contains($normalized, 'intern') => 'internship',
            str_contains($normalized, 'freelance') => 'freelance',
            default => 'full_time',
        };
    }

    public function mapExperienceLevel(string $text): ?string
    {
        return match (true) {
            str_contains($text, 'entry') || str_contains($text, 'junior') => 'entry',
            str_contains($text, 'mid') => 'mid',
            str_contains($text, 'senior') => 'senior',
            str_contains($text, 'lead') => 'lead',
            str_contains($text, 'manager') || str_contains($text, 'head') || str_contains($text, 'director') => 'executive',
            default => null,
        };
    }

    public function mapEducation(string $text): ?string
    {
        $normalized = $this->normalizeString($text);

        return match (true) {
            str_contains($normalized, 'sma'), str_contains($normalized, 'smk') => 'SMA/SMK',
            str_contains($normalized, 'd3') => 'D3',
            str_contains($normalized, 's1'), str_contains($normalized, 'sarjana') => 'S1',
            str_contains($normalized, 's2'), str_contains($normalized, 'magister') => 'S2',
            str_contains($normalized, 's3'), str_contains($normalized, 'doktor') => 'S3',
            default => null,
        };
    }

    public function extractBullets(string $text): array
    {
        $clean = strip_tags($text);
        $lines = preg_split('/\r\n|\r|\n|\.|;/', $clean) ?: [];

        return array_values(array_slice(array_filter(array_map(static fn ($line) => trim($line), $lines)), 0, 8));
    }

    public function extractSkills(string $description): array
    {
        $known = ['php', 'laravel', 'javascript', 'typescript', 'sql', 'excel', 'seo', 'react'];
        $normalized = $this->normalizeString(strip_tags($description));

        return array_values(array_filter($known, static fn ($skill) => str_contains($normalized, $skill)));
    }

    public function extractBenefits(string $description): array
    {
        $bullets = $this->extractBullets($description);

        return array_values(array_filter($bullets, static fn ($line) => preg_match('/bpjs|asuransi|bonus|insentif|cuti|tunjangan/i', $line) === 1));
    }
}
