<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->string('fingerprint', 64)->nullable()->after('external_id');
            $table->boolean('notified')->default(false)->after('is_active');

            $table->unique('fingerprint', 'jobs_fingerprint_unique');
            $table->index(['source_name', 'is_active', 'posted_at'], 'jobs_source_active_posted_idx');
            $table->index(['status', 'published_at', 'created_at'], 'jobs_status_published_created_idx');
            $table->index(['notified', 'is_active', 'created_at'], 'jobs_notified_active_created_idx');
        });

        Schema::table('scrape_logs', function (Blueprint $table) {
            $table->index(['scrape_run_id', 'created_at'], 'scrape_logs_run_created_idx');
            $table->index(['status', 'created_at'], 'scrape_logs_status_created_idx');
        });

        Schema::table('scrape_runs', function (Blueprint $table) {
            $table->index(['source_name', 'created_at'], 'scrape_runs_source_created_idx');
            $table->index(['status', 'started_at'], 'scrape_runs_status_started_idx');
        });

        Schema::table('job_sources', function (Blueprint $table) {
            $table->index(['is_active', 'scraping_allowed', 'name'], 'job_sources_active_allowed_name_idx');
        });
    }

    public function down(): void
    {
        Schema::table('job_sources', function (Blueprint $table) {
            $table->dropIndex('job_sources_active_allowed_name_idx');
        });

        Schema::table('scrape_runs', function (Blueprint $table) {
            $table->dropIndex('scrape_runs_source_created_idx');
            $table->dropIndex('scrape_runs_status_started_idx');
        });

        Schema::table('scrape_logs', function (Blueprint $table) {
            $table->dropIndex('scrape_logs_run_created_idx');
            $table->dropIndex('scrape_logs_status_created_idx');
        });

        Schema::table('jobs', function (Blueprint $table) {
            $table->dropIndex('jobs_source_active_posted_idx');
            $table->dropIndex('jobs_status_published_created_idx');
            $table->dropIndex('jobs_notified_active_created_idx');
            $table->dropUnique('jobs_fingerprint_unique');

            $table->dropColumn(['fingerprint', 'notified']);
        });
    }
};
