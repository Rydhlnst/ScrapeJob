<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Cviebrock\EloquentSluggable\Sluggable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Job extends Model
{
    use HasFactory, Sluggable, UsesUuid;

    protected $fillable = [
        'scraped_job_id',
        'external_id',
        'fingerprint',
        'source',
        'title',
        'slug',
        'company_name',
        'company_meta',
        'company_logo_url',
        'location',
        'location_city',
        'location_province',
        'location_country',
        'remote_type',
        'category_id',
        'job_type',
        'salary_text',
        'salary_min',
        'salary_max',
        'salary_currency',
        'salary_period',
        'salary_is_disclosed',
        'experience_level',
        'experience_years_min',
        'experience_years_max',
        'education_level',
        'description',
        'description_doc',
        'raw_description',
        'requirements',
        'responsibilities',
        'skills',
        'benefits',
        'apply_url',
        'source_url',
        'source_url_hash',
        'source_name',
        'content_hash',
        'status',
        'scraped_at',
        'published_at',
        'posted_at',
        'expires_at',
        'is_active',
        'notified',
        'tags',
        'unified_payload',
    ];

    protected function casts(): array
    {
        return [
            'scraped_at' => 'datetime',
            'published_at' => 'datetime',
            'posted_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
            'notified' => 'boolean',
            'salary_is_disclosed' => 'boolean',
            'requirements' => 'array',
            'responsibilities' => 'array',
            'skills' => 'array',
            'benefits' => 'array',
            'tags' => 'array',
            'company_meta' => 'array',
            'unified_payload' => 'array',
            'description_doc' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::created(function (Job $job): void {
            Website::query()->where('is_active', true)->each(function (Website $website) use ($job): void {
                $status = $website->domain === 'lowonganku.com' && $job->status === 'published'
                    ? 'published'
                    : 'unused';
                WebsiteJob::query()->firstOrCreate(
                    ['website_id' => $website->id, 'job_id' => $job->id],
                    ['status' => $status, 'published_at' => $status === 'published' ? ($job->published_at ?? now()) : null],
                );
            });
        });
    }

    public function sluggable(): array
    {
        return [
            'slug' => [
                'source' => ['title', 'company_name', 'location'],
            ],
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function websiteJobs(): HasMany
    {
        return $this->hasMany(WebsiteJob::class);
    }

    public function scopeUnnotified($query)
    {
        return $query->where('notified', false)->where('is_active', true);
    }

    public static function makeFingerprint(
        string $source,
        string $title,
        string $company,
        ?string $location = ''
    ): string {
        return hash('sha256', strtolower(trim($source.'|'.$title.'|'.$company.'|'.($location ?? ''))));
    }
}
