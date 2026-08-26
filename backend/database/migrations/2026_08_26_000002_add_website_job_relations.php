<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('website_jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('website_id');
            $table->uuid('job_id');
            $table->enum('status', ['unused', 'draft', 'published', 'expired', 'nonaktif'])->default('unused');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamps();

            $table->foreign('website_id')->references('id')->on('websites')->cascadeOnDelete();
            $table->foreign('job_id')->references('id')->on('jobs')->cascadeOnDelete();
            $table->unique(['website_id', 'job_id']);
            $table->index(['website_id', 'status']);
            $table->index(['job_id', 'status']);
        });

        $defaultWebsiteId = DB::table('websites')->where('domain', 'lowonganku.com')->value('id');
        if (! $defaultWebsiteId) {
            return;
        }

        foreach (['categories', 'pages', 'landing_page_contents', 'settings'] as $tableName) {
            if (Schema::hasColumn($tableName, 'website_id')) {
                DB::table($tableName)->whereNull('website_id')->update(['website_id' => $defaultWebsiteId]);
            }
        }

        DB::table('jobs')->orderBy('id')->eachById(function ($job) use ($defaultWebsiteId): void {
            $status = match ($job->status) {
                'published' => 'published',
                'draft' => 'draft',
                default => 'unused',
            };

            DB::table('website_jobs')->insertOrIgnore([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'website_id' => $defaultWebsiteId,
                'job_id' => $job->id,
                'status' => $status,
                'published_at' => $status === 'published' ? ($job->published_at ?? now()) : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('website_jobs');
    }
};
