<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scraped_jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('external_id')->unique();
            $table->string('source', 50)->index();
            $table->text('source_url');
            $table->string('role_keyword')->nullable();
            $table->text('title');
            $table->string('company', 191);
            $table->string('location')->nullable()->index();
            $table->string('salary')->nullable();
            $table->string('employment_type')->nullable();
            $table->longText('description')->nullable();
            $table->text('description_summary')->nullable();
            $table->date('posted_date')->nullable()->index();
            $table->timestamp('scraped_at')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'duplicate', 'published'])->default('pending')->index();
            $table->json('raw_json')->nullable();
            $table->timestamps();

            $table->index('company');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scraped_jobs');
    }
};
