<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $legacy = DB::table('job_sources')->where('name', 'lokerid')->first();
        $karirExists = DB::table('job_sources')->where('name', 'karir')->exists();

        if ($legacy && ! $karirExists) {
            DB::table('job_sources')->where('id', $legacy->id)->update([
                'name' => 'karir',
                'base_url' => 'https://karir.com',
                'listing_url' => 'https://karir.com/search-lowongan',
                'is_active' => true,
                'scraping_allowed' => true,
                'notes' => 'Built-in Karir.com scraper',
                'updated_at' => now(),
            ]);
        } elseif (! $karirExists) {
            DB::table('job_sources')->insert([
                'id' => (string) Str::uuid(),
                'name' => 'karir',
                'base_url' => 'https://karir.com',
                'listing_url' => 'https://karir.com/search-lowongan',
                'is_active' => true,
                'scraping_allowed' => true,
                'notes' => 'Built-in Karir.com scraper',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('job_sources')->where('name', 'lokerid')->update([
            'is_active' => false,
            'scraping_allowed' => false,
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('job_sources')->where('name', 'lokerid')->update([
            'is_active' => false,
            'scraping_allowed' => false,
            'updated_at' => now(),
        ]);
    }
};
