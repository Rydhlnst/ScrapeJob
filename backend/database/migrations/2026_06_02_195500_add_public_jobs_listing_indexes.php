<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->index(['status', 'is_active', 'published_at', 'created_at'], 'jobs_public_listing_idx');
            $table->index(['status', 'is_active', 'category_id', 'published_at'], 'jobs_public_category_idx');
            $table->index(['status', 'is_active', 'job_type', 'published_at'], 'jobs_public_job_type_idx');
            $table->index(['status', 'is_active', 'source_name', 'published_at'], 'jobs_public_source_idx');
            $table->index(['status', 'is_active', 'company_name'], 'jobs_public_company_idx');
        });
    }

    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropIndex('jobs_public_listing_idx');
            $table->dropIndex('jobs_public_category_idx');
            $table->dropIndex('jobs_public_job_type_idx');
            $table->dropIndex('jobs_public_source_idx');
            $table->dropIndex('jobs_public_company_idx');
        });
    }
};
