<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('websites', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('domain')->unique();
            $table->boolean('is_active')->default(true)->index();
            $table->string('theme')->nullable();
            $table->text('logo')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
        });

        $websites = [
            ['name' => 'Lowonganku.com', 'domain' => 'lowonganku.com'],
            ['name' => 'LowonganPekerjaan.id', 'domain' => 'lowonganpekerjaan.id'],
            ['name' => 'DaftarKerja.id', 'domain' => 'daftarkerja.id'],
            ['name' => 'KerjaResmi.com', 'domain' => 'kerjaresmi.com'],
        ];

        foreach ($websites as $website) {
            DB::table('websites')->insert([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                ...$website,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

    }

    public function down(): void
    {
        Schema::dropIfExists('website_jobs');
        Schema::dropIfExists('websites');
    }
};
