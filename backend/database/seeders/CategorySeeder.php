<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Website;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $websiteId = Website::query()->where('domain', 'lowonganku.com')->value('id');
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
                ['website_id' => $websiteId, 'slug' => Str::slug($name)],
                ['name' => $name, 'description' => null]
            );
        }
    }
}
