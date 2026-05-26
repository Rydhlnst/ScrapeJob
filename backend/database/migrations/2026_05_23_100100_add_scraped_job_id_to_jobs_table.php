<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->uuid('scraped_job_id')->nullable()->after('id');
            $table->index('scraped_job_id');
            $table->foreign('scraped_job_id')->references('id')->on('scraped_jobs')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropForeign(['scraped_job_id']);
            $table->dropIndex(['scraped_job_id']);
            $table->dropColumn('scraped_job_id');
        });
    }
};
