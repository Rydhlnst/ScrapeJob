<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobSource extends Model
{
    use HasFactory, UsesUuid;

    protected $fillable = [
        'name',
        'base_url',
        'listing_url',
        'is_active',
        'scraping_allowed',
        'notes',
        'last_scraped_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'scraping_allowed' => 'boolean',
            'last_scraped_at' => 'datetime',
        ];
    }

    public function scrapeRuns(): HasMany
    {
        return $this->hasMany(ScrapeRun::class);
    }
}
