<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ScrapedJob extends Model
{
    use HasFactory, UsesUuid;

    protected $fillable = [
        'external_id',
        'source',
        'source_url',
        'role_keyword',
        'title',
        'company',
        'location',
        'salary',
        'employment_type',
        'description',
        'description_summary',
        'posted_date',
        'scraped_at',
        'status',
        'draft_status',
        'fail_reason',
        'raw_json',
    ];

    protected function casts(): array
    {
        return [
            'posted_date' => 'date',
            'scraped_at' => 'datetime',
            'raw_json' => 'array',
        ];
    }

    public function job(): HasOne
    {
        return $this->hasOne(Job::class);
    }
}
