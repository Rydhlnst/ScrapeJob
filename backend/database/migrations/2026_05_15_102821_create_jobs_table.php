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
        Schema::create('jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('title');
            $table->string('slug')->unique();
            $table->text('company_name');
            $table->text('location');
            $table->uuid('category_id')->nullable();
            $table->string('job_type')->nullable();
            $table->string('salary_text')->nullable();
            $table->longText('description');
            $table->longText('raw_description')->nullable();
            $table->text('source_url');
            $table->string('source_url_hash', 64)->unique();
            $table->string('source_name');
            $table->string('content_hash', 64)->nullable();
            $table->enum('status', ['raw', 'draft', 'published', 'rejected', 'duplicate'])->default('draft');
            $table->timestamp('scraped_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
            $table->index('status');
            $table->index('category_id');
            $table->index('job_type');
            $table->index('source_name');
            $table->index('content_hash');
            $table->index('created_at');
            $table->index('published_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
