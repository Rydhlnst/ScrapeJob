<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email    = env('ADMIN_EMAIL');
        $name     = env('ADMIN_NAME', 'Super Admin');
        $password = env('ADMIN_PASSWORD');

        if (! $email || ! $password) {
            $this->command?->warn(
                'ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin user seeding. ' .
                'Set these env vars to create/update the initial admin account.'
            );
            return;
        }

        $admin = User::updateOrCreate(
            ['email' => $email],
            [
                'name'     => $name,
                'password' => Hash::make($password),
            ]
        );

        if (! $admin->hasRole('super_admin')) {
            $admin->assignRole('super_admin');
        }

        $this->command?->info("Admin user ready: {$email}");
    }
}
