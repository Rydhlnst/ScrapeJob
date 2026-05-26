<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScrapeRun extends Model
{
    use HasFactory, UsesUuid;

    protected $fillable = [
        'job_source_id',
        'source_name',
        'status',
        'started_at',
        'finished_at',
        'total_found',
        'mapped_count',
        'success_count',
        'duplicate_count',
        'failed_count',
        'error_count',
        'skipped_count',
        'error_message',
        'sample_payloads',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
            'sample_payloads' => 'array',
        ];
    }

    public function jobSource(): BelongsTo
    {
        return $this->belongsTo(JobSource::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scrapeLogs(): HasMany
    {
        return $this->hasMany(ScrapeLog::class);
    }
}
