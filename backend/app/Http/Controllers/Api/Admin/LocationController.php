<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LocationController extends Controller
{
    public function index()
    {
        $locations = Location::query()->orderBy('name')->paginate(50);

        return ApiResponse::paginated($locations, LocationResource::collection($locations)->resolve(), 'Locations retrieved successfully');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:locations,slug'],
            'province' => ['nullable', 'string', 'max:255'],
        ]);

        $data['slug'] = $this->uniqueSlug($data['slug'] ?? Str::slug($data['name']));

        $location = Location::query()->create($data);

        return ApiResponse::success(new LocationResource($location), 'Location created successfully', 201);
    }

    public function show(Location $location)
    {
        return ApiResponse::success(new LocationResource($location), 'Location retrieved successfully');
    }

    public function update(Request $request, Location $location)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255'],
            'province' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        if (array_key_exists('slug', $data)) {
            $desired = $data['slug'] ?: Str::slug($data['name'] ?? $location->name);
            if ($desired !== $location->slug) {
                $data['slug'] = $this->uniqueSlug($desired, $location->id);
            }
        }

        $location->update($data);

        return ApiResponse::success(new LocationResource($location->refresh()), 'Location updated successfully');
    }

    public function destroy(Location $location)
    {
        $location->delete();

        return ApiResponse::success(null, 'Location deleted successfully');
    }

    private function uniqueSlug(string $desired, ?string $ignoreId = null): string
    {
        $base = Str::slug($desired) ?: 'location';
        $candidate = $base;
        $i = 2;
        while (
            Location::query()
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->where('slug', $candidate)
                ->exists()
        ) {
            $candidate = "{$base}-{$i}";
            $i++;
        }

        return $candidate;
    }
}
