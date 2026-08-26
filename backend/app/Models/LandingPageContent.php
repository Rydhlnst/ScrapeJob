<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LandingPageContent extends Model
{
    use UsesUuid;

    protected $fillable = [
        'website_id',
        'key',
        'draft_payload',
        'published_payload',
        'updated_by',
        'published_by',
        'published_at',
    ];

    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }

    protected function casts(): array
    {
        return [
            'draft_payload' => 'array',
            'published_payload' => 'array',
            'published_at' => 'datetime',
        ];
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function publishedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    public function hasDraft(): bool
    {
        return is_array($this->draft_payload) && ! empty($this->draft_payload);
    }
}
