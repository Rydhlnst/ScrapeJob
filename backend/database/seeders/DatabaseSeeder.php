<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            AdminUserSeeder::class,
            CategorySeeder::class,
            LocationSeeder::class,
            JobSourceSeeder::class,
        ]);

        if (! app()->isProduction()) {
            $this->call([
                JobSeeder::class,
            ]);
        }
    }
}
