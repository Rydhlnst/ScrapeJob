<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebsiteJobContent extends \Illuminate\Database\Eloquent\Model
{
    use UsesUuid;

    protected $fillable = [
        'website_job_id',
        'website_id',
        'job_id',
        'title',
        'slug',
        'description',
        'salary_text',
        'apply_url',
        'category_id',
        'tags',
        'seo_title',
        'seo_description',
    ];

    protected function casts(): array
    {
        return ['tags' => 'array'];
    }

    public function websiteJob(): BelongsTo
    {
        return $this->belongsTo(WebsiteJob::class);
    }

    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
