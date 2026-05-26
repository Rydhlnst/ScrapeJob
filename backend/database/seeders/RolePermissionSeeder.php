<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'view dashboard',
            'view jobs',
            'create jobs',
            'edit jobs',
            'delete jobs',
            'publish jobs',
            'reject jobs',
            'view raw data',
            'manage categories',
            'manage sources',
            'run scraping',
            'view scrape logs',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        $superAdmin = Role::findOrCreate('super_admin');
        $admin = Role::findOrCreate('admin');
        $editor = Role::findOrCreate('editor');

        $superAdmin->syncPermissions($permissions);

        $admin->syncPermissions([
            'view dashboard',
            'view jobs',
            'create jobs',
            'edit jobs',
            'delete jobs',
            'publish jobs',
            'reject jobs',
            'view raw data',
            'manage categories',
            'manage sources',
            'run scraping',
            'view scrape logs',
        ]);

        $editor->syncPermissions([
            'view dashboard',
            'view jobs',
            'create jobs',
            'edit jobs',
            'publish jobs',
            'reject jobs',
            'view raw data',
        ]);
    }
}
