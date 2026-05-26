<?php

namespace App\Services\Jobs;

use Illuminate\Support\Str;

class JobHashService
{
    public function makeContentHash(string $title, string $companyName, string $location): string
    {
        return hash('sha256', $this->normalize($title).'|'.$this->normalize($companyName).'|'.$this->normalize($location));
    }

    public function makeSourceUrlHash(string $sourceUrl): string
    {
        return hash('sha256', $this->normalize($sourceUrl));
    }

    private function normalize(string $value): string
    {
        return Str::lower(trim($value));
    }
}
