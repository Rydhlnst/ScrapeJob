<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Cviebrock\EloquentSluggable\Sluggable;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use Sluggable, UsesUuid;

    protected $fillable = [
        'website_id',
        'title',
        'slug',
        'status',
        'summary',
        'content',
        'seo_title',
        'seo_description',
        'published_at',
    ];

    public function website(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Website::class);
    }

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    public function sluggable(): array
    {
        return [
            'slug' => [
                'source' => 'title',
                'onUpdate' => false,
            ],
        ];
    }
}
