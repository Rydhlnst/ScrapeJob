<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ApiKey extends Model
{
    protected $fillable = [
        'created_by', 'name', 'key', 'prefix', 'description', 'is_active', 'last_used_at', 'expires_at',
    ];

    protected $casts = [
        'is_active'    => 'boolean',
        'last_used_at' => 'datetime',
        'expires_at'   => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generate(string $name, ?int $createdBy = null, ?string $description = null): array
    {
        $raw = Str::random(48);
        $prefix = Str::upper(Str::random(8));
        $full = "sk_{$prefix}_{$raw}";

        $model = static::create([
            'created_by'  => $createdBy,
            'name'        => $name,
            'key'         => hash('sha256', $full),
            'prefix'      => "sk_{$prefix}",
            'description' => $description,
            'is_active'   => true,
        ]);

        return ['model' => $model, 'plain' => $full];
    }
}
