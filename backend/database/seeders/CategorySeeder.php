<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'IT & Software',
            'Marketing',
            'Admin',
            'Finance',
            'Design',
            'Sales',
            'Customer Service',
            'Internship',
        ];

        foreach ($categories as $name) {
            Category::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'description' => null]
            );
        }
    }
}
