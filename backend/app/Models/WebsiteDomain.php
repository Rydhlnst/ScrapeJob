<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebsiteDomain extends \Illuminate\Database\Eloquent\Model
{
    use UsesUuid;

    protected $fillable = ['website_id', 'host', 'is_primary', 'is_active'];

    protected function casts(): array
    {
        return ['is_primary' => 'boolean', 'is_active' => 'boolean'];
    }

    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }
}
