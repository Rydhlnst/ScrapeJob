<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Fase C.1: add a nullable JSON column that stores the TipTap ProseMirror
// document for a job's description. Legacy `description` (HTML) stays put so
// existing readers keep working; new writes populate both, and a backfill
// command fills description_doc for pre-existing rows.
return new class extends Migration {
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->json('description_doc')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropColumn('description_doc');
        });
    }
};
