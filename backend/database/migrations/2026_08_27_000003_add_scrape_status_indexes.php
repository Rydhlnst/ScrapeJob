<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scrape_runs', function (Blueprint $table): void {
            $table->index(['status', 'created_at'], 'scrape_runs_status_created_at_index');
        });

        Schema::table('scrape_logs', function (Blueprint $table): void {
            $table->index(['scrape_run_id', 'status', 'created_at'], 'scrape_logs_run_status_created_at_index');
        });
    }

    public function down(): void
    {
        Schema::table('scrape_logs', function (Blueprint $table): void {
            $table->dropIndex('scrape_logs_run_status_created_at_index');
        });

        Schema::table('scrape_runs', function (Blueprint $table): void {
            $table->dropIndex('scrape_runs_status_created_at_index');
        });
    }
};
