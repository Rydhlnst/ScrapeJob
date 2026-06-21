<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('scraped_jobs', function (Blueprint $table) {
            $table->string('draft_status')->default('drafted_raw')->index()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scraped_jobs', function (Blueprint $table) {
            $table->dropColumn('draft_status');
        });
    }
};
