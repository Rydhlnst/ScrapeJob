<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['website_id', 'key', 'value', 'type'];

    public function scopeForWebsite($query, ?string $websiteId)
    {
        return $query->where('website_id', $websiteId);
    }

    public static function get(string $key, mixed $default = null, ?string $websiteId = null): mixed
    {
        $setting = static::where('key', $key)->when($websiteId, fn ($query) => $query->where('website_id', $websiteId), fn ($query) => $query->whereNull('website_id'))->first();
        if (! $setting) return $default;

        return match ($setting->type) {
            'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            'json'    => json_decode($setting->value, true),
            default   => $setting->value,
        };
    }

    public static function set(string $key, mixed $value, string $type = 'string', ?string $websiteId = null): void
    {
        $stored = match ($type) {
            'boolean' => $value ? '1' : '0',
            'json'    => json_encode($value),
            default   => (string) $value,
        };

        static::updateOrCreate(['website_id' => $websiteId, 'key' => $key], ['value' => $stored, 'type' => $type]);
    }
}
