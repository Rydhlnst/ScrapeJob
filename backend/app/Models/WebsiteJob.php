<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebsiteJob extends \Illuminate\Database\Eloquent\Model
{
    use UsesUuid;

    public const STATUSES = ['unused', 'draft', 'published', 'expired', 'nonaktif'];

    protected $fillable = ['website_id', 'job_id', 'status', 'published_at', 'expired_at'];

    protected function casts(): array
    {
        return ['published_at' => 'datetime', 'expired_at' => 'datetime'];
    }

    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }
}
