<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['categories', 'pages', 'landing_page_contents', 'settings'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->uuid('website_id')->nullable()->index();
            });
        }

        Schema::table('categories', function (Blueprint $table) {
            $table->dropUnique('categories_slug_unique');
            $table->unique(['website_id', 'slug']);
        });

        Schema::table('pages', function (Blueprint $table) {
            $table->dropUnique('pages_slug_unique');
            $table->unique(['website_id', 'slug']);
        });

        Schema::table('landing_page_contents', function (Blueprint $table) {
            $table->dropUnique('landing_page_contents_key_unique');
            $table->unique(['website_id', 'key']);
        });

        Schema::table('settings', function (Blueprint $table) {
            $table->dropUnique('settings_key_unique');
            $table->unique(['website_id', 'key']);
        });

        $defaultWebsiteId = DB::table('websites')->where('domain', 'lowonganku.com')->value('id');
        foreach (['categories', 'pages', 'landing_page_contents', 'settings'] as $tableName) {
            DB::table($tableName)->whereNull('website_id')->update(['website_id' => $defaultWebsiteId]);
        }
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropUnique('settings_website_id_key_unique');
            $table->unique('key');
            $table->dropColumn('website_id');
        });

        Schema::table('landing_page_contents', function (Blueprint $table) {
            $table->dropUnique('landing_page_contents_website_id_key_unique');
            $table->unique('key');
            $table->dropColumn('website_id');
        });

        Schema::table('pages', function (Blueprint $table) {
            $table->dropUnique('pages_website_id_slug_unique');
            $table->unique('slug');
            $table->dropColumn('website_id');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropUnique('categories_website_id_slug_unique');
            $table->unique('slug');
            $table->dropColumn('website_id');
        });
    }
};
