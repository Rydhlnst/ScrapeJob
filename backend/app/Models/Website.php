<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Website extends \Illuminate\Database\Eloquent\Model
{
    use HasFactory, UsesUuid;

    protected $fillable = ['name', 'domain', 'is_active', 'theme', 'logo', 'settings'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'settings' => 'array'];
    }

    public function websiteJobs(): HasMany
    {
        return $this->hasMany(WebsiteJob::class);
    }

    public function normalizeDomain(string $domain): string
    {
        $domain = strtolower(trim($domain));
        $domain = preg_replace('#^https?://#', '', $domain) ?? $domain;
        return trim(explode('/', $domain, 2)[0]);
    }
}
