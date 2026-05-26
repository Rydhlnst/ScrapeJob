<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $locations = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Yogyakarta', 'Remote'];

        foreach ($locations as $name) {
            Location::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'province' => null]
            );
        }
    }
}
