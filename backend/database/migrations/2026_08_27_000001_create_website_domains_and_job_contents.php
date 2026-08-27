<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('website_domains', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('website_id');
            $table->string('host')->unique();
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->foreign('website_id')->references('id')->on('websites')->cascadeOnDelete();
            $table->index(['website_id', 'is_active']);
        });

        $websites = DB::table('websites')->get(['id', 'domain']);
        foreach ($websites as $website) {
            $host = strtolower(trim((string) $website->domain));
            DB::table('website_domains')->insert([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'website_id' => $website->id,
                'host' => $host,
                'is_primary' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if (! str_starts_with($host, 'www.')) {
                DB::table('website_domains')->insert([
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'website_id' => $website->id,
                    'host' => 'www.'.$host,
                    'is_primary' => false,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        Schema::create('website_job_contents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('website_job_id')->unique();
            $table->uuid('website_id');
            $table->uuid('job_id');
            $table->text('title')->nullable();
            $table->string('slug')->nullable();
            $table->longText('description')->nullable();
            $table->string('salary_text')->nullable();
            $table->text('apply_url')->nullable();
            $table->uuid('category_id')->nullable();
            $table->json('tags')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();

            $table->foreign('website_job_id')->references('id')->on('website_jobs')->cascadeOnDelete();
            $table->foreign('website_id')->references('id')->on('websites')->cascadeOnDelete();
            $table->foreign('job_id')->references('id')->on('jobs')->cascadeOnDelete();
            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
            $table->index(['website_id', 'job_id']);
            $table->index(['website_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('website_job_contents');
        Schema::dropIfExists('website_domains');
    }
};
