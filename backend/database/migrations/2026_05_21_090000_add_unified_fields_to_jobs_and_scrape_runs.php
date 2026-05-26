<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->string('external_id')->nullable()->after('id');
            $table->string('source', 32)->nullable()->after('external_id');
            $table->json('company_meta')->nullable()->after('company_name');
            $table->string('location_city')->nullable()->after('location');
            $table->string('location_province')->nullable()->after('location_city');
            $table->string('location_country', 2)->default('ID')->after('location_province');
            $table->string('remote_type')->nullable()->after('location_country');
            $table->decimal('salary_min', 15, 2)->nullable()->after('salary_text');
            $table->decimal('salary_max', 15, 2)->nullable()->after('salary_min');
            $table->string('salary_currency', 10)->default('IDR')->after('salary_max');
            $table->string('salary_period', 16)->nullable()->after('salary_currency');
            $table->boolean('salary_is_disclosed')->default(false)->after('salary_period');
            $table->string('experience_level', 32)->nullable()->after('job_type');
            $table->unsignedSmallInteger('experience_years_min')->nullable()->after('experience_level');
            $table->unsignedSmallInteger('experience_years_max')->nullable()->after('experience_years_min');
            $table->string('education_level', 16)->nullable()->after('experience_years_max');
            $table->json('requirements')->nullable()->after('raw_description');
            $table->json('responsibilities')->nullable()->after('requirements');
            $table->json('skills')->nullable()->after('responsibilities');
            $table->json('benefits')->nullable()->after('skills');
            $table->text('apply_url')->nullable()->after('source_url');
            $table->timestamp('posted_at')->nullable()->after('published_at');
            $table->timestamp('expires_at')->nullable()->after('posted_at');
            $table->boolean('is_active')->default(true)->after('expires_at');
            $table->json('tags')->nullable()->after('is_active');
            $table->json('unified_payload')->nullable()->after('tags');

            $table->index('source');
            $table->index('posted_at');
            $table->index('experience_level');
            $table->index('location_city');
            $table->index('is_active');
            $table->index('external_id');
        });

        Schema::table('scrape_runs', function (Blueprint $table) {
            $table->unsignedInteger('mapped_count')->default(0)->after('total_found');
            $table->unsignedInteger('error_count')->default(0)->after('failed_count');
            $table->json('sample_payloads')->nullable()->after('error_message');
        });
    }

    public function down(): void
    {
        Schema::table('scrape_runs', function (Blueprint $table) {
            $table->dropColumn(['mapped_count', 'error_count', 'sample_payloads']);
        });

        Schema::table('jobs', function (Blueprint $table) {
            $table->dropIndex(['source']);
            $table->dropIndex(['posted_at']);
            $table->dropIndex(['experience_level']);
            $table->dropIndex(['location_city']);
            $table->dropIndex(['is_active']);
            $table->dropIndex(['external_id']);

            $table->dropColumn([
                'external_id',
                'source',
                'company_meta',
                'location_city',
                'location_province',
                'location_country',
                'remote_type',
                'salary_min',
                'salary_max',
                'salary_currency',
                'salary_period',
                'salary_is_disclosed',
                'experience_level',
                'experience_years_min',
                'experience_years_max',
                'education_level',
                'requirements',
                'responsibilities',
                'skills',
                'benefits',
                'apply_url',
                'posted_at',
                'expires_at',
                'is_active',
                'tags',
                'unified_payload',
            ]);
        });
    }
};
